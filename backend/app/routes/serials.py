import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_warehouse_or_admin
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.inventory import (
    SerialRegisterRequest, ProductSerialResponse
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/serials", tags=["Serial Number Tracking"])


@router.post(
    "/register",
    response_model=APIResponse[List[ProductSerialResponse]],
    status_code=status.HTTP_201_CREATED,
    summary="Register Hardware Serial Numbers",
    description="Registers scanned serial numbers for serialized equipment (inverters, batteries, charge controllers).",
)
async def register_serials(
    register_in: SerialRegisterRequest,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    serials = await InventoryService.register_serials(db, register_in)
    return APIResponse(
        success=True,
        message=f"Successfully registered {len(serials)} serial numbers",
        data=[ProductSerialResponse.model_validate(s) for s in serials],
    )


@router.get(
    "/{serial_number}",
    response_model=APIResponse[ProductSerialResponse],
    summary="Lookup Serial Number",
    description="Finds equipment tracking status, assigned customer, order ID, and delivery date by serial number.",
)
async def lookup_serial(
    serial_number: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    serial_record = await InventoryService.lookup_serial(db, serial_number)
    return APIResponse(
        success=True,
        message="Serial number found",
        data=ProductSerialResponse.model_validate(serial_record),
    )

