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


class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_FOR_PARTS = "WAITING_FOR_PARTS"
    RESOLVED = "RESOLVED"
    CUSTOMER_CONFIRMATION_PENDING = "CUSTOMER_CONFIRMATION_PENDING"
    CLOSED = "CLOSED"


class ActionType(str, enum.Enum):
    INSPECTION = "INSPECTION"
    REPAIR = "REPAIR"
    REPLACEMENT = "REPLACEMENT"
    MAINTENANCE = "MAINTENANCE"


class ServiceTicket(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Customer post-installation complaints and warranty support requests."""
    __tablename__ = "service_tickets"

    ticket_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    order_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    serial_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("product_serials.id", ondelete="SET NULL"), nullable=True, index=True
    )
    assigned_technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    complaint_description: Mapped[str] = mapped_column(Text, nullable=False)
    fault_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ticket_creation_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    is_under_warranty: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ticket_status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus, name="ticket_status_enum", native_enum=False),
        default=TicketStatus.OPEN,
        nullable=False,
        index=True,
    )
    resolution_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    customer_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    customer_confirmation_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    actions: Mapped[List["ServiceAction"]] = relationship(
        "ServiceAction", back_populates="ticket", cascade="all, delete-orphan", order_by="desc(ServiceAction.action_date)"
    )

    def __repr__(self) -> str:
        return f"<ServiceTicket {self.ticket_number} status={self.ticket_status} under_warranty={self.is_under_warranty}>"


class ServiceAction(Base, UUIDPrimaryKeyMixin):
    """Field service actions (diagnostics, part repairs, replacements, and customer charges)."""
    __tablename__ = "service_actions"

    ticket_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("service_tickets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    technician_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    action_type: Mapped[ActionType] = mapped_column(
        Enum(ActionType, name="action_type_enum", native_enum=False), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    parts_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    labour_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    customer_charge: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    action_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    ticket: Mapped["ServiceTicket"] = relationship("ServiceTicket", back_populates="actions")

    def __repr__(self) -> str:
        return f"<ServiceAction ticket={self.ticket_id} type={self.action_type} charge={self.customer_charge}>"

