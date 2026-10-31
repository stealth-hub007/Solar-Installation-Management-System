import math
import uuid
import os
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.survey import SiteSurvey, SurveyPhoto, SurveyStatus, SurveyApprovalStatus
from app.models.customer import Enquiry, LeadStatus
from app.models.user import User, UserRole
from app.schemas.survey import (
    SurveyScheduleCreate, SurveyMeasurementUpdate, SurveyApprovalRequest, SurveyResponse
)
from app.schemas.common import PaginatedData
from app.core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from app.core.config import settings


class SurveyService:
    @staticmethod
    async def schedule_survey(db: AsyncSession, schedule_in: SurveyScheduleCreate) -> SiteSurvey:
        enquiry = await db.get(Enquiry, schedule_in.enquiry_id)
        if not enquiry:
            raise NotFoundException(message="Enquiry not found", error_code="ENQUIRY_NOT_FOUND")

        technician = await db.get(User, schedule_in.assigned_technician_id)
        if not technician or technician.role != UserRole.TECHNICIAN:
            raise BadRequestException(
                message="Assigned user must be an active Field Technician",
                error_code="INVALID_TECHNICIAN",
            )

        survey = SiteSurvey(
            enquiry_id=enquiry.id,
            customer_id=enquiry.customer_id,
            assigned_technician_id=technician.id,
            scheduled_date=schedule_in.scheduled_date,
            survey_status=SurveyStatus.SCHEDULED,
            approval_status=SurveyApprovalStatus.PENDING_APPROVAL,
        )
        db.add(survey)

        # Update enquiry status
        enquiry.lead_status = LeadStatus.SURVEY_SCHEDULED
        await db.commit()
        return await SurveyService.get_survey_by_id(db, survey.id)

    @staticmethod
    async def get_survey_by_id(db: AsyncSession, survey_id: uuid.UUID) -> SiteSurvey:
        stmt = (
            select(SiteSurvey)
            .options(selectinload(SiteSurvey.photos))
            .where(SiteSurvey.id == survey_id)
        )
        res = await db.execute(stmt)
        survey = res.scalar_one_or_none()
        if not survey:
            raise NotFoundException(message="Site survey not found", error_code="SURVEY_NOT_FOUND")
        return survey

    @staticmethod
    async def save_measurements(
        db: AsyncSession,
        survey_id: uuid.UUID,
        measurements: SurveyMeasurementUpdate,
        technician_user: User,
    ) -> SiteSurvey:
        survey = await SurveyService.get_survey_by_id(db, survey_id)

        # Technician boundary check
        if technician_user.role == UserRole.TECHNICIAN and survey.assigned_technician_id != technician_user.id:
            raise ForbiddenException(
                message="Technicians can only update their own assigned surveys",
                error_code="FORBIDDEN_SURVEY_ACCESS",
            )

        for field, val in measurements.model_dump(exclude_unset=True).items():
            setattr(survey, field, val)

        if survey.survey_status == SurveyStatus.SCHEDULED:
            survey.survey_status = SurveyStatus.IN_PROGRESS

        await db.commit()
        await db.refresh(survey)
        return survey

    @staticmethod
    async def submit_survey(db: AsyncSession, survey_id: uuid.UUID, technician_user: User) -> SiteSurvey:
        survey = await SurveyService.save_measurements(db, survey_id, SurveyMeasurementUpdate(), technician_user)

        if not survey.roof_area_sqft:
            raise BadRequestException(
                message="Roof area measurement is required before survey submission",
                error_code="INCOMPLETE_MEASUREMENTS",
            )

        survey.survey_status = SurveyStatus.SUBMITTED
        await db.commit()
        await db.refresh(survey)
        return survey

    @staticmethod
    async def add_photo(
        db: AsyncSession,
        survey_id: uuid.UUID,
        file_path: str,
        file_name: str,
        caption: Optional[str],
        technician_user: User,
    ) -> SurveyPhoto:
        survey = await SurveyService.get_survey_by_id(db, survey_id)
        if technician_user.role == UserRole.TECHNICIAN and survey.assigned_technician_id != technician_user.id:
            raise ForbiddenException(message="Technicians can only upload to assigned surveys")

        photo = SurveyPhoto(
            survey_id=survey.id,
            file_path=file_path,
            file_name=file_name,
            caption=caption,
        )
        db.add(photo)
        await db.commit()
        await db.refresh(photo)
        return photo

    @staticmethod
    async def review_survey(
        db: AsyncSession,
        survey_id: uuid.UUID,
        approval_in: SurveyApprovalRequest,
        admin_user: User,
    ) -> SiteSurvey:
        survey = await SurveyService.get_survey_by_id(db, survey_id)

        if approval_in.approval_status == SurveyApprovalStatus.REJECTED and not approval_in.rejection_reason:
            raise BadRequestException(
                message="A rejection reason must be provided when rejecting a survey",
                error_code="REJECTION_REASON_REQUIRED",
            )

        survey.approval_status = approval_in.approval_status
        survey.rejection_reason = approval_in.rejection_reason
        survey.reviewed_by_id = admin_user.id
        survey.reviewed_at = datetime.now(timezone.utc)

        enquiry = await db.get(Enquiry, survey.enquiry_id)
        if enquiry:
            if approval_in.approval_status == SurveyApprovalStatus.APPROVED:
                survey.survey_status = SurveyStatus.COMPLETED
                enquiry.lead_status = LeadStatus.SURVEY_COMPLETED
            elif approval_in.approval_status == SurveyApprovalStatus.REJECTED:
                survey.survey_status = SurveyStatus.IN_PROGRESS  # Can be re-measured and submitted

        await db.commit()
        await db.refresh(survey)
        return survey

    @staticmethod
    async def list_surveys(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        technician_id: Optional[uuid.UUID] = None,
        approval_status: Optional[SurveyApprovalStatus] = None,
        survey_status: Optional[SurveyStatus] = None,
    ) -> PaginatedData[SurveyResponse]:
        skip = (page - 1) * size
        stmt = select(SiteSurvey).options(selectinload(SiteSurvey.photos))
        count_stmt = select(func.count(SiteSurvey.id))

        if technician_id:
            stmt = stmt.where(SiteSurvey.assigned_technician_id == technician_id)
            count_stmt = count_stmt.where(SiteSurvey.assigned_technician_id == technician_id)
        if approval_status:
            stmt = stmt.where(SiteSurvey.approval_status == approval_status)
            count_stmt = count_stmt.where(SiteSurvey.approval_status == approval_status)
        if survey_status:
            stmt = stmt.where(SiteSurvey.survey_status == survey_status)
            count_stmt = count_stmt.where(SiteSurvey.survey_status == survey_status)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(SiteSurvey.scheduled_date.desc()).offset(skip).limit(size)
        res = await db.execute(stmt)
        surveys = list(res.scalars().all())

        total_pages = math.ceil(total / size) if total > 0 else 0
        items = [SurveyResponse.model_validate(s) for s in surveys]
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)

