from typing import Optional
from datetime import datetime
import uuid
from pydantic import BaseModel, ConfigDict

from app.models.warranty import WarrantyStatus
from app.models.product import WarrantyUnit


class WarrantyResponse(BaseModel):
    id: uuid.UUID
    warranty_certificate_number: str
    product_id: uuid.UUID
    serial_id: Optional[uuid.UUID] = None
    customer_id: uuid.UUID
    order_id: uuid.UUID
    warranty_start_date: datetime
    warranty_expiry_date: datetime
    warranty_duration_snapshot: int
    warranty_unit_snapshot: WarrantyUnit
    warranty_status: WarrantyStatus
    is_valid: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

