import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole, AccountStatus
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserStatusUpdate,
    UserResponse,
    UserApprovalRequest,
    UserRejectionRequest,
    UserSuspensionRequest,
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
    description="Retrieves a paginated list of users with optional filtering by role, account status, active flag, and search query.",
)
async def list_users(
    page: int = Query(default=1, ge=1, description="Page number"),
    size: int = Query(default=20, ge=1, le=100, description="Page size"),
    role: Optional[UserRole] = Query(None, description="Filter by user role"),
    account_status: Optional[AccountStatus] = Query(None, description="Filter by approval status (PENDING, APPROVED, REJECTED, SUSPENDED)"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name, email, or phone"),
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    paginated_data = await UserService.list_users(
        db,
        page=page,
        size=size,
        role=role,
        account_status=account_status,
        is_active=is_active,
        search=search,
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
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        user_to_return = await UserService.get_user_by_id(db, current_user.id)
    else:
        user_to_return = await UserService.get_user_by_id(db, user_id)

    return APIResponse(
        success=True,
        message="User retrieved successfully",
        data=UserResponse.model_validate(user_to_return),
    )


@router.post(
    "/{user_id}/approve",
    response_model=APIResponse[UserResponse],
    summary="Approve User & Assign Role (Admin Only)",
    description="Approves a pending registration and assigns an operational role (Admin, Sales, Warehouse, Technician).",
)
async def approve_user(
    user_id: uuid.UUID,
    approval_in: UserApprovalRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    approved = await UserService.approve_user(
        db, user_id=user_id, current_admin_id=current_admin.id, approve_in=approval_in
    )
    return APIResponse(
        success=True,
        message=f"User {approved.full_name} has been approved and assigned the {approved.role.value} role.",
        data=UserResponse.model_validate(approved),
    )


@router.post(
    "/{user_id}/reject",
    response_model=APIResponse[UserResponse],
    summary="Reject User Application (Admin Only)",
    description="Rejects a pending user application with an optional reason.",
)
async def reject_user(
    user_id: uuid.UUID,
    rejection_in: UserRejectionRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    rejected = await UserService.reject_user(db, user_id=user_id, reject_in=rejection_in)
    return APIResponse(
        success=True,
        message=f"User {rejected.full_name} has been rejected.",
        data=UserResponse.model_validate(rejected),
    )


@router.post(
    "/{user_id}/suspend",
    response_model=APIResponse[UserResponse],
    summary="Suspend User Account (Admin Only)",
    description="Suspends an active user account with reason.",
)
async def suspend_user(
    user_id: uuid.UUID,
    suspension_in: UserSuspensionRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    suspended = await UserService.suspend_user(
        db, user_id=user_id, current_admin_id=current_admin.id, suspend_in=suspension_in
    )
    return APIResponse(
        success=True,
        message=f"User {suspended.full_name} has been suspended.",
        data=UserResponse.model_validate(suspended),
    )


@router.post(
    "/{user_id}/reactivate",
    response_model=APIResponse[UserResponse],
    summary="Reactivate User Account (Admin Only)",
    description="Restores a suspended or rejected user back to APPROVED status.",
)
async def reactivate_user(
    user_id: uuid.UUID,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    reactivated = await UserService.reactivate_user(db, user_id=user_id)
    return APIResponse(
        success=True,
        message=f"User {reactivated.full_name} account has been reactivated.",
        data=UserResponse.model_validate(reactivated),
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
