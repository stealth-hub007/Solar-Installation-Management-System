import uuid
import os
from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_sales_or_admin
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.order import PaymentCreate, PaymentResponse
from app.services.payment_service import PaymentService
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/payments", tags=["Payment Management"])


@router.post(
    "",
    response_model=APIResponse[PaymentResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Record Customer Payment",
    description="Records customer advance or partial payment, calculates remaining balance, and generates a PDF receipt.",
)
async def record_payment(
    payment_in: PaymentCreate,
    current_user: User = Depends(require_sales_or_admin),
    db: AsyncSession = Depends(get_db),
):
    payment = await PaymentService.record_payment(db, payment_in, current_user)
    return APIResponse(
        success=True,
        message="Payment recorded and receipt generated successfully",
        data=PaymentResponse.model_validate(payment),
    )


@router.get(
    "/order/{order_id}",
    response_model=APIResponse[List[PaymentResponse]],
    summary="List Payments for Order",
)
async def list_order_payments(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payments = await PaymentService.list_payments_for_order(db, order_id)
    return APIResponse(
        success=True,
        message="Payments retrieved successfully",
        data=[PaymentResponse.model_validate(p) for p in payments],
    )


@router.get(
    "/{payment_id}/receipt",
    summary="Download Payment Receipt PDF",
)
async def download_receipt(
    payment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    payment = await PaymentService.get_payment_by_id(db, payment_id)
    if not payment.receipt_pdf_path or not os.path.exists(payment.receipt_pdf_path):
        raise NotFoundException(message="Receipt PDF not found")

    return FileResponse(
        path=payment.receipt_pdf_path,
        media_type="application/pdf",
        filename=f"{payment.payment_number}.pdf",
    )

