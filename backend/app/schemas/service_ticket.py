from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.service_ticket import TicketStatus, ActionType


class TicketCreate(BaseModel):
    customer_id: uuid.UUID
    order_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None
    serial_id: Optional[uuid.UUID] = None
    complaint_description: str = Field(..., min_length=5)


class TicketAssign(BaseModel):
    technician_id: uuid.UUID


class ServiceActionCreate(BaseModel):
    action_type: ActionType
    description: str = Field(..., min_length=3)
    parts_cost: Decimal = Field(default=Decimal("0.00"), ge=0)
    labour_cost: Decimal = Field(default=Decimal("0.00"), ge=0)


class ServiceActionResponse(BaseModel):
    id: uuid.UUID
    ticket_id: uuid.UUID
    technician_id: uuid.UUID
    action_type: ActionType
    description: str
    parts_cost: Decimal
    labour_cost: Decimal
    customer_charge: Decimal
    action_date: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketResolveRequest(BaseModel):
    resolution_details: str = Field(..., min_length=5)


class TicketConfirmRequest(BaseModel):
    confirmed: bool = True


class ServiceTicketResponse(BaseModel):
    id: uuid.UUID
    ticket_number: str
    customer_id: uuid.UUID
    order_id: Optional[uuid.UUID] = None
    product_id: Optional[uuid.UUID] = None
    serial_id: Optional[uuid.UUID] = None
    assigned_technician_id: Optional[uuid.UUID] = None
    complaint_description: str
    fault_details: Optional[str] = None
    ticket_creation_date: datetime
    is_under_warranty: bool
    ticket_status: TicketStatus
    resolution_details: Optional[str] = None
    customer_confirmed: bool
    customer_confirmation_date: Optional[datetime] = None
    actions: List[ServiceActionResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

