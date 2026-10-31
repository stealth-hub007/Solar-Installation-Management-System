import enum
from datetime import datetime, timezone
from typing import Optional, List
import uuid
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SALES = "SALES"
    TECHNICIAN = "TECHNICIAN"
    WAREHOUSE = "WAREHOUSE"


class AccountStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"


ROLE_DEFAULT_PERMISSIONS = {
    UserRole.ADMIN: [
        "admin.dashboard",
        "admin.users.manage",
        "sales.dashboard",
        "warehouse.dashboard",
        "technician.dashboard",
        "project.monitor",
        "approvals.manage",
        "reports.view",
        "sales.customers.view",
        "sales.customers.manage",
        "sales.enquiries.manage",
        "sales.surveys.schedule",
        "sales.quotations.manage",
        "sales.orders.manage",
        "warehouse.products.view",
        "warehouse.inventory.manage",
        "warehouse.suppliers.manage",
        "warehouse.purchases.manage",
        "warehouse.receipts.manage",
        "warehouse.movements.view",
        "warehouse.serials.manage",
        "warehouse.dispatch.manage",
        "warehouse.delivery.manage",
        "technician.surveys.view",
        "technician.surveys.submit",
        "technician.installations.view",
        "technician.installations.update",
        "technician.checklists.manage",
        "technician.equipment.verify",
        "technician.handover.submit",
    ],
    UserRole.SALES: [
        "sales.dashboard",
        "sales.customers.view",
        "sales.customers.manage",
        "sales.enquiries.manage",
        "sales.surveys.schedule",
        "sales.quotations.manage",
        "sales.orders.manage",
    ],
    UserRole.WAREHOUSE: [
        "warehouse.dashboard",
        "warehouse.products.view",
        "warehouse.inventory.manage",
        "warehouse.suppliers.manage",
        "warehouse.purchases.manage",
        "warehouse.receipts.manage",
        "warehouse.movements.view",
        "warehouse.serials.manage",
        "warehouse.dispatch.manage",
        "warehouse.delivery.manage",
    ],
    UserRole.TECHNICIAN: [
        "technician.dashboard",
        "technician.surveys.view",
        "technician.surveys.submit",
        "technician.installations.view",
        "technician.installations.update",
        "technician.checklists.manage",
        "technician.equipment.verify",
        "technician.handover.submit",
    ],
}


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Users table for all system roles (Admin, Sales, Technician, Warehouse) with approval lifecycle."""
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum", native_enum=False),
        default=UserRole.SALES,
        nullable=False,
        index=True,
    )
    account_status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status_enum", native_enum=False),
        default=AccountStatus.PENDING,
        nullable=False,
        index=True,
    )
    auth_provider: Mapped[str] = mapped_column(String(50), default="LOCAL", nullable=False)
    google_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Admin Approval Fields
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    approved_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    suspended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    permissions: Mapped[Optional[List[str]]] = mapped_column(JSON, default=list, nullable=True)

    # Relationships
    password_reset_otps: Mapped[list["PasswordResetOTP"]] = relationship(
        "PasswordResetOTP",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(PasswordResetOTP.created_at)",
    )
    approved_by: Mapped[Optional["User"]] = relationship("User", remote_side="User.id")

    def __repr__(self) -> str:
        return f"<User {self.email} (Role: {self.role}, Status: {self.account_status})>"


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
