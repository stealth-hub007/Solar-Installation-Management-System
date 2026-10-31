from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.dispatch import DispatchStatus


class DispatchItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: Decimal = Field(..., gt=0)
    serial_id: Optional[uuid.UUID] = None  # Required if product is serial-tracked


class DispatchCreate(BaseModel):
    order_id: uuid.UUID
    items: List[DispatchItemCreate] = Field(..., min_length=1)
    remarks: Optional[str] = None


class DeliveryConfirmRequest(BaseModel):
    received_by_name: str = Field(..., min_length=2, max_length=255)
    delivery_date: Optional[datetime] = None  # Defaults to now if not provided


class DispatchItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    quantity: Decimal
    serial_id: Optional[uuid.UUID] = None

    model_config = ConfigDict(from_attributes=True)


class DeliveryConfirmationResponse(BaseModel):
    id: uuid.UUID
    dispatch_id: uuid.UUID
    order_id: uuid.UUID
    delivery_date: datetime
    received_by_name: str
    proof_photo_path: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DispatchResponse(BaseModel):
    id: uuid.UUID
    dispatch_number: str
    order_id: uuid.UUID
    warehouse_user_id: uuid.UUID
    dispatch_date: datetime
    dispatch_status: DispatchStatus
    remarks: Optional[str] = None
    items: List[DispatchItemResponse] = []
    delivery_confirmation: Optional[DeliveryConfirmationResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

