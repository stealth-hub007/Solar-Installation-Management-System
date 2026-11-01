import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_sales_or_admin, require_admin
from app.models.user import User
from app.models.order import OrderStatus, PaymentStatus
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.order import OrderConvertRequest, OrderResponse, OrderCloseRequest
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Order Management"])


@router.post(
    "/convert",
    response_model=APIResponse[OrderResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Convert Accepted Quotation to Order",
    description="Converts an accepted quotation into an active project order, snapshots hardware components, and creates a pending installation job.",
)
async def convert_quotation(
    convert_in: OrderConvertRequest,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    order = await OrderService.convert_quotation_to_order(db, convert_in)
    return APIResponse(
        success=True,
        message="Quotation converted to project order successfully",
        data=OrderResponse.model_validate(order),
    )


@router.get(
    "",
    response_model=PaginatedResponse[OrderResponse],
    summary="List Orders",
)
async def list_orders(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    customer_id: Optional[uuid.UUID] = Query(None),
    order_status: Optional[OrderStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await OrderService.list_orders(
        db, page=page, size=size, customer_id=customer_id, order_status=order_status, payment_status=payment_status
    )
    return PaginatedResponse(
        success=True,
        message="Orders retrieved successfully",
        data=data,
    )


@router.get(
    "/{order_id}",
    response_model=APIResponse[OrderResponse],
    summary="Get Order Details",
)
async def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await OrderService.get_order_by_id(db, order_id)
    return APIResponse(
        success=True,
        message="Order retrieved successfully",
        data=OrderResponse.model_validate(order),
    )


@router.post(
    "/{order_id}/close",
    response_model=APIResponse[OrderResponse],
    summary="Close Project & Complete Order (Admin Only)",
    description="Marks an INSTALLED order as COMPLETED, recording project closure after all approvals, payment conditions, and documentation are satisfied. Warranty remains active.",
)
async def close_order(
    order_id: uuid.UUID,
    close_in: Optional[OrderCloseRequest] = None,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if close_in is None:
        close_in = OrderCloseRequest(closure_notes="Project completed and marked closed by Admin")
    order = await OrderService.close_order(db, order_id, close_in, current_admin)
    return APIResponse(
        success=True,
        message="Project closed successfully. Order marked as COMPLETED.",
        data=OrderResponse.model_validate(order),
    )

