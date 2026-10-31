import enum
from datetime import datetime, timezone
import uuid
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, Enum, ForeignKey, Text, Numeric, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class SurveyStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class SurveyApprovalStatus(str, enum.Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class RoofOrientation(str, enum.Enum):
    SOUTH = "SOUTH"
    NORTH = "NORTH"
    EAST = "EAST"
    WEST = "WEST"
    SOUTH_EAST = "SOUTH_EAST"
    SOUTH_WEST = "SOUTH_WEST"
    NORTH_EAST = "NORTH_EAST"
    NORTH_WEST = "NORTH_WEST"
    FLAT = "FLAT"


class SiteSurvey(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Site survey recording technical roof measurements, shadow analysis, and approval status."""
    __tablename__ = "site_surveys"

    enquiry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("enquiries.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    assigned_technician_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    scheduled_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    # Roof measurements
    roof_area_sqft: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    roof_orientation: Mapped[Optional[RoofOrientation]] = mapped_column(
        Enum(RoofOrientation, name="roof_orientation_enum", native_enum=False), nullable=True
    )
    roof_tilt_degrees: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    shadow_free_area_sqft: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    monthly_bill: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    grid_connection_suitable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    cable_distance_meters: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 2), nullable=True)
    technician_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Workflow & Approval State
    survey_status: Mapped[SurveyStatus] = mapped_column(
        Enum(SurveyStatus, name="survey_status_enum", native_enum=False),
        default=SurveyStatus.SCHEDULED,
        nullable=False,
        index=True,
    )
    approval_status: Mapped[SurveyApprovalStatus] = mapped_column(
        Enum(SurveyApprovalStatus, name="survey_approval_status_enum", native_enum=False),
        default=SurveyApprovalStatus.PENDING_APPROVAL,
        nullable=False,
        index=True,
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    photos: Mapped[List["SurveyPhoto"]] = relationship(
        "SurveyPhoto", back_populates="survey", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<SiteSurvey id={self.id} status={self.survey_status} approval={self.approval_status}>"


class SurveyPhoto(Base, UUIDPrimaryKeyMixin):
    """Photographs captured during site survey of roof, wiring access, and breaker box."""
    __tablename__ = "survey_photos"

    survey_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("site_surveys.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    caption: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    survey: Mapped["SiteSurvey"] = relationship("SiteSurvey", back_populates="photos")

    def __repr__(self) -> str:
        return f"<SurveyPhoto survey={self.survey_id} file={self.file_name}>"

