from typing import Optional, List, Tuple
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.models.user import User, PasswordResetOTP, UserRole, AccountStatus


class UserRepository:
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        stmt = select(User).where(func.lower(User.email) == email.lower().strip())
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_google_id(db: AsyncSession, google_id: str) -> Optional[User]:
        stmt = select(User).where(User.google_id == google_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, user: User) -> User:
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update(db: AsyncSession, user: User) -> User:
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def list_users(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        role: Optional[UserRole] = None,
        account_status: Optional[AccountStatus] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[User], int]:
        stmt = select(User)
        count_stmt = select(func.count(User.id))

        if role is not None:
            stmt = stmt.where(User.role == role)
            count_stmt = count_stmt.where(User.role == role)

        if account_status is not None:
            stmt = stmt.where(User.account_status == account_status)
            count_stmt = count_stmt.where(User.account_status == account_status)

        if is_active is not None:
            stmt = stmt.where(User.is_active == is_active)
            count_stmt = count_stmt.where(User.is_active == is_active)

        if search:
            search_pattern = f"%{search.strip().lower()}%"
            filter_cond = or_(
                func.lower(User.email).like(search_pattern),
                func.lower(User.full_name).like(search_pattern),
                User.phone.like(search_pattern),
            )
            stmt = stmt.where(filter_cond)
            count_stmt = count_stmt.where(filter_cond)

        total_result = await db.execute(count_stmt)
        total = total_result.scalar_one()

        stmt = stmt.order_by(User.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        users = list(result.scalars().all())

        return users, total

    # OTP Operations
    @staticmethod
    async def create_otp(db: AsyncSession, otp: PasswordResetOTP) -> PasswordResetOTP:
        db.add(otp)
        await db.commit()
        await db.refresh(otp)
        return otp

    @staticmethod
    async def get_latest_valid_otp(db: AsyncSession, user_id: uuid.UUID) -> Optional[PasswordResetOTP]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(PasswordResetOTP)
            .where(
                PasswordResetOTP.user_id == user_id,
                PasswordResetOTP.is_used == False,
                PasswordResetOTP.expires_at > now,
            )
            .order_by(PasswordResetOTP.created_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    @staticmethod
    async def mark_otp_used(db: AsyncSession, otp: PasswordResetOTP) -> None:
        otp.is_used = True
        await db.commit()
