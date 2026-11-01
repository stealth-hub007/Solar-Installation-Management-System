import uuid
import os
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.dependencies.auth import (
    get_current_user,
    require_sales_or_admin,
    require_admin,
    require_technician_or_admin,
)
from app.models.user import User, UserRole
from app.models.survey import SurveyStatus, SurveyApprovalStatus
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.survey import (
    SurveyScheduleCreate, SurveyMeasurementUpdate, SurveyApprovalRequest,
    SurveyResponse, SurveyPhotoResponse
)
from app.services.survey_service import SurveyService
from app.core.exceptions import BadRequestException

router = APIRouter(prefix="/surveys", tags=["Site Survey Management"])


@router.post(
    "",
    response_model=APIResponse[SurveyResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Schedule Site Survey",
    description="Schedules a technical rooftop inspection and assigns a field technician.",
)
async def schedule_survey(
    schedule_in: SurveyScheduleCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    survey = await SurveyService.schedule_survey(db, schedule_in)
    return APIResponse(
        success=True,
        message="Site survey scheduled successfully",
        data=await SurveyService.get_survey_response(db, survey.id),
    )


@router.get(
    "",
    response_model=PaginatedResponse[SurveyResponse],
    summary="List Site Surveys",
    description="Retrieves site surveys with filters for technician, approval status, and survey progress.",
)
async def list_surveys(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    technician_id: Optional[uuid.UUID] = Query(None),
    approval_status: Optional[SurveyApprovalStatus] = Query(None),
    survey_status: Optional[SurveyStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Technicians default to their own assigned surveys if not admin
    effective_tech_id = technician_id
    if current_user.role == UserRole.TECHNICIAN:
        effective_tech_id = current_user.id

    data = await SurveyService.list_surveys(
        db,
        page=page,
        size=size,
        technician_id=effective_tech_id,
        approval_status=approval_status,
        survey_status=survey_status,
    )
    return PaginatedResponse(
        success=True,
        message="Site surveys retrieved successfully",
        data=data,
    )


@router.get(
    "/{survey_id}",
    response_model=APIResponse[SurveyResponse],
    summary="Get Survey Details",
    description="Returns full survey measurements, roof orientation, and uploaded photographs.",
)
async def get_survey(
    survey_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    survey = await SurveyService.get_survey_by_id(db, survey_id)
    return APIResponse(
        success=True,
        message="Survey retrieved successfully",
        data=await SurveyService.get_survey_response(db, survey.id),
    )


@router.put(
    "/{survey_id}/measurements",
    response_model=APIResponse[SurveyResponse],
    summary="Record Technical Measurements",
    description="Technician records roof area, shadow analysis, orientation, tilt, and cable distance.",
)
async def record_measurements(
    survey_id: uuid.UUID,
    measurements: SurveyMeasurementUpdate,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    survey = await SurveyService.save_measurements(db, survey_id, measurements, current_user)
    return APIResponse(
        success=True,
        message="Survey measurements updated successfully",
        data=await SurveyService.get_survey_response(db, survey.id),
    )


@router.post(
    "/{survey_id}/photos",
    response_model=APIResponse[SurveyPhotoResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload Survey Photograph",
    description="Uploads roof photos, electrical board photos, or obstacle shots.",
)
async def upload_survey_photo(
    survey_id: uuid.UUID,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    if not file.filename:
        raise BadRequestException(message="File must have a valid filename")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise BadRequestException(message="Only image files (.jpg, .jpeg, .png, .webp) are allowed")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "surveys")
    os.makedirs(upload_dir, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}{ext}"
    destination_path = os.path.join(upload_dir, stored_filename)

    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = await SurveyService.add_photo(
        db,
        survey_id=survey_id,
        file_path=destination_path,
        file_name=file.filename,
        caption=caption,
        technician_user=current_user,
    )
    return APIResponse(
        success=True,
        message="Survey photo uploaded successfully",
        data=SurveyPhotoResponse.model_validate(photo),
    )


@router.post(
    "/{survey_id}/submit",
    response_model=APIResponse[SurveyResponse],
    summary="Submit Completed Survey",
    description="Field technician submits the survey for management approval.",
)
async def submit_survey(
    survey_id: uuid.UUID,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    survey = await SurveyService.submit_survey(db, survey_id, current_user)
    return APIResponse(
        success=True,
        message="Site survey submitted for approval",
        data=await SurveyService.get_survey_response(db, survey.id),
    )


@router.post(
    "/{survey_id}/review",
    response_model=APIResponse[SurveyResponse],
    summary="Approve or Reject Survey (Admin Only)",
    description="Management user reviews and marks survey as APPROVED or REJECTED. Quotation creation is locked until approval.",
)
async def review_survey(
    survey_id: uuid.UUID,
    approval_in: SurveyApprovalRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    survey = await SurveyService.review_survey(db, survey_id, approval_in, current_admin)
    return APIResponse(
        success=True,
        message=f"Survey {approval_in.approval_status.value.lower()} successfully",
        data=await SurveyService.get_survey_response(db, survey.id),
    )


@router.patch(
    "/{survey_id}/approve",
    response_model=APIResponse[SurveyResponse],
    summary="Approve Survey (Alias)",
)
@router.post(
    "/{survey_id}/approve",
    response_model=APIResponse[SurveyResponse],
    summary="Approve Survey (Alias)",
)
async def approve_survey_alias(
    survey_id: uuid.UUID,
    approval_in: Optional[SurveyApprovalRequest] = None,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if approval_in is None:
        approval_in = SurveyApprovalRequest(approval_status=SurveyApprovalStatus.APPROVED)
    survey = await SurveyService.review_survey(db, survey_id, approval_in, current_admin)
    return APIResponse(
        success=True,
        message=f"Survey {approval_in.approval_status.value.lower()} successfully",
        data=await SurveyService.get_survey_response(db, survey.id),
    )


@router.patch(
    "/{survey_id}/reject",
    response_model=APIResponse[SurveyResponse],
    summary="Reject Survey (Alias)",
)
@router.post(
    "/{survey_id}/reject",
    response_model=APIResponse[SurveyResponse],
    summary="Reject Survey (Alias)",
)
async def reject_survey_alias(
    survey_id: uuid.UUID,
    approval_in: Optional[SurveyApprovalRequest] = None,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if approval_in is None:
        approval_in = SurveyApprovalRequest(
            approval_status=SurveyApprovalStatus.REJECTED,
            rejection_reason="Rejected by Admin",
        )
    survey = await SurveyService.review_survey(db, survey_id, approval_in, current_admin)
    return APIResponse(
        success=True,
        message=f"Survey {approval_in.approval_status.value.lower()} successfully",
        data=await SurveyService.get_survey_response(db, survey.id),
    )

