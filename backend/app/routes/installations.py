import uuid
import os
import shutil
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.dependencies.auth import get_current_user, require_admin, require_technician_or_admin
from app.models.user import User, UserRole
from app.models.installation import InstallationStatus
from app.schemas.common import APIResponse
from app.schemas.installation import (
    InstallationAssignRequest, ChecklistUpdateRequest, WorkLogCreate,
    CustomerSignoffRequest, InstallationCompleteRequest,
    InstallationJobResponse, ChecklistResponse, WorkLogResponse, CustomerSignoffResponse
)
from app.services.installation_service import InstallationService
from app.core.exceptions import BadRequestException

router = APIRouter(prefix="/installations", tags=["Installation Management"])


@router.get(
    "",
    response_model=APIResponse[List[InstallationJobResponse]],
    summary="List Installation Jobs",
)
async def list_jobs(
    status: Optional[InstallationStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    effective_tech_id = current_user.id if current_user.role == UserRole.TECHNICIAN else None
    jobs = await InstallationService.list_jobs(db, technician_id=effective_tech_id, status=status)
    enriched_jobs = [await InstallationService.enrich_job(db, j) for j in jobs]
    return APIResponse(
        success=True,
        message="Installation jobs retrieved successfully",
        data=enriched_jobs,
    )


@router.get(
    "/{installation_id}",
    response_model=APIResponse[InstallationJobResponse],
    summary="Get Installation Job Details",
)
async def get_job(
    installation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job = await InstallationService.get_job_by_id(db, installation_id)
    return APIResponse(
        success=True,
        message="Installation job retrieved successfully",
        data=await InstallationService.enrich_job(db, job),
    )


@router.post(
    "/{installation_id}/assign",
    response_model=APIResponse[InstallationJobResponse],
    summary="Assign Field Technician (Admin Only)",
)
async def assign_technician(
    installation_id: uuid.UUID,
    assign_in: InstallationAssignRequest,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    job = await InstallationService.assign_technician(db, installation_id, assign_in)
    return APIResponse(
        success=True,
        message="Field technician assigned and installation scheduled",
        data=await InstallationService.enrich_job(db, job),
    )


@router.post(
    "/{installation_id}/start",
    response_model=APIResponse[InstallationJobResponse],
    summary="Start Installation Job",
)
async def start_installation(
    installation_id: uuid.UUID,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    job = await InstallationService.start_installation(db, installation_id, current_user)
    return APIResponse(
        success=True,
        message="Installation job started",
        data=await InstallationService.enrich_job(db, job),
    )


@router.put(
    "/{installation_id}/checklist",
    response_model=APIResponse[ChecklistResponse],
    summary="Update Installation Checklist",
    description="Updates verification checklist items for mounting stands, panels, inverters, cabling, safety, and earthing.",
)
async def update_checklist(
    installation_id: uuid.UUID,
    checklist_in: ChecklistUpdateRequest,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    checklist = await InstallationService.update_checklist(db, installation_id, checklist_in, current_user)
    return APIResponse(
        success=True,
        message="Installation checklist updated successfully",
        data=ChecklistResponse.model_validate(checklist),
    )


@router.post(
    "/{installation_id}/work-logs",
    response_model=APIResponse[WorkLogResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Log Technician Work Hours",
    description="Records technician on-site labor hours for accurate project costing.",
)
async def log_work_hours(
    installation_id: uuid.UUID,
    log_in: WorkLogCreate,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    work_log = await InstallationService.log_work_hours(db, installation_id, log_in, current_user)
    return APIResponse(
        success=True,
        message="Technician work log recorded successfully",
        data=WorkLogResponse.model_validate(work_log),
    )


@router.post(
    "/{installation_id}/signoff",
    response_model=APIResponse[CustomerSignoffResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Capture Customer Digital Sign-off",
    description="Uploads customer signature proof confirming system inspection and verified solar generation.",
)
async def capture_signoff(
    installation_id: uuid.UUID,
    customer_name: str = Form(...),
    feedback_rating: int = Form(5),
    feedback_remarks: Optional[str] = Form(None),
    signature_file: UploadFile = File(...),
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    sig_dir = os.path.join(settings.UPLOAD_DIR, "signatures")
    os.makedirs(sig_dir, exist_ok=True)
    ext = os.path.splitext(signature_file.filename or "sig.png")[1]
    sig_path = os.path.join(sig_dir, f"{uuid.uuid4()}{ext}")

    with open(sig_path, "wb") as buffer:
        shutil.copyfileobj(signature_file.file, buffer)

    signoff_in = CustomerSignoffRequest(
        customer_name=customer_name,
        feedback_rating=feedback_rating,
        feedback_remarks=feedback_remarks,
    )
    signoff = await InstallationService.capture_customer_signoff(
        db, installation_id, signoff_in, sig_path, current_user
    )
    return APIResponse(
        success=True,
        message="Customer sign-off recorded successfully",
        data=CustomerSignoffResponse.model_validate(signoff),
    )


@router.post(
    "/{installation_id}/complete",
    response_model=APIResponse[InstallationJobResponse],
    summary="Complete Installation",
    description="Validates that checklist is 100% complete and customer signoff is present before completing job.",
)
async def complete_job(
    installation_id: uuid.UUID,
    complete_in: InstallationCompleteRequest,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    job = await InstallationService.complete_installation(db, installation_id, complete_in, current_user)
    return APIResponse(
        success=True,
        message="Installation completed and verified successfully",
        data=await InstallationService.enrich_job(db, job),
    )
