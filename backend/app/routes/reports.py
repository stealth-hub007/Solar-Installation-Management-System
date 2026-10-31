import uuid
import io
import csv
from typing import List
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.user import User
from app.models.order import Order
from app.schemas.common import APIResponse
from app.schemas.finance import ProjectProfitabilityResponse, FinancialSummaryReport
from app.services.finance_service import FinanceService

router = APIRouter(prefix="/reports", tags=["Financial & Management Reporting"])


@router.get(
    "/summary",
    response_model=APIResponse[FinancialSummaryReport],
    summary="Get Financial Executive Summary",
    description="Calculates company-wide total revenue, collected cash, outstanding receivables, equipment costs, labor costs, and overall profit margin.",
)
async def get_summary(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    summary = await FinanceService.get_financial_summary(db)
    return APIResponse(
        success=True,
        message="Financial summary computed successfully",
        data=summary,
    )


@router.get(
    "/profitability/{order_id}",
    response_model=APIResponse[ProjectProfitabilityResponse],
    summary="Get Project Profitability",
    description="Calculates recognized project revenue, actual hardware purchase costs, logged technician hours, and project margin.",
)
async def get_project_profitability(
    order_id: uuid.UUID,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    profitability = await FinanceService.calculate_project_profitability(db, order_id)
    return APIResponse(
        success=True,
        message="Project profitability computed successfully",
        data=profitability,
    )


@router.get(
    "/profitability/export/csv",
    summary="Export Project Profitability Report to CSV",
)
async def export_profitability_csv(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    orders_res = await db.execute(select(Order).order_by(Order.order_date.desc()))
    orders = list(orders_res.scalars().all())

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order Number",
        "Order Date",
        "Billed Revenue (INR)",
        "Cash Collected (INR)",
        "Outstanding (INR)",
        "Equipment Cost (INR)",
        "Technician Cost (INR)",
        "Direct Expenses (INR)",
        "Total Cost (INR)",
        "Net Profit (INR)",
        "Profit Margin (%)",
    ])

    for o in orders:
        p = await FinanceService.calculate_project_profitability(db, o.id)
        writer.writerow([
            p.order_number,
            o.order_date.strftime("%Y-%m-%d"),
            f"{p.billed_revenue:.2f}",
            f"{p.cash_collected:.2f}",
            f"{p.outstanding_receivable:.2f}",
            f"{p.equipment_purchase_cost:.2f}",
            f"{p.technician_labour_cost:.2f}",
            f"{p.direct_project_expenses:.2f}",
            f"{p.total_project_cost:.2f}",
            f"{p.net_profit:.2f}",
            f"{p.profit_margin_percentage:.2f}%",
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=project_profitability_report.csv"},
    )

