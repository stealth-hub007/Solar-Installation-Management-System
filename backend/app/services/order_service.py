import math
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.quotation import Quotation, QuotationStatus
from app.models.customer import Customer
from app.models.installation import InstallationJob, InstallationChecklist, InstallationStatus
from app.models.survey import SiteSurvey
from app.models.user import User
from app.schemas.order import OrderConvertRequest, OrderCloseRequest, OrderResponse
from app.schemas.common import PaginatedData
from app.core.exceptions import NotFoundException, BadRequestException, ConflictException


class OrderService:
    @staticmethod
    async def convert_quotation_to_order(
        db: AsyncSession,
        convert_in: OrderConvertRequest,
    ) -> Order:
        # 1. Fetch quotation
        stmt = (
            select(Quotation)
            .options(selectinload(Quotation.items))
            .where(Quotation.id == convert_in.quotation_id)
        )
        res = await db.execute(stmt)
        quotation = res.scalar_one_or_none()
        if not quotation:
            raise NotFoundException(message="Quotation not found", error_code="QUOTATION_NOT_FOUND")

        # Business rule: Must be ACCEPTED
        if quotation.status != QuotationStatus.ACCEPTED:
            raise BadRequestException(
                message=f"Only accepted quotations can be converted to an order (current status: {quotation.status.value})",
                error_code="QUOTATION_NOT_ACCEPTED",
            )

        # Check if already converted
        existing_order = await db.execute(select(Order).where(Order.quotation_id == quotation.id))
        if existing_order.scalar_one_or_none():
            raise ConflictException(message="An order already exists for this quotation", error_code="ORDER_EXISTS")

        # 2. Generate unique order number
        today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        total_orders = (await db.execute(select(func.count(Order.id)))).scalar_one()
        order_number = f"ORD-{today_str}-{total_orders + 1:04d}"

        order = Order(
            order_number=order_number,
            customer_id=quotation.customer_id,
            quotation_id=quotation.id,
            total_amount=quotation.final_amount,
            paid_amount=Decimal("0.00"),
            outstanding_amount=quotation.final_amount,
            order_status=OrderStatus.CONFIRMED,
            payment_status=PaymentStatus.PENDING,
            expected_installation_date=convert_in.expected_installation_date,
        )
        db.add(order)
        await db.flush()

        # 3. Copy items
        for q_item in quotation.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=q_item.product_id,
                product_name_snapshot=q_item.product_name_snapshot,
                quantity=q_item.quantity,
                unit_price_snapshot=q_item.unit_price_snapshot,
                total_price=q_item.total_price,
            )
            db.add(order_item)

        # 4. Mark quotation as converted
        quotation.status = QuotationStatus.CONVERTED_TO_ORDER

        # 5. Business Rule 5: Automatically create pending installation job
        total_jobs = (await db.execute(select(func.count(InstallationJob.id)))).scalar_one()
        job_number = f"INS-{today_str}-{total_jobs + 1:04d}"
        survey = await db.get(SiteSurvey, quotation.survey_id)

        installation_job = InstallationJob(
            job_number=job_number,
            order_id=order.id,
            customer_id=order.customer_id,
            assigned_technician_id=survey.assigned_technician_id if survey else None,
            installation_status=InstallationStatus.PENDING_ASSIGNMENT,
            scheduled_date=convert_in.expected_installation_date,
        )
        db.add(installation_job)
        await db.flush()

        # Create blank checklist
        checklist = InstallationChecklist(installation_id=installation_job.id)
        db.add(checklist)

        await db.commit()
        return await OrderService.get_order_by_id(db, order.id)

    @staticmethod
    async def get_order_by_id(db: AsyncSession, order_id: uuid.UUID) -> Order:
        stmt = (
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.payments),
            )
            .where(Order.id == order_id)
        )
        res = await db.execute(stmt)
        order = res.scalar_one_or_none()
        if not order:
            raise NotFoundException(message="Order not found", error_code="ORDER_NOT_FOUND")
        return order

    @staticmethod
    async def list_orders(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        customer_id: Optional[uuid.UUID] = None,
        order_status: Optional[OrderStatus] = None,
        payment_status: Optional[PaymentStatus] = None,
    ) -> PaginatedData[OrderResponse]:
        skip = (page - 1) * size
        stmt = select(Order).options(selectinload(Order.items), selectinload(Order.payments))
        count_stmt = select(func.count(Order.id))

        if customer_id:
            stmt = stmt.where(Order.customer_id == customer_id)
            count_stmt = count_stmt.where(Order.customer_id == customer_id)
        if order_status:
            stmt = stmt.where(Order.order_status == order_status)
            count_stmt = count_stmt.where(Order.order_status == order_status)
        if payment_status:
            stmt = stmt.where(Order.payment_status == payment_status)
            count_stmt = count_stmt.where(Order.payment_status == payment_status)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(Order.created_at.desc()).offset(skip).limit(size)
        res = await db.execute(stmt)
        orders = list(res.scalars().all())

        total_pages = math.ceil(total / size) if total > 0 else 0
        items = [OrderResponse.model_validate(o) for o in orders]
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)

    @staticmethod
    async def close_order(
        db: AsyncSession,
        order_id: uuid.UUID,
        close_in: "OrderCloseRequest",
        closed_by: User,
    ) -> Order:
        """Mark an INSTALLED order as COMPLETED (project closure). Admin only."""
        order = await OrderService.get_order_by_id(db, order_id)

        # Must be INSTALLED to close
        if order.order_status != OrderStatus.INSTALLED:
            raise BadRequestException(
                message=f"Only installed orders can be closed. Current status: {order.order_status.value}",
                error_code="ORDER_NOT_CLOSEABLE",
            )
        if order.outstanding_amount > Decimal("0.00"):
            raise BadRequestException(
                message="The order must be fully paid before project closure",
                error_code="ORDER_NOT_FULLY_PAID",
            )

        order.order_status = OrderStatus.COMPLETED
        await db.commit()
        return await OrderService.get_order_by_id(db, order.id)
