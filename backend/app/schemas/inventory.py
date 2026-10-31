from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.inventory import MovementType, ReservationStatus, SerialStatus


class StockAddRequest(BaseModel):
    product_id: uuid.UUID
    quantity: Decimal = Field(..., gt=0)
    purchase_cost: Optional[Decimal] = Field(None, ge=0)
    remarks: Optional[str] = None


class StockAdjustmentRequest(BaseModel):
    product_id: uuid.UUID
    new_total_quantity: Decimal = Field(..., ge=0)
    remarks: str = Field(..., min_length=2)


class InventoryResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    total_quantity: Decimal
    reserved_quantity: Decimal
    available_quantity: Decimal
    minimum_stock_level: int
    is_low_stock: bool
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockMovementResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    movement_type: MovementType
    quantity: Decimal
    purchase_cost: Optional[Decimal] = None
    reference_id: Optional[uuid.UUID] = None
    remarks: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SerialRegisterRequest(BaseModel):
    product_id: uuid.UUID
    serial_numbers: List[str] = Field(..., min_length=1)


class ProductSerialResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    serial_number: str
    status: SerialStatus
    customer_id: Optional[uuid.UUID] = None
    order_id: Optional[uuid.UUID] = None
    dispatch_id: Optional[uuid.UUID] = None
    delivery_date: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

