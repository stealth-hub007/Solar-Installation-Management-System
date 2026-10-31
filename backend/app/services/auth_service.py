import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

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
)
from app.models.user import User, PasswordResetOTP
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    UserResponse,
    ChangePasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
)
from app.repositories.user_repository import UserRepository

logger = logging.getLogger("auth_service")


class AuthService:
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
            # Prevent email enumeration while maintaining standard response
            return ForgotPasswordResponse(
                message="If the email is registered, a password reset OTP has been sent."
            )

        if not user.is_active:
            raise BadRequestException(
                message="Account is deactivated. Cannot initiate password reset.",
                error_code="ACCOUNT_INACTIVE",
            )

        otp_code = generate_numeric_otp(6)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        otp_record = PasswordResetOTP(
            user_id=user.id,
            otp_code=otp_code,
            expires_at=expires_at,
            attempts=0,
            is_used=False,
        )
        await UserRepository.create_otp(db, otp_record)

        # Log OTP securely for development/testing
        logger.info(f"[SECURE_OTP_DELIVERY] Password reset OTP for {user.email}: {otp_code} (Valid for {settings.OTP_EXPIRE_MINUTES} mins)")

        dev_otp = otp_code if settings.DEBUG else None
        return ForgotPasswordResponse(
            message="Password reset OTP has been dispatched to your email address.",
            dev_otp=dev_otp,
        )

    @staticmethod
    async def reset_password_with_otp(db: AsyncSession, reset_in: ResetPasswordRequest) -> None:
        user = await UserRepository.get_by_email(db, reset_in.email)
        if not user:
            raise NotFoundException(message="User not found", error_code="USER_NOT_FOUND")

        latest_otp = await UserRepository.get_latest_valid_otp(db, user.id)
        if not latest_otp:
            raise BadRequestException(
                message="No valid OTP found or OTP has expired. Please request a new OTP.",
                error_code="OTP_EXPIRED_OR_NOT_FOUND",
            )

        if latest_otp.attempts >= settings.OTP_MAX_ATTEMPTS:
            await UserRepository.mark_otp_used(db, latest_otp)
            raise BadRequestException(
                message="Maximum OTP attempts exceeded. Please request a new OTP.",
                error_code="OTP_MAX_ATTEMPTS_EXCEEDED",
            )

        if latest_otp.otp_code != reset_in.otp_code.strip():
            await UserRepository.increment_otp_attempts(db, latest_otp)
            remaining = settings.OTP_MAX_ATTEMPTS - latest_otp.attempts
            raise BadRequestException(
                message=f"Invalid OTP code entered. Remaining attempts: {remaining}",
                error_code="INVALID_OTP",
            )

        # OTP is correct -> mark used and update password
        await UserRepository.mark_otp_used(db, latest_otp)
        user.hashed_password = get_password_hash(reset_in.new_password)
        await UserRepository.update(db, user)

