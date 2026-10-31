import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import httpx

from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    generate_numeric_otp,
)
from app.core.exceptions import (
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
    ConflictException,
)
from app.models.user import User, PasswordResetOTP, UserRole, AccountStatus, ROLE_DEFAULT_PERMISSIONS
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    UserRegisterRequest,
    GoogleAuthRequest,
    ChangePasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
)
from app.repositories.user_repository import UserRepository

logger = logging.getLogger("auth_service")


class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, reg_in: UserRegisterRequest) -> TokenResponse:
        """Creates a new registered user account with PENDING approval status and returns access token."""
        email_clean = reg_in.email.lower().strip()
        existing = await UserRepository.get_by_email(db, email_clean)
        if existing:
            raise ConflictException(
                message=f"An account with email '{email_clean}' is already registered.",
                error_code="EMAIL_ALREADY_EXISTS",
            )

        hashed_pw = get_password_hash(reg_in.password)
        new_user = User(
            email=email_clean,
            full_name=reg_in.full_name.strip(),
            hashed_password=hashed_pw,
            role=UserRole.SALES,  # Unassigned default until Admin approval
            account_status=AccountStatus.PENDING,
            auth_provider="LOCAL",
            is_active=True,
            is_superuser=False,
            permissions=[],
        )
        saved = await UserRepository.create(db, new_user)
        logger.info(f"New user registered (PENDING approval): {saved.email}")

        access_token = create_access_token(subject=str(saved.id))
        refresh_token = create_refresh_token(subject=str(saved.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            account_status=AccountStatus.PENDING,
            user=UserResponse.model_validate(saved),
        )

    @staticmethod
    async def authenticate_user(db: AsyncSession, login_in: LoginRequest) -> TokenResponse:
        user = await UserRepository.get_by_email(db, login_in.email)
        if not user or not verify_password(login_in.password, user.hashed_password):
            raise UnauthorizedException(
                message="Invalid email or password",
                error_code="INVALID_CREDENTIALS",
            )

        if not user.is_active:
            raise UnauthorizedException(
                message="Your account has been deactivated. Please contact an administrator.",
                error_code="ACCOUNT_INACTIVE",
            )

        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            account_status=user.account_status,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def authenticate_google(db: AsyncSession, google_in: GoogleAuthRequest) -> TokenResponse:
        """Verifies Google identity, finds or registers the user as PENDING, and issues session tokens."""
        email = None
        full_name = None
        google_id = None

        # Verify Google token if token provided
        if google_in.credential:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        f"https://oauth2.googleapis.com/tokeninfo?id_token={google_in.credential}"
                    )
                    if resp.status_code == 200:
                        payload = resp.json()
                        email = payload.get("email")
                        full_name = payload.get("name") or payload.get("given_name")
                        google_id = payload.get("sub")
                    else:
                        logger.warning(f"Google tokeninfo response: {resp.status_code} {resp.text}")
            except Exception as e:
                logger.error(f"Failed to verify Google token: {e}")

        # Fallback to direct client details if tokeninfo didn't resolve (e.g. testing mode)
        if not email and google_in.email:
            email = str(google_in.email).lower().strip()
            full_name = google_in.full_name or "Google User"
            google_id = google_in.google_id or f"google_{uuid.uuid4().hex[:12]}"

        if not email:
            raise UnauthorizedException(
                message="Unable to verify Google credentials. Please try standard login.",
                error_code="GOOGLE_AUTH_FAILED",
            )

        email_clean = email.lower().strip()

        # Check existing user by email or google_id
        user = await UserRepository.get_by_email(db, email_clean)
        if not user and google_id:
            user = await UserRepository.get_by_google_id(db, google_id)

        if not user:
            # Register new Google user as PENDING
            dummy_pw = get_password_hash(uuid.uuid4().hex)
            new_user = User(
                email=email_clean,
                full_name=full_name or "Google User",
                hashed_password=dummy_pw,
                role=UserRole.SALES,
                account_status=AccountStatus.PENDING,
                auth_provider="GOOGLE",
                google_id=google_id,
                is_active=True,
                is_superuser=False,
                permissions=[],
            )
            user = await UserRepository.create(db, new_user)
            logger.info(f"New Google user registered (PENDING): {user.email}")
        else:
            # Link google_id if not present
            if google_id and not user.google_id:
                user.google_id = google_id
                user.auth_provider = "GOOGLE"
                await UserRepository.update(db, user)

        if not user.is_active:
            raise UnauthorizedException(
                message="Your account has been deactivated. Please contact an administrator.",
                error_code="ACCOUNT_INACTIVE",
            )

        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            account_status=user.account_status,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def refresh_tokens(db: AsyncSession, refresh_token_str: str) -> TokenResponse:
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise UnauthorizedException(
                message="Invalid token type provided for refresh",
                error_code="INVALID_TOKEN_TYPE",
            )

        user_id_str = payload.get("sub")
        try:
            user_id = uuid.UUID(user_id_str)
        except (ValueError, TypeError):
            raise UnauthorizedException(message="Invalid token subject", error_code="TOKEN_SUBJECT_INVALID")

        user = await UserRepository.get_by_id(db, user_id)
        if not user or not user.is_active:
            raise UnauthorizedException(message="User not found or inactive", error_code="USER_INACTIVE")

        new_access_token = create_access_token(subject=str(user.id))
        new_refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            account_status=user.account_status,
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    async def change_password(db: AsyncSession, user: User, change_in: ChangePasswordRequest) -> None:
        if not verify_password(change_in.current_password, user.hashed_password):
            raise BadRequestException(
                message="Current password does not match",
                error_code="INCORRECT_CURRENT_PASSWORD",
            )

        user.hashed_password = get_password_hash(change_in.new_password)
        await UserRepository.update(db, user)

    @staticmethod
    async def request_password_reset_otp(db: AsyncSession, email: str) -> ForgotPasswordResponse:
        user = await UserRepository.get_by_email(db, email)
        if not user:
            # Mask user existence for security
            return ForgotPasswordResponse(
                message="If the email exists in our system, a 6-digit OTP has been sent.",
                dev_otp=None,
            )

        otp_code = generate_numeric_otp(6)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        otp = PasswordResetOTP(
            user_id=user.id,
            otp_code=otp_code,
            expires_at=expires_at,
            attempts=0,
            is_used=False,
        )
        await UserRepository.create_otp(db, otp)

        logger.info(f"Password reset OTP generated for {user.email}: {otp_code}")
        dev_otp = otp_code if (settings.DEBUG or settings.ENVIRONMENT == "development") else None
        return ForgotPasswordResponse(
            message="Verification OTP has been sent to your registered email.",
            dev_otp=dev_otp,
        )

    @staticmethod
    async def reset_password_with_otp(db: AsyncSession, reset_in: ResetPasswordRequest) -> None:
        user = await UserRepository.get_by_email(db, reset_in.email)
        if not user:
            raise NotFoundException(message="User not found", error_code="USER_NOT_FOUND")

        otp = await UserRepository.get_latest_valid_otp(db, user.id)
        if not otp:
            raise BadRequestException(
                message="Reset token has expired or is invalid. Please request a new OTP.",
                error_code="OTP_EXPIRED_OR_INVALID",
            )

        if otp.otp_code != reset_in.otp_code.strip():
            otp.attempts += 1
            if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
                await UserRepository.mark_otp_used(db, otp)
                raise BadRequestException(
                    message="Too many failed OTP attempts. Please request a new OTP.",
                    error_code="MAX_OTP_ATTEMPTS_EXCEEDED",
                )
            await UserRepository.update(db, user)
            raise BadRequestException(
                message=f"Invalid OTP code. {settings.OTP_MAX_ATTEMPTS - otp.attempts} attempts remaining.",
                error_code="INVALID_OTP",
            )

        await UserRepository.mark_otp_used(db, otp)
        user.hashed_password = get_password_hash(reset_in.new_password)
        await UserRepository.update(db, user)
        logger.info(f"Password reset completed for user {user.email}")
