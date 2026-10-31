import enum
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class ExpenseCategory(str, enum.Enum):
    TRANSPORT = "TRANSPORT"
    HARDWARE_PURCHASE = "HARDWARE_PURCHASE"
    PERMITS = "PERMITS"
    SUBCONTRACTOR = "SUBCONTRACTOR"
    MISCELLANEOUS = "MISCELLANEOUS"


class SubsidyStatus(str, enum.Enum):
    NOT_APPLIED = "NOT_APPLIED"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    DISBURSED = "DISBURSED"


class ProjectExpense(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Direct financial expenditures logged against a specific customer solar installation project."""
    __tablename__ = "project_expenses"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    expense_category: Mapped[ExpenseCategory] = mapped_column(
        Enum(ExpenseCategory, name="expense_category_enum", native_enum=False),
        default=ExpenseCategory.MISCELLANEOUS,
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    expense_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recorded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    def __repr__(self) -> str:
        return f"<ProjectExpense order={self.order_id} category={self.expense_category} amount={self.amount}>"


class SubsidyRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Government solar subsidy application, approval, and disbursement tracking."""
    __tablename__ = "subsidy_records"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    application_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    submission_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    approval_status: Mapped[SubsidyStatus] = mapped_column(
        Enum(SubsidyStatus, name="subsidy_status_enum", native_enum=False),
        default=SubsidyStatus.NOT_APPLIED,
        nullable=False,
        index=True,
    )
    subsidy_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    document_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<SubsidyRecord order={self.order_id} status={self.approval_status} amount={self.subsidy_amount}>"

