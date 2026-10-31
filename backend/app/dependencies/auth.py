from typing import List, Optional
import uuid
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole, AccountStatus
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_current_authenticated_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency extracting the valid authenticated user without asserting approval status.
    Used for profile and status checks during pending/review states."""
    if not token:
        raise UnauthorizedException(
            message="Authentication credentials were not provided",
            error_code="AUTHENTICATION_REQUIRED",
        )

    payload = decode_token(token)
    if payload.get("type") != "access":
        raise UnauthorizedException(
            message="Invalid token type provided for authorization",
            error_code="INVALID_TOKEN_TYPE",
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedException(
            message="Authentication token missing user identification",
            error_code="TOKEN_SUBJECT_MISSING",
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise UnauthorizedException(
            message="Malformed user identifier in token",
            error_code="MALFORMED_TOKEN_SUBJECT",
        )

    user = await UserRepository.get_by_id(db, user_id)
    if not user:
        raise UnauthorizedException(
            message="The user belonging to this token no longer exists",
            error_code="USER_NOT_FOUND",
        )

    if not user.is_active:
        raise UnauthorizedException(
            message="User account has been deactivated",
            error_code="ACCOUNT_INACTIVE",
        )

    return user


async def get_current_user(
    user: User = Depends(get_current_authenticated_user),
) -> User:
    """Enforces that the current authenticated user has an APPROVED account status."""
    if user.account_status == AccountStatus.PENDING:
        raise ForbiddenException(
            message="Your account is currently under review by an administrator. Please wait for role approval.",
            error_code="ACCOUNT_PENDING_APPROVAL",
        )
    if user.account_status == AccountStatus.REJECTED:
        reason = user.rejection_reason or "Account application was not approved."
        raise ForbiddenException(
            message=f"Your account registration has been rejected: {reason}",
            error_code="ACCOUNT_REJECTED",
        )
    if user.account_status == AccountStatus.SUSPENDED:
        reason = user.rejection_reason or "Account suspended by administrator."
        raise ForbiddenException(
            message=f"Your account access has been suspended: {reason}",
            error_code="ACCOUNT_SUSPENDED",
        )
    return user


def require_roles(*allowed_roles: UserRole):
    """Factory dependency enforcing that the current user possesses one of the allowed roles."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.is_superuser or current_user.role == UserRole.ADMIN:
            return current_user
        if current_user.role not in allowed_roles:
            role_names = [r.value for r in allowed_roles]
            raise ForbiddenException(
                message=f"Access denied. Requires one of roles: {', '.join(role_names)}",
                error_code="FORBIDDEN_ROLE",
            )
        return current_user

    return role_checker


def require_permissions(*required_permissions: str):
    """Factory dependency enforcing that the user has all specified granular permissions."""
    async def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.is_superuser:
            return current_user
        user_perms = set(current_user.permissions or [])
        # Admin with full dashboard permissions bypasses if granted
        missing = [p for p in required_permissions if p not in user_perms]
        if missing and current_user.role != UserRole.ADMIN:
            raise ForbiddenException(
                message=f"Access denied. Missing permissions: {', '.join(missing)}",
                error_code="FORBIDDEN_PERMISSION",
            )
        return current_user

    return permission_checker


# Convenient role-specific dependencies
require_admin = require_roles(UserRole.ADMIN)
require_sales_or_admin = require_roles(UserRole.ADMIN, UserRole.SALES)
require_technician_or_admin = require_roles(UserRole.ADMIN, UserRole.TECHNICIAN)
require_warehouse_or_admin = require_roles(UserRole.ADMIN, UserRole.WAREHOUSE)
