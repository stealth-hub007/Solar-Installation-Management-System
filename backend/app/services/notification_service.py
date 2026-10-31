import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_

from app.models.system import Notification
from app.models.user import User, UserRole
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
    async def notify_admins(
        db: AsyncSession,
        title: str,
        message: str,
        event_type: str = "USER_REGISTRATION",
        reference_id: Optional[uuid.UUID] = None,
    ) -> List[Notification]:
        """Broadcasts a notification to all active system administrators."""
        stmt = select(User).where(User.role == UserRole.ADMIN, User.is_active == True)
        res = await db.execute(stmt)
        admins = res.scalars().all()
        created = []
        for admin in admins:
            notif = Notification(
                user_id=admin.id,
                title=title,
                message=message,
                event_type=event_type,
                reference_id=reference_id,
                is_read=False,
            )
            db.add(notif)
            created.append(notif)
        if created:
            await db.commit()
            for n in created:
                await db.refresh(n)
        return created

    @staticmethod
    async def list_user_notifications(
        db: AsyncSession,
        user_id: uuid.UUID,
        is_admin: bool = False,
    ) -> List[Notification]:
        if is_admin:
            stmt = (
                select(Notification)
                .where(
                    or_(
                        Notification.user_id == user_id,
                        Notification.event_type.in_(["USER_REGISTRATION", "APPROVAL_REQUEST", "SYSTEM_ALERT"]),
                    )
                )
                .order_by(Notification.created_at.desc())
                .limit(50)
            )
        else:
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
        stmt = select(Notification).where(
            Notification.id == notification_id,
            or_(Notification.user_id == user_id, Notification.event_type == "USER_REGISTRATION"),
        )
        res = await db.execute(stmt)
        notification = res.scalar_one_or_none()
        if notification:
            notification.is_read = True
            await db.commit()

    @staticmethod
    async def mark_all_read(db: AsyncSession, user_id: uuid.UUID) -> None:
        stmt = (
            update(Notification)
            .where(or_(Notification.user_id == user_id, Notification.event_type == "USER_REGISTRATION"))
            .values(is_read=True)
        )
        await db.execute(stmt)
        await db.commit()


