import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.common import APIResponse, PaginatedResponse, PaginatedData
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserStatusUpdate,
    UserResponse,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["User Management"])


@router.post(
    "",
    response_model=APIResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create User Account (Admin Only)",
    description="Registers a new system user account with assigned role (Sales, Technician, Warehouse, Admin).",
)
async def create_user(
    user_in: UserCreate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    created_user = await UserService.create_user(db, user_in)
    return APIResponse(
        success=True,
        message="User account created successfully",
        data=UserResponse.model_validate(created_user),
    )


@router.get(
    "",
    response_model=PaginatedResponse[UserResponse],
    summary="List Users (Admin Only)",
    description="Retrieves a paginated list of users with optional filtering by role, status, and search query.",
)
async def list_users(
    page: int = Query(default=1, ge=1, description="Page number"),
    size: int = Query(default=20, ge=1, le=100, description="Page size"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    paginated_data = await UserService.list_users(
        db, page=page, size=size, role=role, is_active=is_active, search=search
    )
    return PaginatedResponse(
        success=True,
        message="Users retrieved successfully",
        data=paginated_data,
    )


@router.get(
    "/{user_id}",
    response_model=APIResponse[UserResponse],
    summary="Get User Details",
    description="Retrieves detailed user profile by ID (accessible by Admin or the user themselves).",
)
async def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Allow self or admin
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        user_to_return = await UserService.get_user_by_id(db, current_user.id)
    else:
        user_to_return = await UserService.get_user_by_id(db, user_id)

    return APIResponse(
        success=True,
        message="User retrieved successfully",
        data=UserResponse.model_validate(user_to_return),
    )


@router.put(
    "/{user_id}",
    response_model=APIResponse[UserResponse],
    summary="Update User (Admin Only)",
    description="Updates user profile information and assigned role.",
)
async def update_user(
    user_id: uuid.UUID,
    update_in: UserUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = await UserService.update_user(db, user_id, update_in)
    return APIResponse(
        success=True,
        message="User updated successfully",
        data=UserResponse.model_validate(updated),
    )


@router.patch(
    "/{user_id}/status",
    response_model=APIResponse[UserResponse],
    summary="Activate/Deactivate User (Admin Only)",
    description="Enables or disables user account access. Admins cannot deactivate their own account.",
)
async def update_user_status(
    user_id: uuid.UUID,
    status_in: UserStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = await UserService.update_status(
        db, user_id=user_id, current_user_id=current_admin.id, is_active=status_in.is_active
    )
    action_text = "activated" if status_in.is_active else "deactivated"
    return APIResponse(
        success=True,
        message=f"User account {action_text} successfully",
        data=UserResponse.model_validate(updated),
    )

