import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_warehouse_or_admin
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.inventory import (
    StockAddRequest, StockAdjustmentRequest, InventoryResponse
)
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/inventory", tags=["Inventory Management"])


@router.get(
    "",
    response_model=APIResponse[List[InventoryResponse]],
    summary="Get Warehouse Inventory Levels",
    description="Returns real-time physical, reserved, and available stock levels, flagging products below minimum reorder point.",
)
async def get_inventory(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    inventory_list = await InventoryService.list_inventory(db)
    return APIResponse(
        success=True,
        message="Inventory levels retrieved successfully",
        data=inventory_list,
    )


@router.post(
    "/add-stock",
    response_model=APIResponse[InventoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Add Stock (Warehouse / Admin)",
    description="Increases physical stock and records purchase cost in the stock movement ledger.",
)
async def add_stock(
    add_in: StockAddRequest,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    inv = await InventoryService.add_stock(db, add_in, current_user)
    return APIResponse(
        success=True,
        message="Stock added successfully",
        data=InventoryResponse(
            id=inv.id,
            product_id=inv.product_id,
            total_quantity=inv.total_quantity,
            reserved_quantity=inv.reserved_quantity,
            available_quantity=inv.available_quantity,
            minimum_stock_level=inv.minimum_stock_level,
            is_low_stock=(inv.available_quantity <= inv.minimum_stock_level),
            updated_at=inv.updated_at,
        ),
    )


@router.post(
    "/adjust-stock",
    response_model=APIResponse[InventoryResponse],
    summary="Adjust Stock Through Physical Audit",
    description="Updates total quantity to physical count and logs an audit adjustment.",
)
async def adjust_stock(
    adj_in: StockAdjustmentRequest,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    inv = await InventoryService.adjust_stock(db, adj_in, current_user)
    return APIResponse(
        success=True,
        message="Stock adjusted successfully",
        data=InventoryResponse(
            id=inv.id,
            product_id=inv.product_id,
            total_quantity=inv.total_quantity,
            reserved_quantity=inv.reserved_quantity,
            available_quantity=inv.available_quantity,
            minimum_stock_level=inv.minimum_stock_level,
            is_low_stock=(inv.available_quantity <= inv.minimum_stock_level),
            updated_at=inv.updated_at,
        ),
    )


@router.post(
    "/reserve/{order_id}",
    response_model=APIResponse[None],
    summary="Reserve Stock for Order",
    description="Locks inventory quantities for an active customer order, ensuring stock is preserved prior to dispatch.",
)
async def reserve_stock(
    order_id: uuid.UUID,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    await InventoryService.reserve_stock_for_order(db, order_id, current_user)
    return APIResponse(
        success=True,
        message="Stock successfully reserved for order",
        data=None,
    )

