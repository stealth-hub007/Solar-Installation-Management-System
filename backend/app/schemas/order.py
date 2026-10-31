from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.order import (
    OrderStatus, PaymentStatus, PaymentMethod, PaymentType, PaymentRecordStatus
)


class OrderConvertRequest(BaseModel):
    quotation_id: uuid.UUID
    expected_installation_date: Optional[datetime] = None


class OrderItemResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    product_name_snapshot: str
    quantity: Decimal
    unit_price_snapshot: Decimal
    total_price: Decimal

    model_config = ConfigDict(from_attributes=True)


class PaymentCreate(BaseModel):
    order_id: uuid.UUID
    amount: Decimal = Field(..., gt=0, description="Payment amount must be greater than zero")
    payment_method: PaymentMethod = PaymentMethod.BANK_TRANSFER
    reference_number: Optional[str] = None
    payment_type: PaymentType = PaymentType.ADVANCE
    remarks: Optional[str] = None


class PaymentResponse(BaseModel):
    id: uuid.UUID
    payment_number: str
    order_id: uuid.UUID
    amount: Decimal
    payment_date: datetime
    payment_method: PaymentMethod
    reference_number: Optional[str] = None
    payment_type: PaymentType
    payment_status: PaymentRecordStatus
    remarks: Optional[str] = None
    receipt_pdf_path: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    customer_id: uuid.UUID
    quotation_id: uuid.UUID
    order_date: datetime
    total_amount: Decimal
    paid_amount: Decimal
    outstanding_amount: Decimal
    order_status: OrderStatus
    payment_status: PaymentStatus
    expected_installation_date: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    payments: List[PaymentResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

