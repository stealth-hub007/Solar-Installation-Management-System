import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_warehouse_or_admin
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.dispatch import (
    DispatchCreate, DeliveryConfirmRequest, DispatchResponse, DeliveryConfirmationResponse
)
from app.services.dispatch_service import DispatchService

router = APIRouter(prefix="/dispatches", tags=["Dispatch & Delivery Management"])


@router.post(
    "",
    response_model=APIResponse[DispatchResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Dispatch (Warehouse Only)",
    description="Prepares dispatch shipment, scans and attaches serial numbers for inverters/batteries, and deducts reserved physical inventory.",
)
async def create_dispatch(
    dispatch_in: DispatchCreate,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    dispatch = await DispatchService.create_dispatch(db, dispatch_in, current_user)
    return APIResponse(
        success=True,
        message="Dispatch created and equipment verified successfully",
        data=DispatchResponse.model_validate(dispatch),
    )


@router.get(
    "",
    response_model=APIResponse[List[DispatchResponse]],
    summary="List Dispatches",
)
async def list_dispatches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dispatches = await DispatchService.list_dispatches(db)
    return APIResponse(
        success=True,
        message="Dispatches retrieved successfully",
        data=[DispatchResponse.model_validate(d) for d in dispatches],
    )


@router.get(
    "/{dispatch_id}",
    response_model=APIResponse[DispatchResponse],
    summary="Get Dispatch Details",
)
async def get_dispatch(
    dispatch_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dispatch = await DispatchService.get_dispatch_by_id(db, dispatch_id)
    return APIResponse(
        success=True,
        message="Dispatch retrieved successfully",
        data=DispatchResponse.model_validate(dispatch),
    )


@router.post(
    "/{dispatch_id}/confirm-delivery",
    response_model=APIResponse[DeliveryConfirmationResponse],
    summary="Confirm Equipment Delivery & Activate Warranties",
    description="Records customer on-site equipment delivery confirmation and automatically registers product warranties starting from delivery date.",
)
async def confirm_delivery(
    dispatch_id: uuid.UUID,
    confirm_in: DeliveryConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    confirmation = await DispatchService.confirm_delivery(db, dispatch_id, confirm_in, current_user)
    return APIResponse(
        success=True,
        message="Delivery confirmed and warranties registered automatically",
        data=DeliveryConfirmationResponse.model_validate(confirmation),
    )

