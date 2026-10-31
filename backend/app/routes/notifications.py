import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, UserRole
from app.schemas.common import APIResponse
from app.schemas.dashboard import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["In-App Notifications"])


@router.get(
    "",
    response_model=APIResponse[List[NotificationResponse]],
    summary="Get User Notifications",
)
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_admin = current_user.role == UserRole.ADMIN or current_user.is_superuser
    notifications = await NotificationService.list_user_notifications(db, current_user.id, is_admin=is_admin)
    return APIResponse(
        success=True,
        message="Notifications retrieved successfully",
        data=[NotificationResponse.model_validate(n) for n in notifications],
    )


@router.patch(
    "/mark-all-read",
    response_model=APIResponse[None],
    summary="Mark All Notifications as Read",
)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await NotificationService.mark_all_read(db, current_user.id)
    return APIResponse(
        success=True,
        message="All notifications marked as read",
        data=None,
    )


@router.patch(
    "/{notification_id}/read",
    response_model=APIResponse[None],
    summary="Mark Notification as Read",
)
async def mark_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await NotificationService.mark_as_read(db, notification_id, current_user.id)
    return APIResponse(
        success=True,
        message="Notification marked as read",
        data=None,
    )

