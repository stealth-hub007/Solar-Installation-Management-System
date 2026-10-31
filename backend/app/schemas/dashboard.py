from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, ConfigDict


class AdminDashboardResponse(BaseModel):
    total_customers: int
    total_enquiries: int
    total_revenue: Decimal
    total_payments_received: Decimal
    total_outstanding_payments: Decimal
    active_projects_count: int
    unfinished_projects_count: int
    pending_survey_approvals: int
    low_stock_products_count: int
    open_service_tickets_count: int
    estimated_net_profit: Decimal


class SalesDashboardResponse(BaseModel):
    new_enquiries_count: int
    my_assigned_enquiries_count: int
    pending_followups_count: int
    scheduled_surveys_count: int
    approved_surveys_count: int
    draft_quotations_count: int
    accepted_quotations_count: int
    converted_orders_count: int


class TechnicianDashboardResponse(BaseModel):
    # Backward compatible fields
    assigned_surveys_count: int
    pending_surveys_count: int
    assigned_installations_count: int
    completed_installations_count: int
    total_work_hours_logged: Decimal
    assigned_service_tickets_count: int

    # 15 Specific Operational KPIs (Phase 4.1)
    total_assigned_tasks: int = 0
    today_tasks: int = 0
    pending_site_surveys: int = 0
    in_progress_surveys: int = 0
    submitted_surveys: int = 0
    surveys_awaiting_approval: int = 0
    surveys_requiring_corrections: int = 0
    upcoming_site_visits: int = 0
    pending_installations: int = 0
    in_progress_installations: int = 0
    completed_installations: int = 0
    overdue_assignments: int = 0
    pending_equipment_verification: int = 0
    pending_checklists: int = 0
    pending_customer_sign_offs: int = 0


class WarehouseDashboardResponse(BaseModel):
    total_catalog_products: int
    total_stock_units: Decimal
    total_reserved_units: Decimal
    low_stock_alerts_count: int
    pending_dispatches_count: int
    completed_deliveries_count: int


class NotificationResponse(BaseModel):
    id: uuid.UUID
    title: str
    message: str
    event_type: str
    reference_id: Optional[uuid.UUID] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

