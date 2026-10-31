import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.warranty import WarrantyResponse
from app.services.warranty_service import WarrantyService

router = APIRouter(prefix="/warranties", tags=["Warranty Management"])


@router.get(
    "/serial/{serial_number}",
    response_model=APIResponse[WarrantyResponse],
    summary="Lookup Warranty by Hardware Serial Number",
    description="Validates active warranty coverage for an inverter, battery, or charge controller serial number.",
)
async def get_warranty_by_serial(
    serial_number: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    warranty = await WarrantyService.get_by_serial(db, serial_number)
    return APIResponse(
        success=True,
        message="Warranty record found",
        data=warranty,
    )


@router.get(
    "/customer/{customer_id}",
    response_model=APIResponse[List[WarrantyResponse]],
    summary="List Customer Warranties",
    description="Returns all active and expired product warranties registered for a customer.",
)
async def list_customer_warranties(
    customer_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    warranties = await WarrantyService.list_warranties_by_customer(db, customer_id)
    return APIResponse(
        success=True,
        message="Customer warranties retrieved successfully",
        data=warranties,
    )

