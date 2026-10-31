import math
import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole, AccountStatus, ROLE_DEFAULT_PERMISSIONS
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserApprovalRequest,
    UserRejectionRequest,
    UserSuspensionRequest,
)
from app.schemas.common import PaginatedData
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash
from app.core.exceptions import NotFoundException, ConflictException, BusinessRuleException


class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
        existing = await UserRepository.get_by_email(db, user_in.email)
        if existing:
            raise ConflictException(
                message=f"User with email '{user_in.email}' already exists",
                error_code="EMAIL_ALREADY_EXISTS",
            )

        hashed_pw = get_password_hash(user_in.password)
        user = User(
            email=user_in.email.lower().strip(),
            full_name=user_in.full_name.strip(),
            phone=user_in.phone.strip() if user_in.phone else None,
            hashed_password=hashed_pw,
            role=user_in.role,
            account_status=AccountStatus.APPROVED,
            auth_provider="LOCAL",
            is_active=True,
            is_superuser=(user_in.role == UserRole.ADMIN),
            permissions=ROLE_DEFAULT_PERMISSIONS.get(user_in.role, []),
        )
        return await UserRepository.create(db, user)

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User:
        user = await UserRepository.get_by_id(db, user_id)
        if not user:
            raise NotFoundException(message="User not found", error_code="USER_NOT_FOUND")
        return user

    @staticmethod
    async def update_user(db: AsyncSession, user_id: uuid.UUID, update_in: UserUpdate) -> User:
        user = await UserService.get_user_by_id(db, user_id)

        if update_in.full_name is not None:
            user.full_name = update_in.full_name.strip()
        if update_in.phone is not None:
            user.phone = update_in.phone.strip() if update_in.phone else None
        if update_in.role is not None:
            user.role = update_in.role
            user.is_superuser = (update_in.role == UserRole.ADMIN)
            user.permissions = ROLE_DEFAULT_PERMISSIONS.get(update_in.role, [])
        if update_in.account_status is not None:
            user.account_status = update_in.account_status

        return await UserRepository.update(db, user)

    @staticmethod
    async def approve_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        current_admin_id: uuid.UUID,
        approve_in: UserApprovalRequest,
    ) -> User:
        """Approves a registered user, assigns operational role, records admin approval, and initializes permissions."""
        user = await UserService.get_user_by_id(db, user_id)
        user.account_status = AccountStatus.APPROVED
        user.role = approve_in.role
        user.is_superuser = (approve_in.role == UserRole.ADMIN)
        user.approved_by_id = current_admin_id
        user.approved_at = datetime.now(timezone.utc)
        user.rejection_reason = None
        user.suspended_at = None
        user.is_active = True

        # Assign permissions (default for role or custom provided)
        perms = approve_in.permissions or ROLE_DEFAULT_PERMISSIONS.get(approve_in.role, [])
        user.permissions = perms

        updated_user = await UserRepository.update(db, user)

        # Mark registration notification as read and notify the user
        try:
            from app.models.system import Notification
            from sqlalchemy import update
            await db.execute(
                update(Notification)
                .where(Notification.reference_id == user.id, Notification.event_type == "USER_REGISTRATION")
                .values(is_read=True)
            )
            notif = Notification(
                user_id=user.id,
                title="Account Approved!",
                message=f"Your account has been approved with role {approve_in.role.value}. You can now access your dashboard.",
                event_type="ACCOUNT_APPROVED",
                reference_id=user.id,
                is_read=False,
            )
            db.add(notif)
            await db.commit()
        except Exception:
            pass

        return updated_user

    @staticmethod
    async def reject_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        reject_in: UserRejectionRequest,
    ) -> User:
        """Rejects a pending user with an optional explanation message."""
        user = await UserService.get_user_by_id(db, user_id)
        user.account_status = AccountStatus.REJECTED
        user.rejection_reason = reject_in.reason or "Account application rejected by administrator."
        return await UserRepository.update(db, user)

    @staticmethod
    async def suspend_user(
        db: AsyncSession,
        user_id: uuid.UUID,
        current_admin_id: uuid.UUID,
        suspend_in: UserSuspensionRequest,
    ) -> User:
        """Suspends user access with an audit timestamp and reason."""
        if user_id == current_admin_id:
            raise BusinessRuleException(
                message="Administrators cannot suspend their own account",
                error_code="CANNOT_SUSPEND_SELF",
            )
        user = await UserService.get_user_by_id(db, user_id)
        user.account_status = AccountStatus.SUSPENDED
        user.suspended_at = datetime.now(timezone.utc)
        user.rejection_reason = suspend_in.reason or "Account suspended by administrator."
        return await UserRepository.update(db, user)

    @staticmethod
    async def reactivate_user(db: AsyncSession, user_id: uuid.UUID) -> User:
        """Restores a suspended or rejected user back to APPROVED status."""
        user = await UserService.get_user_by_id(db, user_id)
        user.account_status = AccountStatus.APPROVED
        user.suspended_at = None
        user.rejection_reason = None
        user.is_active = True
        if not user.permissions:
            user.permissions = ROLE_DEFAULT_PERMISSIONS.get(user.role, [])
        return await UserRepository.update(db, user)

    @staticmethod
    async def update_status(
        db: AsyncSession,
        user_id: uuid.UUID,
        current_user_id: uuid.UUID,
        is_active: bool,
    ) -> User:
        if user_id == current_user_id and not is_active:
            raise BusinessRuleException(
                message="Administrators cannot deactivate their own account",
                error_code="CANNOT_DEACTIVATE_SELF",
            )

        user = await UserService.get_user_by_id(db, user_id)
        user.is_active = is_active
        return await UserRepository.update(db, user)

    @staticmethod
    async def list_users(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        role: Optional[UserRole] = None,
        account_status: Optional[AccountStatus] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> PaginatedData[UserResponse]:
        skip = (page - 1) * size
        users, total = await UserRepository.list_users(
            db,
            skip=skip,
            limit=size,
            role=role,
            account_status=account_status,
            is_active=is_active,
            search=search,
        )
        total_pages = math.ceil(total / size) if total > 0 else 0

        user_responses = [UserResponse.model_validate(u) for u in users]
        return PaginatedData(
            items=user_responses,
            total=total,
            page=page,
            size=size,
            total_pages=total_pages,
        )
