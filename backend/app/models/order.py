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


class OrderStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    DISPATCHED = "DISPATCHED"
    INSTALLED = "INSTALLED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    FULLY_PAID = "FULLY_PAID"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    BANK_TRANSFER = "BANK_TRANSFER"
    UPI = "UPI"
    CHEQUE = "CHEQUE"
    CREDIT_CARD = "CREDIT_CARD"


class PaymentType(str, enum.Enum):
    ADVANCE = "ADVANCE"
    PARTIAL = "PARTIAL"
    FINAL = "FINAL"
    ADJUSTMENT = "ADJUSTMENT"


class PaymentRecordStatus(str, enum.Enum):
    RECORDED = "RECORDED"
    VERIFIED = "VERIFIED"
    REVERSED = "REVERSED"


class Order(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Customer Project Order converted from an accepted quotation."""
    __tablename__ = "orders"

    order_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quotation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotations.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )

    order_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    outstanding_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    order_status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status_enum", native_enum=False),
        default=OrderStatus.CONFIRMED,
        nullable=False,
        index=True,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status_enum", native_enum=False),
        default=PaymentStatus.PENDING,
        nullable=False,
        index=True,
    )
    expected_installation_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    items: Mapped[List["OrderItem"]] = relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )
    payments: Mapped[List["Payment"]] = relationship(
        "Payment", back_populates="order", cascade="all, delete-orphan", order_by="desc(Payment.payment_date)"
    )

    def __repr__(self) -> str:
        return f"<Order {self.order_number} total={self.total_amount} paid={self.paid_amount}>"


class OrderItem(Base, UUIDPrimaryKeyMixin):
    """Line items for equipment and materials belonging to an order."""
    __tablename__ = "order_items"

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    product_name_snapshot: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit_price_snapshot: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="items")

    def __repr__(self) -> str:
        return f"<OrderItem {self.product_name_snapshot} qty={self.quantity}>"


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Financial transaction records of customer advance, partial, and final payments."""
    __tablename__ = "payments"

    payment_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method_enum", native_enum=False),
        nullable=False,
    )
    reference_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    payment_type: Mapped[PaymentType] = mapped_column(
        Enum(PaymentType, name="payment_type_enum", native_enum=False),
        default=PaymentType.ADVANCE,
        nullable=False,
    )
    payment_status: Mapped[PaymentRecordStatus] = mapped_column(
        Enum(PaymentRecordStatus, name="payment_record_status_enum", native_enum=False),
        default=PaymentRecordStatus.RECORDED,
        nullable=False,
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recorded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    receipt_pdf_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Relationships
    order: Mapped["Order"] = relationship("Order", back_populates="payments")

    def __repr__(self) -> str:
        return f"<Payment {self.payment_number} amount={self.amount} type={self.payment_type}>"


class Invoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tax invoice generated for a completed project order."""
    __tablename__ = "invoices"

    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), unique=True, nullable=False, index=True
    )
    invoice_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    pdf_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<Invoice {self.invoice_number} total={self.total_amount}>"

