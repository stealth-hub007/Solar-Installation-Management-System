from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.survey import SurveyStatus, SurveyApprovalStatus, RoofOrientation


class SurveyScheduleCreate(BaseModel):
    enquiry_id: uuid.UUID
    assigned_technician_id: uuid.UUID
    scheduled_date: datetime


class SurveyMeasurementUpdate(BaseModel):
    roof_area_sqft: Optional[Decimal] = None
    roof_orientation: Optional[RoofOrientation] = None
    roof_tilt_degrees: Optional[float] = None
    shadow_free_area_sqft: Optional[Decimal] = None
    monthly_bill: Optional[Decimal] = None
    grid_connection_suitable: Optional[bool] = None
    cable_distance_meters: Optional[Decimal] = None
    technician_remarks: Optional[str] = None


class SurveyApprovalRequest(BaseModel):
    approval_status: SurveyApprovalStatus
    rejection_reason: Optional[str] = None


class SurveyPhotoResponse(BaseModel):
    id: uuid.UUID
    survey_id: uuid.UUID
    file_path: str
    file_name: str
    caption: Optional[str] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SurveyResponse(BaseModel):
    id: uuid.UUID
    enquiry_id: uuid.UUID
    customer_id: uuid.UUID
    assigned_technician_id: uuid.UUID
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    contact: Optional[str] = None
    site_address: Optional[str] = None
    siteAddress: Optional[str] = None
    technician_name: Optional[str] = None
    assignedSurveyor: Optional[str] = None
    survey_number: Optional[str] = None
    scheduled_date: datetime
    roof_area_sqft: Optional[Decimal] = None
    roof_orientation: Optional[RoofOrientation] = None
    roof_tilt_degrees: Optional[float] = None
    shadow_free_area_sqft: Optional[Decimal] = None
    monthly_bill: Optional[Decimal] = None
    grid_connection_suitable: bool
    cable_distance_meters: Optional[Decimal] = None
    technician_remarks: Optional[str] = None
    survey_status: SurveyStatus
    approval_status: SurveyApprovalStatus
    rejection_reason: Optional[str] = None
    reviewed_by_id: Optional[uuid.UUID] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    photos: List[SurveyPhotoResponse] = []
    proposedCapacity: Optional[str] = "5.0 kW"
    roofType: Optional[str] = "RCC Flat Roof"
    displayId: Optional[str] = None
    scheduledTime: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

