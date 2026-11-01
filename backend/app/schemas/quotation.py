from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.quotation import QuotationStatus


class QuotationCreate(BaseModel):
    survey_id: uuid.UUID
    package_id: Optional[uuid.UUID] = None  # If omitted, matches automatically from survey enquiry
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)
    valid_days: int = Field(default=15, ge=1, le=90)
    terms_conditions: Optional[str] = None


class QuotationUpdate(BaseModel):
    discount: Optional[Decimal] = Field(None, ge=0)
    terms_conditions: Optional[str] = None


class QuotationItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name_snapshot: str
    quantity: Decimal
    unit_price_snapshot: Decimal
    total_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class QuotationResponse(BaseModel):
    id: uuid.UUID
    quotation_number: str
    customer_id: uuid.UUID
    customer_name: Optional[str] = None
    survey_id: uuid.UUID
    package_id: uuid.UUID
    system_capacity: Optional[str] = None
    quotation_date: datetime
    valid_until: datetime
    subtotal: Decimal
    discount: Decimal
    tax_percentage: Decimal
    tax_amount: Decimal
    final_amount: Decimal
    status: QuotationStatus
    revision_number: int
    pdf_path: Optional[str] = None
    terms_conditions: Optional[str] = None
    items: List[QuotationItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
