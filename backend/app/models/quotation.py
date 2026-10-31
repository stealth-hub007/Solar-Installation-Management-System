import enum
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text, Numeric, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class QuotationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    CONVERTED_TO_ORDER = "CONVERTED_TO_ORDER"


class Quotation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Customer Quotation with historical price and quantity snapshotting."""
    __tablename__ = "quotations"

    quotation_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    survey_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("site_surveys.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("packages.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )

    quotation_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    tax_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("18.00"), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    final_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    status: Mapped[QuotationStatus] = mapped_column(
        Enum(QuotationStatus, name="quotation_status_enum", native_enum=False),
        default=QuotationStatus.DRAFT,
        nullable=False,
        index=True,
    )
    revision_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    pdf_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    terms_conditions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    items: Mapped[List["QuotationItem"]] = relationship(
        "QuotationItem", back_populates="quotation", cascade="all, delete-orphan"
    )
    revisions: Mapped[List["QuotationRevision"]] = relationship(
        "QuotationRevision", back_populates="quotation", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Quotation {self.quotation_number} status={self.status} amount={self.final_amount}>"


class QuotationItem(Base, UUIDPrimaryKeyMixin):
    """Historical component snapshot preserving quoted prices against future catalogue updates."""
    __tablename__ = "quotation_items"

    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    product_name_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # Relationships
    quotation: Mapped["Quotation"] = relationship("Quotation", back_populates="items")

    def __repr__(self) -> str:
        return f"<QuotationItem {self.product_name_snapshot} qty={self.quantity} total={self.total_price}>"


class QuotationRevision(Base, UUIDPrimaryKeyMixin):
    """Immutable audit versioning for quotation modifications."""
    __tablename__ = "quotation_revisions"

    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    revision_number: Mapped[int] = mapped_column(Integer, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    final_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    items_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    changed_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    quotation: Mapped["Quotation"] = relationship("Quotation", back_populates="revisions")

    def __repr__(self) -> str:
        return f"<QuotationRevision quotation={self.quotation_id} rev={self.revision_number}>"

