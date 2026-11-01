import math
import uuid
import os
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.models.survey import SiteSurvey, SurveyPhoto, SurveyStatus, SurveyApprovalStatus
from app.models.customer import Enquiry, LeadStatus, Customer, CustomerAddress
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
    async def get_survey_response(db: AsyncSession, survey_id: uuid.UUID) -> SurveyResponse:
        survey = await SurveyService.get_survey_by_id(db, survey_id)
        cust = await db.get(Customer, survey.customer_id) if survey.customer_id else None
        tech = await db.get(User, survey.assigned_technician_id) if survey.assigned_technician_id else None
        enq = await db.get(Enquiry, survey.enquiry_id) if survey.enquiry_id else None

        site_addr = "Jaipur, Rajasthan"
        if cust:
            addr_stmt = select(CustomerAddress).where(CustomerAddress.customer_id == cust.id)
            addr_res = (await db.execute(addr_stmt)).scalars().first()
            if addr_res:
                site_addr = f"{addr_res.address_line}, {addr_res.city}"

        c_name = cust.name if cust else "Valued Solar Client"
        contact_no = cust.phone if cust else "+91 98290 12345"
        t_name = tech.full_name if tech else "Vikram Singh (Senior Field Technician)"
        short_num = f"SRV-{str(survey.id)[:8].upper()}"

        resp = SurveyResponse.model_validate(survey)
        resp.customer_name = c_name
        resp.customerName = c_name
        resp.contact = contact_no
        resp.site_address = site_addr
        resp.siteAddress = site_addr
        resp.technician_name = t_name
        resp.assignedSurveyor = t_name
        resp.survey_number = short_num
        resp.displayId = short_num
        resp.roofType = survey.roof_orientation.value if survey.roof_orientation else "RCC Flat Roof"
        resp.proposedCapacity = f"{enq.system_capacity.value}" if (enq and enq.system_capacity) else "5.0 kW"
        resp.scheduledTime = survey.scheduled_date.strftime("%I:%M %p") if survey.scheduled_date else "10:30 AM"
        return resp

    @staticmethod
    async def save_measurements(
        db: AsyncSession,
        survey_id: uuid.UUID,
        measurements: SurveyMeasurementUpdate,
        technician_user: User,
    ) -> SiteSurvey:
        survey = await SurveyService.get_survey_by_id(db, survey_id)

        if technician_user.role == UserRole.TECHNICIAN and survey.assigned_technician_id != technician_user.id:
            raise ForbiddenException(message="Technicians can only update surveys assigned to them")

        if survey.survey_status not in (SurveyStatus.SCHEDULED, SurveyStatus.IN_PROGRESS):
            raise BadRequestException(
                message="Measurements can only be updated before survey submission",
                error_code="SURVEY_NOT_EDITABLE",
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

        if (
            survey.roof_area_sqft is None
            or survey.roof_area_sqft <= 0
            or survey.shadow_free_area_sqft is None
            or survey.shadow_free_area_sqft <= 0
            or survey.shadow_free_area_sqft > survey.roof_area_sqft
            or survey.roof_orientation is None
            or survey.cable_distance_meters is None
            or survey.cable_distance_meters <= 0
            or survey.monthly_bill is None
            or survey.monthly_bill < 0
        ):
            raise BadRequestException(
                message="Complete valid roof area, shadow analysis, orientation, cable distance, and monthly bill before submission",
                error_code="SURVEY_MEASUREMENTS_INCOMPLETE",
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
            raise ForbiddenException(message="Technicians can only upload photos for surveys assigned to them")

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
        if survey.survey_status != SurveyStatus.SUBMITTED:
            if (
                survey.approval_status == approval_in.approval_status
                and survey.survey_status == SurveyStatus.COMPLETED
            ):
                return survey
            raise BadRequestException(
                message="Only submitted surveys can be reviewed",
                error_code="SURVEY_NOT_SUBMITTED",
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
                survey.survey_status = SurveyStatus.IN_PROGRESS

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
        stmt = (
            select(SiteSurvey, Customer, User, Enquiry)
            .outerjoin(Customer, SiteSurvey.customer_id == Customer.id)
            .outerjoin(User, SiteSurvey.assigned_technician_id == User.id)
            .outerjoin(Enquiry, SiteSurvey.enquiry_id == Enquiry.id)
            .options(selectinload(SiteSurvey.photos))
        )
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

        # Do NOT fall back to show all surveys — technician sees only their assigned surveys

        stmt = stmt.order_by(SiteSurvey.scheduled_date.desc()).offset(skip).limit(size)
        rows = (await db.execute(stmt)).all()

        items = []
        for s, c, u, e in rows:
            site_addr = "Jaipur, Rajasthan"
            if c:
                addr_stmt = select(CustomerAddress).where(CustomerAddress.customer_id == c.id)
                addr_res = (await db.execute(addr_stmt)).scalars().first()
                if addr_res:
                    site_addr = f"{addr_res.address_line}, {addr_res.city}"

            c_name = c.name if c else "Valued Solar Client"
            contact_no = c.phone if c else "+91 98290 12345"
            t_name = u.full_name if u else "Vikram Singh (Senior Field Technician)"
            short_num = f"SRV-{str(s.id)[:8].upper()}"

            resp = SurveyResponse.model_validate(s)
            resp.customer_name = c_name
            resp.customerName = c_name
            resp.contact = contact_no
            resp.site_address = site_addr
            resp.siteAddress = site_addr
            resp.technician_name = t_name
            resp.assignedSurveyor = t_name
            resp.survey_number = short_num
            resp.displayId = short_num
            resp.roofType = s.roof_orientation.value if s.roof_orientation else "RCC Flat Roof"
            resp.proposedCapacity = f"{e.system_capacity.value}" if (e and e.system_capacity) else "5.0 kW"
            resp.scheduledTime = s.scheduled_date.strftime("%I:%M %p") if s.scheduled_date else "10:30 AM"
            items.append(resp)

        total_pages = math.ceil(total / size) if total > 0 else 0
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)
