import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_sales_or_admin
from app.models.user import User
from app.models.customer import LeadStatus, EnquirySource
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.customer import (
    EnquiryCreate, EnquiryUpdate, EnquiryAssign, EnquiryStatusUpdate,
    FollowupCreate, EnquiryResponse, FollowupResponse
)
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/enquiries", tags=["Enquiry & Lead Management"])


@router.post(
    "",
    response_model=APIResponse[EnquiryResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register Solar Enquiry",
    description="Captures new solar leads from WhatsApp, phone calls, web forms, or manual walk-ins.",
)
async def create_enquiry(
    enquiry_in: EnquiryCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    enquiry = await CustomerService.create_enquiry(db, enquiry_in)
    return APIResponse(
        success=True,
        message="Enquiry registered successfully",
        data=EnquiryResponse.model_validate(enquiry),
    )


@router.get(
    "",
    response_model=PaginatedResponse[EnquiryResponse],
    summary="List Enquiries",
    description="Retrieves a paginated list of solar enquiries with status, source, and sales assignment filters.",
)
async def list_enquiries(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    lead_status: Optional[LeadStatus] = Query(None),
    source: Optional[EnquirySource] = Query(None),
    assigned_sales_id: Optional[uuid.UUID] = Query(None),
    customer_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await CustomerService.list_enquiries(
        db,
        page=page,
        size=size,
        status=lead_status,
        source=source,
        assigned_sales_id=assigned_sales_id,
        customer_id=customer_id,
    )
    return PaginatedResponse(
        success=True,
        message="Enquiries retrieved successfully",
        data=data,
    )


@router.get(
    "/pending-followups",
    response_model=APIResponse[List[EnquiryResponse]],
    summary="Get Pending Follow-ups",
    description="Lists enquiries requiring immediate or upcoming follow-up calls/visits.",
)
async def get_pending_followups(
    sales_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    # Default to current user's followups if sales executive
    effective_sales_id = sales_id or (current_user.id if current_user.role == "SALES" else None)
    followups = await CustomerService.get_pending_followups(db, effective_sales_id)
    return APIResponse(
        success=True,
        message="Pending follow-ups retrieved successfully",
        data=followups,
    )


@router.get(
    "/{enquiry_id}",
    response_model=APIResponse[EnquiryResponse],
    summary="Get Enquiry Details",
    description="Returns detailed enquiry info including customer details and full follow-up history.",
)
async def get_enquiry(
    enquiry_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    enquiry = await CustomerService.get_enquiry_by_id(db, enquiry_id)
    return APIResponse(
        success=True,
        message="Enquiry retrieved successfully",
        data=EnquiryResponse.model_validate(enquiry),
    )


@router.patch(
    "/{enquiry_id}/assign",
    response_model=APIResponse[EnquiryResponse],
    summary="Assign Sales Executive",
    description="Assigns or reassigns an enquiry lead to a specific Sales Executive.",
)
async def assign_sales_executive(
    enquiry_id: uuid.UUID,
    assign_in: EnquiryAssign,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = await CustomerService.assign_sales(db, enquiry_id, assign_in.assigned_sales_id)
    return APIResponse(
        success=True,
        message="Sales executive assigned successfully",
        data=EnquiryResponse.model_validate(updated),
    )


@router.patch(
    "/{enquiry_id}/status",
    response_model=APIResponse[EnquiryResponse],
    summary="Update Lead Status",
    description="Updates the lead stage of an enquiry.",
)
async def update_enquiry_status(
    enquiry_id: uuid.UUID,
    status_in: EnquiryStatusUpdate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    updated = await CustomerService.update_status(
        db, enquiry_id, status_in.lead_status, status_in.remarks
    )
    return APIResponse(
        success=True,
        message="Lead status updated successfully",
        data=EnquiryResponse.model_validate(updated),
    )


@router.post(
    "/{enquiry_id}/followups",
    response_model=APIResponse[FollowupResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Record Follow-up",
    description="Records notes from a customer sales call/meeting and updates next scheduled follow-up.",
)
async def add_followup_entry(
    enquiry_id: uuid.UUID,
    followup_in: FollowupCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    followup = await CustomerService.add_followup(
        db, enquiry_id=enquiry_id, user_id=current_user.id, followup_in=followup_in
    )
    return APIResponse(
        success=True,
        message="Follow-up recorded successfully",
        data=FollowupResponse.model_validate(followup),
    )

