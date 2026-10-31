from typing import List, Optional
import uuid
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency for extracting and validating the authenticated user from the Bearer token."""
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


def require_roles(*allowed_roles: UserRole):
    """Factory dependency enforcing that the current user possesses one of the allowed roles."""
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.is_superuser:
            return current_user
        if current_user.role not in allowed_roles:
            role_names = [r.value for r in allowed_roles]
            raise ForbiddenException(
                message=f"Access denied. Requires one of roles: {', '.join(role_names)}",
                error_code="FORBIDDEN_ROLE",
            )
        return current_user

    return role_checker


# Convenient role-specific dependencies
require_admin = require_roles(UserRole.ADMIN)
require_sales_or_admin = require_roles(UserRole.ADMIN, UserRole.SALES)
require_technician_or_admin = require_roles(UserRole.ADMIN, UserRole.TECHNICIAN)
require_warehouse_or_admin = require_roles(UserRole.ADMIN, UserRole.WAREHOUSE)

