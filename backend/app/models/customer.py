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


class EnquirySource(str, enum.Enum):
    WHATSAPP = "WHATSAPP"
    PHONE_CALL = "PHONE_CALL"
    WEBSITE_FORM = "WEBSITE_FORM"
    REFERRAL = "REFERRAL"
    OTHER = "OTHER"


class SystemCapacity(str, enum.Enum):
    KW_1 = "1kW"
    KW_2 = "2kW"
    KW_3 = "3kW"
    KW_4 = "4kW"
    KW_5 = "5kW"


class SystemType(str, enum.Enum):
    ON_GRID = "ON_GRID"
    OFF_GRID = "OFF_GRID"


class LeadStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED"
    SURVEY_SCHEDULED = "SURVEY_SCHEDULED"
    SURVEY_COMPLETED = "SURVEY_COMPLETED"
    CONVERTED = "CONVERTED"
    REJECTED = "REJECTED"


class Customer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Customer account record."""
    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    addresses: Mapped[List["CustomerAddress"]] = relationship(
        "CustomerAddress", back_populates="customer", cascade="all, delete-orphan"
    )
    enquiries: Mapped[List["Enquiry"]] = relationship(
        "Enquiry", back_populates="customer", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Customer {self.name} phone={self.phone}>"


class CustomerAddress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Multiple project or installation addresses per customer."""
    __tablename__ = "customer_addresses"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="addresses")

    def __repr__(self) -> str:
        return f"<CustomerAddress {self.address_line}, {self.city}>"


class Enquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Customer enquiries and solar sales leads."""
    __tablename__ = "enquiries"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    address_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer_addresses.id", ondelete="SET NULL"), nullable=True
    )
    assigned_sales_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    source: Mapped[EnquirySource] = mapped_column(
        Enum(EnquirySource, name="enquiry_source_enum", native_enum=False),
        default=EnquirySource.WEBSITE_FORM,
        nullable=False,
    )
    system_capacity: Mapped[SystemCapacity] = mapped_column(
        Enum(SystemCapacity, name="system_capacity_enum", native_enum=False),
        default=SystemCapacity.KW_3,
        nullable=False,
    )
    system_type: Mapped[SystemType] = mapped_column(
        Enum(SystemType, name="system_type_enum", native_enum=False),
        default=SystemType.ON_GRID,
        nullable=False,
    )
    monthly_electricity_bill: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    subsidy_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    customer_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    lead_status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status_enum", native_enum=False),
        default=LeadStatus.NEW,
        nullable=False,
        index=True,
    )
    next_followup_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="enquiries")
    address: Mapped[Optional["CustomerAddress"]] = relationship("CustomerAddress")
    followups: Mapped[List["EnquiryFollowup"]] = relationship(
        "EnquiryFollowup", back_populates="enquiry", cascade="all, delete-orphan", order_by="desc(EnquiryFollowup.followup_date)"
    )

    def __repr__(self) -> str:
        return f"<Enquiry id={self.id} status={self.lead_status}>"


class EnquiryFollowup(Base, UUIDPrimaryKeyMixin):
    """Audit log of sales follow-up calls, visits, and customer interactions."""
    __tablename__ = "enquiry_followups"

    enquiry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    followup_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    notes: Mapped[str] = mapped_column(Text, nullable=False)
    lead_status_after: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status_enum", native_enum=False), nullable=False
    )
    next_scheduled_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    enquiry: Mapped["Enquiry"] = relationship("Enquiry", back_populates="followups")

    def __repr__(self) -> str:
        return f"<EnquiryFollowup enquiry={self.enquiry_id} date={self.followup_date}>"

