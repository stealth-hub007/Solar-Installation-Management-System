import math
import uuid
import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.order import Order, Payment, PaymentStatus, PaymentType, PaymentRecordStatus
from app.models.customer import Customer
from app.models.user import User
from app.schemas.order import PaymentCreate, PaymentResponse
from app.utils.pdf_generator import PDFGenerator
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.config import settings


class PaymentService:
    @staticmethod
    async def record_payment(
        db: AsyncSession,
        payment_in: PaymentCreate,
        current_user: User,
    ) -> Payment:
        order = await db.get(Order, payment_in.order_id)
        if not order:
            raise NotFoundException(message="Order not found", error_code="ORDER_NOT_FOUND")

        # Business Rule: Payment amounts must not exceed the outstanding balance
        if payment_in.payment_type != PaymentType.ADJUSTMENT and payment_in.amount > order.outstanding_amount:
            raise BadRequestException(
                message=f"Payment amount (₹{payment_in.amount}) exceeds outstanding balance (₹{order.outstanding_amount})",
                error_code="PAYMENT_EXCEEDS_BALANCE",
            )

        # Generate unique payment number
        today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        total_payments = (await db.execute(select(func.count(Payment.id)))).scalar_one()
        payment_number = f"PAY-{today_str}-{total_payments + 1:04d}"

        payment = Payment(
            payment_number=payment_number,
            order_id=order.id,
            amount=payment_in.amount,
            payment_method=payment_in.payment_method,
            reference_number=payment_in.reference_number,
            payment_type=payment_in.payment_type,
            payment_status=PaymentRecordStatus.VERIFIED,
            remarks=payment_in.remarks,
            recorded_by_id=current_user.id,
        )
        db.add(payment)

        # Update order amounts
        order.paid_amount += payment_in.amount
        order.outstanding_amount = max(Decimal("0.00"), order.total_amount - order.paid_amount)

        if order.outstanding_amount == Decimal("0.00"):
            order.payment_status = PaymentStatus.FULLY_PAID
        elif order.paid_amount > Decimal("0.00"):
            order.payment_status = PaymentStatus.PARTIALLY_PAID

        # Generate PDF receipt
        customer = await db.get(Customer, order.customer_id)
        pdf_dir = os.path.join(settings.UPLOAD_DIR, "documents")
        os.makedirs(pdf_dir, exist_ok=True)
        pdf_path = os.path.join(pdf_dir, f"{payment_number}.pdf")

        PDFGenerator.generate_receipt_pdf(
            output_path=pdf_path,
            receipt_number=payment_number,
            order_number=order.order_number,
            customer_name=customer.name if customer else "Customer",
            payment_date=datetime.now(timezone.utc).strftime("%d-%b-%Y %H:%M"),
            amount=payment_in.amount,
            payment_method=payment_in.payment_method.value,
            reference_no=payment_in.reference_number or "N/A",
        )
        payment.receipt_pdf_path = pdf_path

        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def get_payment_by_id(db: AsyncSession, payment_id: uuid.UUID) -> Payment:
        payment = await db.get(Payment, payment_id)
        if not payment:
            raise NotFoundException(message="Payment record not found")
        return payment

    @staticmethod
    async def list_payments_for_order(db: AsyncSession, order_id: uuid.UUID) -> List[Payment]:
        stmt = select(Payment).where(Payment.order_id == order_id).order_by(Payment.payment_date.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

