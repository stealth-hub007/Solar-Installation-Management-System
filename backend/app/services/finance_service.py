import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.finance import ProjectExpense, ExpenseCategory
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.installation import InstallationJob, TechnicianWorkLog
from app.models.user import User
from app.schemas.finance import ExpenseCreate, ProjectProfitabilityResponse, FinancialSummaryReport
from app.core.exceptions import NotFoundException


class FinanceService:
    @staticmethod
    async def record_expense(
        db: AsyncSession,
        expense_in: ExpenseCreate,
        current_user: User,
    ) -> ProjectExpense:
        order = await db.get(Order, expense_in.order_id)
        if not order:
            raise NotFoundException(message="Order not found")

        expense = ProjectExpense(
            order_id=order.id,
            expense_category=expense_in.expense_category,
            amount=expense_in.amount,
            expense_date=expense_in.expense_date or datetime.now(timezone.utc),
            description=expense_in.description.strip(),
            recorded_by_id=current_user.id,
        )
        db.add(expense)
        await db.commit()
        await db.refresh(expense)
        return expense

    @staticmethod
    async def list_expenses_for_order(db: AsyncSession, order_id: uuid.UUID) -> List[ProjectExpense]:
        stmt = select(ProjectExpense).where(ProjectExpense.order_id == order_id).order_by(ProjectExpense.expense_date.desc())
        res = await db.execute(stmt)
        return list(res.scalars().all())

    @staticmethod
    async def calculate_project_profitability(db: AsyncSession, order_id: uuid.UUID) -> ProjectProfitabilityResponse:
        order = await db.get(Order, order_id)
        if not order:
            raise NotFoundException(message="Order not found")

        # 1. Equipment costs
        order_items_res = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
        order_items = list(order_items_res.scalars().all())

        equipment_cost = Decimal("0.00")
        for itm in order_items:
            product = await db.get(Product, itm.product_id)
            if product:
                equipment_cost += itm.quantity * product.purchase_cost

        # 2. Technician work log costs
        jobs_res = await db.execute(select(InstallationJob).where(InstallationJob.order_id == order.id))
        jobs = list(jobs_res.scalars().all())
        job_ids = [j.id for j in jobs]

        technician_cost = Decimal("0.00")
        if job_ids:
            work_logs_res = await db.execute(
                select(func.coalesce(func.sum(TechnicianWorkLog.total_cost), Decimal("0.00"))).where(
                    TechnicianWorkLog.installation_id.in_(job_ids)
                )
            )
            technician_cost = work_logs_res.scalar_one()

        # 3. Direct project expenses (excluding hardware purchases to prevent double counting)
        expenses_res = await db.execute(
            select(func.coalesce(func.sum(ProjectExpense.amount), Decimal("0.00"))).where(
                ProjectExpense.order_id == order.id,
                ProjectExpense.expense_category != ExpenseCategory.HARDWARE_PURCHASE,
            )
        )
        direct_expenses = expenses_res.scalar_one()

        total_cost = equipment_cost + technician_cost + direct_expenses
        net_profit = order.total_amount - total_cost
        margin_pct = (
            (net_profit / order.total_amount * Decimal("100.00")).quantize(Decimal("0.01"))
            if order.total_amount > Decimal("0.00")
            else Decimal("0.00")
        )

        return ProjectProfitabilityResponse(
            order_id=order.id,
            order_number=order.order_number,
            customer_id=order.customer_id,
            billed_revenue=order.total_amount,
            cash_collected=order.paid_amount,
            outstanding_receivable=order.outstanding_amount,
            equipment_purchase_cost=equipment_cost,
            technician_labour_cost=technician_cost,
            direct_project_expenses=direct_expenses,
            total_project_cost=total_cost,
            net_profit=net_profit,
            profit_margin_percentage=margin_pct,
        )

    @staticmethod
    async def get_financial_summary(db: AsyncSession) -> FinancialSummaryReport:
        orders_res = await db.execute(select(Order))
        orders = list(orders_res.scalars().all())

        total_orders = len(orders)
        total_billed = sum(o.total_amount for o in orders) if orders else Decimal("0.00")
        total_cash = sum(o.paid_amount for o in orders) if orders else Decimal("0.00")
        total_outstanding = sum(o.outstanding_amount for o in orders) if orders else Decimal("0.00")

        total_equipment = Decimal("0.00")
        total_tech = Decimal("0.00")
        total_expenses = Decimal("0.00")

        for o in orders:
            p = await FinanceService.calculate_project_profitability(db, o.id)
            total_equipment += p.equipment_purchase_cost
            total_tech += p.technician_labour_cost
            total_expenses += p.direct_project_expenses

        total_delivery_cost = total_equipment + total_tech + total_expenses
        net_profit = total_billed - total_delivery_cost
        margin = (
            (net_profit / total_billed * Decimal("100.00")).quantize(Decimal("0.01"))
            if total_billed > Decimal("0.00")
            else Decimal("0.00")
        )

        return FinancialSummaryReport(
            total_orders_count=total_orders,
            total_billed_revenue=total_billed,
            total_cash_collected=total_cash,
            total_outstanding_receivables=total_outstanding,
            total_equipment_cost=total_equipment,
            total_technician_labour_cost=total_tech,
            total_direct_expenses=total_expenses,
            total_cost_of_delivery=total_delivery_cost,
            total_net_profit=net_profit,
            overall_profit_margin_percentage=margin,
        )

