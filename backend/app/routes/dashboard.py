from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User, UserRole
from app.schemas.common import APIResponse
from app.schemas.dashboard import (
    AdminDashboardResponse, SalesDashboardResponse,
    TechnicianDashboardResponse, WarehouseDashboardResponse
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard Metrics"])


@router.get(
    "/admin",
    response_model=APIResponse[AdminDashboardResponse],
    summary="Executive / Management Dashboard",
    description="Returns key executive KPIs: customer counts, active revenue, collected payments, outstanding balance, open service tickets, and net profit.",
)
async def get_admin_dashboard(
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    metrics = await DashboardService.get_admin_dashboard(db)
    return APIResponse(
        success=True,
        message="Admin metrics loaded successfully",
        data=metrics,
    )


@router.get(
    "/sales",
    response_model=APIResponse[SalesDashboardResponse],
    summary="Sales Executive Dashboard",
    description="Returns personal sales pipeline metrics: new enquiries, pending followups, approved surveys, and converted orders.",
)
async def get_sales_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    metrics = await DashboardService.get_sales_dashboard(db, current_user)
    return APIResponse(
        success=True,
        message="Sales metrics loaded successfully",
        data=metrics,
    )


@router.get(
    "/technician",
    response_model=APIResponse[TechnicianDashboardResponse],
    summary="Field Technician Dashboard",
    description="Returns field workload: assigned surveys, assigned installations, and total hours logged.",
)
async def get_technician_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    metrics = await DashboardService.get_technician_dashboard(db, current_user)
    return APIResponse(
        success=True,
        message="Technician metrics loaded successfully",
        data=metrics,
    )


@router.get(
    "/warehouse",
    response_model=APIResponse[WarehouseDashboardResponse],
    summary="Warehouse Manager Dashboard",
    description="Returns logistics KPIs: total catalog items, stock units, reserved inventory, low stock warnings, and pending dispatches.",
)
async def get_warehouse_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    metrics = await DashboardService.get_warehouse_dashboard(db)
    return APIResponse(
        success=True,
        message="Warehouse metrics loaded successfully",
        data=metrics,
    )

