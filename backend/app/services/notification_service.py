import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.system import Notification
from app.schemas.dashboard import NotificationResponse


class NotificationService:
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: uuid.UUID,
        title: str,
        message: str,
        event_type: str,
        reference_id: Optional[uuid.UUID] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            event_type=event_type,
            reference_id=reference_id,
            is_read=False,
        )
        db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    @staticmethod
    async def list_user_notifications(db: AsyncSession, user_id: uuid.UUID) -> List[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(50)
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def mark_as_read(db: AsyncSession, notification_id: uuid.UUID, user_id: uuid.UUID) -> None:
        stmt = select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        res = await db.execute(stmt)
        notification = res.scalar_one_or_none()
        if notification:
            notification.is_read = True
            await db.commit()

