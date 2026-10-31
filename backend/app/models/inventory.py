import enum
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class MovementType(str, enum.Enum):
    STOCK_IN = "STOCK_IN"
    STOCK_RESERVATION = "STOCK_RESERVATION"
    RESERVATION_RELEASE = "RESERVATION_RELEASE"
    STOCK_DISPATCH = "STOCK_DISPATCH"
    STOCK_ADJUSTMENT = "STOCK_ADJUSTMENT"


class ReservationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RELEASED = "RELEASED"
    DISPATCHED = "DISPATCHED"


class SerialStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    RESERVED = "RESERVED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    DEFECTIVE = "DEFECTIVE"


class Inventory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Real-time physical and available stock levels per product."""
    __tablename__ = "inventory"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    total_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    reserved_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    minimum_stock_level: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    @property
    def available_quantity(self) -> Decimal:
        return self.total_quantity - self.reserved_quantity

    def __repr__(self) -> str:
        return f"<Inventory product={self.product_id} total={self.total_quantity} reserved={self.reserved_quantity}>"


class StockMovement(Base, UUIDPrimaryKeyMixin):
    """Complete audit trail of all warehouse stock movements."""
    __tablename__ = "stock_movements"

    inventory_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    movement_type: Mapped[MovementType] = mapped_column(
        Enum(MovementType, name="movement_type_enum", native_enum=False), nullable=False, index=True
    )
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    purchase_cost: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    performed_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<StockMovement type={self.movement_type} qty={self.quantity}>"


class StockReservation(Base, UUIDPrimaryKeyMixin):
    """Committed stock reservations tied to confirmed customer orders."""
    __tablename__ = "stock_reservations"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    reserved_quantity: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        Enum(ReservationStatus, name="reservation_status_enum", native_enum=False),
        default=ReservationStatus.ACTIVE,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    def __repr__(self) -> str:
        return f"<StockReservation order={self.order_id} product={self.product_id} qty={self.reserved_quantity}>"


class ProductSerial(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Serialized equipment tracking for warranty and service verification (inverters, batteries, charge controllers)."""
    __tablename__ = "product_serials"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    serial_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    status: Mapped[SerialStatus] = mapped_column(
        Enum(SerialStatus, name="serial_status_enum", native_enum=False),
        default=SerialStatus.IN_STOCK,
        nullable=False,
        index=True,
    )
    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    order_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    dispatch_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    delivery_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<ProductSerial {self.serial_number} status={self.status}>"

