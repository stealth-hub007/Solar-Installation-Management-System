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


class InstallationStatus(str, enum.Enum):
    PENDING_ASSIGNMENT = "PENDING_ASSIGNMENT"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    TESTING = "TESTING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class InstallationJob(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Field engineering job for rooftop solar mounting, cabling, and commissioning."""
    __tablename__ = "installation_jobs"

    job_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    assigned_technician_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    scheduled_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    installation_status: Mapped[InstallationStatus] = mapped_column(
        Enum(InstallationStatus, name="installation_status_enum", native_enum=False),
        default=InstallationStatus.PENDING_ASSIGNMENT,
        nullable=False,
        index=True,
    )
    power_generated_watts: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    testing_results: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    checklist: Mapped[Optional["InstallationChecklist"]] = relationship(
        "InstallationChecklist", back_populates="job", uselist=False, cascade="all, delete-orphan"
    )
    photos: Mapped[List["InstallationPhoto"]] = relationship(
        "InstallationPhoto", back_populates="job", cascade="all, delete-orphan"
    )
    signoff: Mapped[Optional["InstallationSignoff"]] = relationship(
        "InstallationSignoff", back_populates="job", uselist=False, cascade="all, delete-orphan"
    )
    work_logs: Mapped[List["TechnicianWorkLog"]] = relationship(
        "TechnicianWorkLog", back_populates="job", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<InstallationJob {self.job_number} status={self.installation_status}>"


class InstallationChecklist(Base, UUIDPrimaryKeyMixin):
    """Mandatory technical checklist verified before installation sign-off."""
    __tablename__ = "installation_checklists"

    installation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("installation_jobs.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    mounting_stands_installed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    solar_panels_installed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    inverter_installed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    battery_installed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    wiring_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    safety_equipment_installed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    earthing_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    system_tested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    power_generation_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    job: Mapped["InstallationJob"] = relationship("InstallationJob", back_populates="checklist")

    def is_fully_completed(self, requires_battery: bool = False) -> bool:
        completed = (
            self.mounting_stands_installed
            and self.solar_panels_installed
            and self.inverter_installed
            and self.wiring_completed
            and self.safety_equipment_installed
            and self.earthing_completed
            and self.system_tested
            and self.power_generation_verified
        )
        if requires_battery:
            completed = completed and self.battery_installed
        return completed


class InstallationPhoto(Base, UUIDPrimaryKeyMixin):
    """Proof-of-work photographs for structure, panel layout, earthing, and generation meter."""
    __tablename__ = "installation_photos"

    installation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("installation_jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    uploaded_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    job: Mapped["InstallationJob"] = relationship("InstallationJob", back_populates="photos")


class TechnicianWorkLog(Base, UUIDPrimaryKeyMixin):
    """Field hours recorded by technicians for labour costing and project expense tracking."""
    __tablename__ = "technician_work_logs"

    technician_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    installation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("installation_jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    total_hours: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    hourly_rate: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("300.00"), nullable=False)
    total_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    job: Mapped["InstallationJob"] = relationship("InstallationJob", back_populates="work_logs")


class InstallationSignoff(Base, UUIDPrimaryKeyMixin):
    """Customer digital confirmation upon inspection and verification of solar generation."""
    __tablename__ = "installation_signoffs"

    installation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("installation_jobs.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    signature_path: Mapped[str] = mapped_column(String(500), nullable=False)
    signoff_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    feedback_rating: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    feedback_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    job: Mapped["InstallationJob"] = relationship("InstallationJob", back_populates="signoff")

