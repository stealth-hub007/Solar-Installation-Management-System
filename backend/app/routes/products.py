import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin, require_warehouse_or_admin
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.product import (
    CategoryCreate, CategoryResponse,
    ProductCreate, ProductUpdate, ProductResponse
)
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Product Management"])


# Categories
@router.post(
    "/categories",
    response_model=APIResponse[CategoryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Product Category (Admin Only)",
)
async def create_category(
    cat_in: CategoryCreate,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    cat = await ProductService.create_category(db, cat_in)
    return APIResponse(
        success=True,
        message="Category created successfully",
        data=CategoryResponse.model_validate(cat),
    )


@router.get(
    "/categories",
    response_model=APIResponse[List[CategoryResponse]],
    summary="List Product Categories",
)
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    categories = await ProductService.list_categories(db)
    return APIResponse(
        success=True,
        message="Categories retrieved successfully",
        data=[CategoryResponse.model_validate(c) for c in categories],
    )


# Products
@router.post(
    "",
    response_model=APIResponse[ProductResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Product (Admin Only)",
    description="Registers new product in the catalog and automatically creates an inventory tracker record.",
)
async def create_product(
    prod_in: ProductCreate,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    prod = await ProductService.create_product(db, prod_in)
    return APIResponse(
        success=True,
        message="Product created successfully",
        data=ProductResponse.model_validate(prod),
    )


@router.get(
    "",
    response_model=PaginatedResponse[ProductResponse],
    summary="List Products",
    description="Lists products with filtering by category, serial tracking status, and search query.",
)
async def list_products(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    category_id: Optional[uuid.UUID] = Query(None),
    is_serial_tracked: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await ProductService.list_products(
        db, page=page, size=size, category_id=category_id, is_serial_tracked=is_serial_tracked, search=search
    )
    return PaginatedResponse(
        success=True,
        message="Products retrieved successfully",
        data=data,
    )


@router.get(
    "/{product_id}",
    response_model=APIResponse[ProductResponse],
    summary="Get Product Details",
)
async def get_product(
    product_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prod = await ProductService.get_product_by_id(db, product_id)
    return APIResponse(
        success=True,
        message="Product retrieved successfully",
        data=ProductResponse.model_validate(prod),
    )


@router.put(
    "/{product_id}",
    response_model=APIResponse[ProductResponse],
    summary="Update Product (Admin Only)",
)
async def update_product(
    product_id: uuid.UUID,
    update_in: ProductUpdate,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = await ProductService.update_product(db, product_id, update_in)
    return APIResponse(
        success=True,
        message="Product updated successfully",
        data=ProductResponse.model_validate(updated),
    )



@router.delete(
    "/{product_id}",
    response_model=APIResponse[None],
    summary="Delete Product (Warehouse / Admin)",
)
async def delete_product(
    product_id: uuid.UUID,
    current_user: User = Depends(require_warehouse_or_admin),
    db: AsyncSession = Depends(get_db),
):
    await ProductService.delete_product(db, product_id)
    return APIResponse(
        success=True,
        message="Product deleted successfully",
        data=None,
    )
