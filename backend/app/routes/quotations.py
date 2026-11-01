import uuid
import os
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_sales_or_admin
from app.models.user import User
from app.models.quotation import QuotationStatus
from app.schemas.common import APIResponse, PaginatedResponse
from app.schemas.quotation import QuotationCreate, QuotationResponse
from app.services.quotation_service import QuotationService
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/quotations", tags=["Quotation Management"])


@router.post(
    "",
    response_model=APIResponse[QuotationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate Solar Quotation",
    description="Generates quotation using approved site survey measurements, package components, and automatic pricing.",
)
async def create_quotation(
    quote_in: QuotationCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    quotation = await QuotationService.create_quotation(db, quote_in, current_user)
    return APIResponse(
        success=True,
        message="Quotation created and PDF generated successfully",
        data=await QuotationService.get_quotation_response(db, quotation.id),
    )


@router.get(
    "",
    response_model=PaginatedResponse[QuotationResponse],
    summary="List Quotations",
)
async def list_quotations(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    customer_id: Optional[uuid.UUID] = Query(None),
    status: Optional[QuotationStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await QuotationService.list_quotations(
        db, page=page, size=size, customer_id=customer_id, status=status
    )
    return PaginatedResponse(
        success=True,
        message="Quotations retrieved successfully",
        data=data,
    )


@router.get(
    "/{quotation_id}",
    response_model=APIResponse[QuotationResponse],
    summary="Get Quotation Details",
)
async def get_quotation(
    quotation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    quotation = await QuotationService.get_quotation_response(db, quotation_id)
    return APIResponse(
        success=True,
        message="Quotation retrieved successfully",
        data=quotation,
    )


@router.post(
    "/{quotation_id}/accept",
    response_model=APIResponse[QuotationResponse],
    summary="Accept Quotation",
    description="Customer accepts the quotation terms. Unlocks conversion into an official installation order.",
)
async def accept_quotation(
    quotation_id: uuid.UUID,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    quotation = await QuotationService.accept_quotation(db, quotation_id)
    return APIResponse(
        success=True,
        message="Quotation marked as ACCEPTED",
        data=await QuotationService.get_quotation_response(db, quotation.id),
    )


@router.post(
    "/{quotation_id}/reject",
    response_model=APIResponse[QuotationResponse],
    summary="Reject Quotation",
)
async def reject_quotation(
    quotation_id: uuid.UUID,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    quotation = await QuotationService.reject_quotation(db, quotation_id)
    return APIResponse(
        success=True,
        message="Quotation marked as REJECTED",
        data=await QuotationService.get_quotation_response(db, quotation.id),
    )


@router.get(
    "/{quotation_id}/pdf",
    summary="Download Quotation PDF",
)
async def download_quotation_pdf(
    quotation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    quotation = await QuotationService.get_quotation_by_id(db, quotation_id)
    if not quotation.pdf_path or not os.path.exists(quotation.pdf_path):
        raise NotFoundException(message="Quotation PDF file not found on server")

    return FileResponse(
        path=quotation.pdf_path,
        media_type="application/pdf",
        filename=f"{quotation.quotation_number}.pdf",
    )
