from typing import Optional, List
from datetime import datetime
import uuid
import re
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

from app.models.customer import EnquirySource, SystemCapacity, SystemType, LeadStatus


def validate_phone_number(value: str) -> str:
    value = value.strip()
    if not re.fullmatch(r"\+?[0-9\s().-]+", value):
        raise ValueError("Phone number must contain only digits and standard phone separators")
    digit_count = sum(character.isdigit() for character in value)
    if not 10 <= digit_count <= 15:
        raise ValueError("Phone number must contain between 10 and 15 digits")
    return value


class AddressCreate(BaseModel):
    address_line: str = Field(..., min_length=3, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=4, max_length=20)
    is_primary: bool = True


class AddressResponse(AddressCreate):
    id: uuid.UUID
    customer_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=8, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[AddressCreate] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return validate_phone_number(value)


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, min_length=8, max_length=20)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        return validate_phone_number(value) if value is not None else value


class CustomerResponse(BaseModel):
    id: uuid.UUID
    name: str
    phone: str
    email: Optional[str] = None
    is_active: bool
    addresses: List[AddressResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnquiryCreate(BaseModel):
    customer_id: Optional[uuid.UUID] = None
    # Can alternatively supply new customer info directly
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[EmailStr] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None

    source: EnquirySource = EnquirySource.WEBSITE_FORM
    system_capacity: SystemCapacity = SystemCapacity.KW_3
    system_type: SystemType = SystemType.ON_GRID
    monthly_electricity_bill: Optional[Decimal] = None
    subsidy_required: bool = False
    customer_requirements: Optional[str] = None
    assigned_sales_id: Optional[uuid.UUID] = None
    remarks: Optional[str] = None

    @field_validator("customer_phone")
    @classmethod
    def validate_customer_phone(cls, value: Optional[str]) -> Optional[str]:
        return validate_phone_number(value) if value is not None else value


class PublicEnquiryCreate(BaseModel):
    """Schema for public website contact form submissions without employee credentials."""
    full_name: str = Field(..., min_length=2, max_length=150, description="Customer's full name")
    phone: str = Field(..., min_length=8, max_length=20, description="Customer's phone number")
    email: EmailStr = Field(..., description="Customer's email address")
    city: str = Field(..., min_length=2, max_length=100, description="City / Location")
    property_type: str = Field("Residential", max_length=50, description="Residential, Commercial, Industrial, Other")
    interested_service: str = Field(..., min_length=2, max_length=100, description="Solar Rooftop, Net Metering, Battery, etc.")
    property_address: Optional[str] = Field(None, max_length=255, description="Specific street or landmark address")
    required_solar_capacity: Optional[str] = Field(None, max_length=50, description="e.g. 3kW, 5kW, 10kW or Not sure")
    message: str = Field(..., min_length=5, max_length=2000, description="Customer project requirements / message")
    consent: bool = Field(True, description="Consent to be contacted")
    honeypot: Optional[str] = Field(None, description="Bot mitigation field — must remain empty")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        return validate_phone_number(value)


class EnquiryUpdate(BaseModel):
    system_capacity: Optional[SystemCapacity] = None
    system_type: Optional[SystemType] = None
    monthly_electricity_bill: Optional[Decimal] = None
    subsidy_required: Optional[bool] = None
    customer_requirements: Optional[str] = None
    remarks: Optional[str] = None


class EnquiryAssign(BaseModel):
    assigned_sales_id: uuid.UUID


class EnquiryStatusUpdate(BaseModel):
    lead_status: LeadStatus
    remarks: Optional[str] = None


class FollowupCreate(BaseModel):
    notes: str = Field(..., min_length=2)
    lead_status_after: LeadStatus
    next_scheduled_date: Optional[datetime] = None


class FollowupResponse(BaseModel):
    id: uuid.UUID
    enquiry_id: uuid.UUID
    user_id: uuid.UUID
    followup_date: datetime
    notes: str
    lead_status_after: LeadStatus
    next_scheduled_date: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnquiryResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    address_id: Optional[uuid.UUID] = None
    assigned_sales_id: Optional[uuid.UUID] = None
    source: EnquirySource
    system_capacity: SystemCapacity
    system_type: SystemType
    monthly_electricity_bill: Optional[Decimal] = None
    subsidy_required: bool
    customer_requirements: Optional[str] = None
    lead_status: LeadStatus
    next_followup_date: Optional[datetime] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    followups: List[FollowupResponse] = []

    model_config = ConfigDict(from_attributes=True)
