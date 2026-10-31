import math
import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse
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
            is_active=True,
            is_superuser=(user_in.role == UserRole.ADMIN),
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
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> PaginatedData[UserResponse]:
        skip = (page - 1) * size
        users, total = await UserRepository.list_users(
            db, skip=skip, limit=size, role=role, is_active=is_active, search=search
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

