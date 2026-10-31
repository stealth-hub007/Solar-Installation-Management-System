import enum
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class DispatchStatus(str, enum.Enum):
    PREPARING = "PREPARING"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Dispatch(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Warehouse equipment dispatch order fulfilling reserved materials."""
    __tablename__ = "dispatches"

    dispatch_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    warehouse_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    dispatch_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    dispatch_status: Mapped[DispatchStatus] = mapped_column(
        Enum(DispatchStatus, name="dispatch_status_enum", native_enum=False),
        default=DispatchStatus.PREPARING,
        nullable=False,
        index=True,
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    items: Mapped[List["DispatchItem"]] = relationship(
        "DispatchItem", back_populates="dispatch", cascade="all, delete-orphan"
    )
    delivery_confirmation: Mapped[Optional["DeliveryConfirmation"]] = relationship(
        "DeliveryConfirmation", back_populates="dispatch", uselist=False
    )

    def __repr__(self) -> str:
        return f"<Dispatch {self.dispatch_number} status={self.dispatch_status}>"


class DispatchItem(Base, UUIDPrimaryKeyMixin):
    """Equipment and serialized items packed in a specific dispatch shipment."""
    __tablename__ = "dispatch_items"

    dispatch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    serial_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_serials.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Relationships
    dispatch: Mapped["Dispatch"] = relationship("Dispatch", back_populates="items")

    def __repr__(self) -> str:
        return f"<DispatchItem product={self.product_id} serial={self.serial_id} qty={self.quantity}>"


class DeliveryConfirmation(Base, UUIDPrimaryKeyMixin):
    """On-site delivery confirmation that officially activates warranties."""
    __tablename__ = "delivery_confirmations"

    dispatch_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("dispatches.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    delivery_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    received_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    proof_photo_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    customer_signature_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    confirmed_by_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    dispatch: Mapped["Dispatch"] = relationship("Dispatch", back_populates="delivery_confirmation")

    def __repr__(self) -> str:
        return f"<DeliveryConfirmation dispatch={self.dispatch_id} received_by={self.received_by_name}>"

