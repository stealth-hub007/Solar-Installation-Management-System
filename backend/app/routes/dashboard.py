from typing import Optional, List, Any
from fastapi import APIRouter, Depends, Query, Body
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


# ==============================================================================
# FRONTEND ADMIN PORTAL INTEGRATION ENDPOINTS (API_CONTRACT.md)
# ==============================================================================

@router.get("/stats", summary="Executive KPI Summary for Frontend Portal")
async def get_dashboard_stats(
    timeRange: Optional[str] = Query("30d"),
    time_range: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    selected_range = time_range or timeRange or "30d"
    stats = await DashboardService.get_dashboard_stats(db, time_range=selected_range)
    return {"success": True, "data": stats}


@router.get("/analytics/revenue", summary="Monthly Revenue Analytics")
async def get_revenue_analytics(
    period: Optional[str] = Query("12m"),
    timeRange: Optional[str] = Query(None),
    time_range: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    selected_period = time_range or timeRange or period or "12m"
    series = await DashboardService.get_revenue_analytics(db, period=selected_period)
    return {"success": True, "data": series}


@router.get("/analytics/project-status", summary="Project Status Distribution")
async def get_project_status_analytics(db: AsyncSession = Depends(get_db)):
    dist = await DashboardService.get_project_status_analytics(db)
    return {"success": True, "data": dist}


@router.get("/analytics/installations", summary="Weekly Installation Velocity")
async def get_installation_analytics(db: AsyncSession = Depends(get_db)):
    data = await DashboardService.get_installation_analytics(db)
    return {"success": True, "data": data}


@router.get("/analytics/inventory", summary="Inventory Capacity and Buffers")
async def get_inventory_analytics(db: AsyncSession = Depends(get_db)):
    data = await DashboardService.get_inventory_analytics(db)
    return {"success": True, "data": data}


@router.get("/alerts", summary="Operational System Alerts")
async def get_operational_alerts(
    severity: str = "all",
    db: AsyncSession = Depends(get_db),
):
    alerts = await DashboardService.get_operational_alerts(db, severity=severity)
    return {"success": True, "data": alerts}


@router.post("/alerts", summary="Broadcast or Create Operational Alert")
async def create_operational_alert(
    alert_data: dict = Body(...),
    db: AsyncSession = Depends(get_db),
):
    # In real world, saves to notification table or dispatches alert
    return {"success": True, "data": {**alert_data, "id": "ALT-NEW-101"}}


@router.delete("/alerts/{alert_id}", summary="Acknowledge or Resolve Alert")
async def delete_operational_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
):
    return {"success": True, "message": f"Alert {alert_id} resolved"}


@router.get("/recent-projects", summary="Paginated Recent Projects for Dashboard")
async def get_recent_projects(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    sortBy: Optional[str] = None,
    sortDirection: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_recent_projects(
        db,
        page=page,
        page_size=pageSize,
        search=search,
        status=status,
        sort_by=sortBy,
        sort_direction=sortDirection,
    )


@router.get("/recent-payments", summary="Paginated Recent Payments for Dashboard")
async def get_recent_payments(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    sortBy: Optional[str] = None,
    sortDirection: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_recent_payments(
        db,
        page=page,
        page_size=pageSize,
        search=search,
        status=status,
        sort_by=sortBy,
        sort_direction=sortDirection,
    )


@router.get("/recent-enquiries", summary="Paginated Recent Enquiries for Dashboard")
async def get_recent_enquiries(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    sortBy: Optional[str] = None,
    sortDirection: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_recent_enquiries(
        db,
        page=page,
        page_size=pageSize,
        search=search,
        status=status,
        sort_by=sortBy,
        sort_direction=sortDirection,
    )


@router.get("/recent-service-tickets", summary="Paginated Recent Service Tickets for Dashboard")
async def get_recent_service_tickets(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    priority: Optional[str] = None,
    sortBy: Optional[str] = None,
    sortDirection: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_recent_service_tickets(
        db,
        page=page,
        page_size=pageSize,
        search=search,
        priority=priority,
        sort_by=sortBy,
        sort_direction=sortDirection,
    )


@router.get("/recent-activity", summary="Paginated Recent Activity for Dashboard")
async def get_recent_activity(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    module: Optional[str] = None,
    sortBy: Optional[str] = None,
    sortDirection: str = "desc",
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService.get_recent_activity(
        db,
        page=page,
        page_size=pageSize,
        search=search,
        module=module,
        sort_by=sortBy,
        sort_direction=sortDirection,
    )



