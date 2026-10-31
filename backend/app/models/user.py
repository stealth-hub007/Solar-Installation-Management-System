import enum
from datetime import datetime, timezone
import uuid
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SALES = "SALES"
    TECHNICIAN = "TECHNICIAN"
    WAREHOUSE = "WAREHOUSE"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Users table for all system roles (Admin, Sales, Technician, Warehouse)."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum", native_enum=False),
        default=UserRole.SALES,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    password_reset_otps: Mapped[list["PasswordResetOTP"]] = relationship(
        "PasswordResetOTP",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(PasswordResetOTP.created_at)",
    )

    def __repr__(self) -> str:
        return f"<User {self.email} (Role: {self.role}, Active: {self.is_active})>"


class PasswordResetOTP(Base, UUIDPrimaryKeyMixin):
    """Stores temporary OTPs for secure password resets with attempt limits and expiry."""
    __tablename__ = "password_reset_otps"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    otp_code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="password_reset_otps")

    def __repr__(self) -> str:
        return f"<PasswordResetOTP user={self.user_id} expired={self.expires_at} used={self.is_used}>"

