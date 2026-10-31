import math
import uuid
import os
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.installation import (
    InstallationJob, InstallationChecklist, InstallationPhoto,
    TechnicianWorkLog, InstallationSignoff, InstallationStatus
)
from app.models.order import Order, OrderStatus
from app.models.user import User, UserRole
from app.schemas.installation import (
    InstallationAssignRequest, ChecklistUpdateRequest, WorkLogCreate,
    CustomerSignoffRequest, InstallationCompleteRequest, InstallationJobResponse
)
from app.schemas.common import PaginatedData
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from app.core.config import settings


class InstallationService:
    @staticmethod
    async def get_job_by_id(db: AsyncSession, job_id: uuid.UUID) -> InstallationJob:
        stmt = (
            select(InstallationJob)
            .options(
                selectinload(InstallationJob.checklist),
                selectinload(InstallationJob.photos),
                selectinload(InstallationJob.signoff),
                selectinload(InstallationJob.work_logs),
            )
            .where(InstallationJob.id == job_id)
        )
        res = await db.execute(stmt)
        job = res.scalar_one_or_none()
        if not job:
            raise NotFoundException(message="Installation job not found", error_code="INSTALLATION_JOB_NOT_FOUND")
        return job

    @staticmethod
    async def assign_technician(
        db: AsyncSession,
        job_id: uuid.UUID,
        assign_in: InstallationAssignRequest,
    ) -> InstallationJob:
        job = await InstallationService.get_job_by_id(db, job_id)

        technician = await db.get(User, assign_in.technician_id)
        if not technician or technician.role != UserRole.TECHNICIAN:
            raise BadRequestException(
                message="Assigned user must be an active Field Technician",
                error_code="INVALID_TECHNICIAN",
            )

        job.assigned_technician_id = technician.id
        job.scheduled_date = assign_in.scheduled_date
        job.installation_status = InstallationStatus.SCHEDULED

        await db.commit()
        await db.refresh(job)
        return job

    @staticmethod
    async def start_installation(
        db: AsyncSession,
        job_id: uuid.UUID,
        technician: User,
    ) -> InstallationJob:
        job = await InstallationService.get_job_by_id(db, job_id)
        if technician.role == UserRole.TECHNICIAN and job.assigned_technician_id != technician.id:
            raise ForbiddenException(message="Technicians can only start their own assigned installation jobs")

        job.installation_status = InstallationStatus.IN_PROGRESS
        if not job.start_time:
            job.start_time = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(job)
        return job

    @staticmethod
    async def update_checklist(
        db: AsyncSession,
        job_id: uuid.UUID,
        checklist_in: ChecklistUpdateRequest,
        technician: User,
    ) -> InstallationChecklist:
        job = await InstallationService.get_job_by_id(db, job_id)
        if technician.role == UserRole.TECHNICIAN and job.assigned_technician_id != technician.id:
            raise ForbiddenException(message="Technicians can only update checklists for assigned jobs")

        checklist = job.checklist
        if not checklist:
            checklist = InstallationChecklist(installation_id=job.id)
            db.add(checklist)

        for field, val in checklist_in.model_dump(exclude_unset=True).items():
            setattr(checklist, field, val)

        await db.commit()
        await db.refresh(checklist)
        return checklist

    @staticmethod
    async def log_work_hours(
        db: AsyncSession,
        job_id: uuid.UUID,
        log_in: WorkLogCreate,
        technician: User,
    ) -> TechnicianWorkLog:
        job = await InstallationService.get_job_by_id(db, job_id)

        # Calculate duration
        duration_seconds = (log_in.end_time - log_in.start_time).total_seconds()
        if duration_seconds <= 0:
            raise BadRequestException(message="End time must be after start time")

        total_hours = Decimal(str(round(duration_seconds / 3600.0, 2)))
        total_cost = (total_hours * log_in.hourly_rate).quantize(Decimal("0.01"))

        work_log = TechnicianWorkLog(
            technician_id=technician.id,
            installation_id=job.id,
            start_time=log_in.start_time,
            end_time=log_in.end_time,
            total_hours=total_hours,
            hourly_rate=log_in.hourly_rate,
            total_cost=total_cost,
        )
        db.add(work_log)
        await db.commit()
        await db.refresh(work_log)
        return work_log

    @staticmethod
    async def capture_customer_signoff(
        db: AsyncSession,
        job_id: uuid.UUID,
        signoff_in: CustomerSignoffRequest,
        signature_path: str,
    ) -> InstallationSignoff:
        job = await InstallationService.get_job_by_id(db, job_id)

        if job.signoff:
            signoff = job.signoff
            signoff.customer_name = signoff_in.customer_name
            signoff.signature_path = signature_path
            signoff.feedback_rating = signoff_in.feedback_rating
            signoff.feedback_remarks = signoff_in.feedback_remarks
        else:
            signoff = InstallationSignoff(
                installation_id=job.id,
                customer_name=signoff_in.customer_name,
                signature_path=signature_path,
                feedback_rating=signoff_in.feedback_rating,
                feedback_remarks=signoff_in.feedback_remarks,
            )
            db.add(signoff)

        await db.commit()
        await db.refresh(signoff)
        return signoff

    @staticmethod
    async def complete_installation(
        db: AsyncSession,
        job_id: uuid.UUID,
        complete_in: InstallationCompleteRequest,
        technician: User,
    ) -> InstallationJob:
        job = await InstallationService.get_job_by_id(db, job_id)

        # STRICT BUSINESS RULE: Mandatory Checklist Completion
        if not job.checklist or not job.checklist.is_fully_completed():
            raise BadRequestException(
                message="Installation completion requires all mandatory checklist items to be verified (stands, panels, inverter, wiring, safety, earthing, testing)",
                error_code="INCOMPLETE_INSTALLATION_CHECKLIST",
            )

        # STRICT BUSINESS RULE: Mandatory Customer Sign-off
        if not job.signoff:
            raise BadRequestException(
                message="Installation completion requires customer digital sign-off and satisfaction rating",
                error_code="CUSTOMER_SIGNOFF_REQUIRED",
            )

        job.power_generated_watts = complete_in.power_generated_watts
        job.testing_results = complete_in.testing_results
        job.remarks = complete_in.remarks
        job.installation_status = InstallationStatus.COMPLETED
        job.end_time = datetime.now(timezone.utc)

        # Update order status
        order = await db.get(Order, job.order_id)
        if order:
            order.order_status = OrderStatus.INSTALLED

        await db.commit()
        await db.refresh(job)
        return job

    @staticmethod
    async def list_jobs(
        db: AsyncSession,
        technician_id: Optional[uuid.UUID] = None,
        status: Optional[InstallationStatus] = None,
    ) -> List[InstallationJob]:
        stmt = (
            select(InstallationJob)
            .options(
                selectinload(InstallationJob.checklist),
                selectinload(InstallationJob.signoff),
                selectinload(InstallationJob.work_logs),
            )
            .order_by(InstallationJob.created_at.desc())
        )
        if technician_id:
            stmt = stmt.where(InstallationJob.assigned_technician_id == technician_id)
        if status:
            stmt = stmt.where(InstallationJob.installation_status == status)

        res = await db.execute(stmt)
        return list(res.scalars().all())

