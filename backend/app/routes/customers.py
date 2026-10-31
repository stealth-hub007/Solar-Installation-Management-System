import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_sales_or_admin
from app.models.user import User
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, AddressCreate,
    CustomerResponse, AddressResponse
)
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customer Management"])


@router.post(
    "",
    response_model=APIResponse[CustomerResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Customer",
    description="Registers a new customer record with optional primary address.",
)
async def create_customer(
    customer_in: CustomerCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    customer = await CustomerService.create_customer(db, customer_in)
    return APIResponse(
        success=True,
        message="Customer registered successfully",
        data=CustomerResponse.model_validate(customer),
    )


@router.get(
    "",
    response_model=PaginatedResponse[CustomerResponse],
    summary="List Customers",
    description="Retrieves a paginated list of customers with search and active status filters.",
)
async def list_customers(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name, phone, or email"),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await CustomerService.list_customers(
        db, page=page, size=size, search=search, is_active=is_active
    )
    return PaginatedResponse(
        success=True,
        message="Customers retrieved successfully",
        data=data,
    )


@router.get(
    "/{customer_id}",
    response_model=APIResponse[CustomerResponse],
    summary="Get Customer Details",
    description="Returns detailed customer information including all registered installation addresses.",
)
async def get_customer(
    customer_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    customer = await CustomerService.get_customer_by_id(db, customer_id)
    return APIResponse(
        success=True,
        message="Customer retrieved successfully",
        data=CustomerResponse.model_validate(customer),
    )


@router.put(
    "/{customer_id}",
    response_model=APIResponse[CustomerResponse],
    summary="Update Customer",
    description="Updates customer personal details.",
)
async def update_customer(
    customer_id: uuid.UUID,
    update_in: CustomerUpdate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = await CustomerService.update_customer(db, customer_id, update_in)
    return APIResponse(
        success=True,
        message="Customer updated successfully",
        data=CustomerResponse.model_validate(updated),
    )


@router.post(
    "/{customer_id}/addresses",
    response_model=APIResponse[AddressResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add Customer Project Address",
    description="Registers an additional site installation address for an existing customer.",
)
async def add_customer_address(
    customer_id: uuid.UUID,
    address_in: AddressCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    address = await CustomerService.add_address(db, customer_id, address_in)
    return APIResponse(
        success=True,
        message="Address added successfully",
        data=AddressResponse.model_validate(address),
    )

