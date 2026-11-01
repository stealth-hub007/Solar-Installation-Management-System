from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.installation import InstallationStatus


class InstallationAssignRequest(BaseModel):
    technician_id: uuid.UUID
    scheduled_date: datetime


class ChecklistUpdateRequest(BaseModel):
    mounting_stands_installed: Optional[bool] = None
    solar_panels_installed: Optional[bool] = None
    inverter_installed: Optional[bool] = None
    battery_installed: Optional[bool] = None
    wiring_completed: Optional[bool] = None
    safety_equipment_installed: Optional[bool] = None
    earthing_completed: Optional[bool] = None
    system_tested: Optional[bool] = None
    power_generation_verified: Optional[bool] = None


class ChecklistResponse(BaseModel):
    id: uuid.UUID
    installation_id: uuid.UUID
    mounting_stands_installed: bool
    solar_panels_installed: bool
    inverter_installed: bool
    battery_installed: bool
    wiring_completed: bool
    safety_equipment_installed: bool
    earthing_completed: bool
    system_tested: bool
    power_generation_verified: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkLogCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    hourly_rate: Decimal = Field(default=Decimal("300.00"), ge=0)


class WorkLogResponse(BaseModel):
    id: uuid.UUID
    technician_id: uuid.UUID
    installation_id: uuid.UUID
    start_time: datetime
    end_time: datetime
    total_hours: Decimal
    hourly_rate: Decimal
    total_cost: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerSignoffRequest(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=255)
    feedback_rating: int = Field(default=5, ge=1, le=5)
    feedback_remarks: Optional[str] = None


class CustomerSignoffResponse(BaseModel):
    id: uuid.UUID
    installation_id: uuid.UUID
    customer_name: str
    signature_path: str
    signoff_date: datetime
    feedback_rating: int
    feedback_remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InstallationCompleteRequest(BaseModel):
    power_generated_watts: Decimal = Field(..., gt=0)
    testing_results: str = Field(..., min_length=5)
    remarks: Optional[str] = None


class InstallationJobResponse(BaseModel):
    id: uuid.UUID
    job_number: str
    order_id: uuid.UUID
    customer_id: uuid.UUID
    assigned_technician_id: Optional[uuid.UUID] = None
    scheduled_date: Optional[datetime] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    installation_status: InstallationStatus
    power_generated_watts: Optional[Decimal] = None
    testing_results: Optional[str] = None
    remarks: Optional[str] = None
    checklist: Optional[ChecklistResponse] = None
    signoff: Optional[CustomerSignoffResponse] = None
    work_logs: List[WorkLogResponse] = []
    created_at: datetime
    updated_at: datetime

    # Enriched fields for technician dashboard and portals
    customer_name: Optional[str] = None
    customerName: Optional[str] = None
    contact: Optional[str] = None
    installation_address: Optional[str] = None
    installationAddress: Optional[str] = None
    technician_name: Optional[str] = None
    capacity: Optional[str] = "5.0 kW"
    panels: Optional[str] = "10x 540W Mono PERC Panels"
    inverter: Optional[str] = "5kW On-Grid Solar Inverter"
    battery: Optional[str] = "None"
    dispatch_status: Optional[str] = "DELIVERED"
    dispatchStatus: Optional[str] = "Delivered to Site"
    order_number: Optional[str] = None
    orderNumber: Optional[str] = None
    project_ref: Optional[str] = None
    projectRef: Optional[str] = None
    equipments: Optional[List[dict]] = None

    model_config = ConfigDict(from_attributes=True)

