import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.customer import Customer, Enquiry, LeadStatus
from app.models.survey import SiteSurvey, SurveyApprovalStatus, SurveyStatus
from app.models.quotation import Quotation, QuotationStatus
from app.models.order import Order, OrderStatus
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.installation import InstallationJob, InstallationStatus, TechnicianWorkLog
from app.models.service_ticket import ServiceTicket, TicketStatus
from app.models.dispatch import Dispatch, DispatchStatus
from app.models.user import User
from app.schemas.dashboard import (
    AdminDashboardResponse,
    SalesDashboardResponse,
    TechnicianDashboardResponse,
    WarehouseDashboardResponse,
)
from app.services.finance_service import FinanceService


class DashboardService:
    @staticmethod
    async def get_admin_dashboard(db: AsyncSession) -> AdminDashboardResponse:
        total_cust = (await db.execute(select(func.count(Customer.id)))).scalar_one()
        total_enq = (await db.execute(select(func.count(Enquiry.id)))).scalar_one()

        orders_res = await db.execute(select(Order))
        orders = list(orders_res.scalars().all())

        total_rev = sum(o.total_amount for o in orders) if orders else Decimal("0.00")
        total_paid = sum(o.paid_amount for o in orders) if orders else Decimal("0.00")
        total_out = sum(o.outstanding_amount for o in orders) if orders else Decimal("0.00")

        active_projects = sum(1 for o in orders if o.order_status in [OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS, OrderStatus.DISPATCHED])
        unfinished_projects = sum(1 for o in orders if o.order_status != OrderStatus.COMPLETED)

        pending_surveys = (await db.execute(
            select(func.count(SiteSurvey.id)).where(SiteSurvey.approval_status == SurveyApprovalStatus.PENDING_APPROVAL)
        )).scalar_one()

        open_tickets = (await db.execute(
            select(func.count(ServiceTicket.id)).where(ServiceTicket.ticket_status != TicketStatus.CLOSED)
        )).scalar_one()

        # Low stock
        low_stock_res = await db.execute(
            select(func.count(Inventory.id)).where(
                (Inventory.total_quantity - Inventory.reserved_quantity) <= Inventory.minimum_stock_level
            )
        )
        low_stock_count = low_stock_res.scalar_one()

        financial_summary = await FinanceService.get_financial_summary(db)

        return AdminDashboardResponse(
            total_customers=total_cust,
            total_enquiries=total_enq,
            total_revenue=total_rev,
            total_payments_received=total_paid,
            total_outstanding_payments=total_out,
            active_projects_count=active_projects,
            unfinished_projects_count=unfinished_projects,
            pending_survey_approvals=pending_surveys,
            low_stock_products_count=low_stock_count,
            open_service_tickets_count=open_tickets,
            estimated_net_profit=financial_summary.total_net_profit,
        )

    @staticmethod
    async def get_sales_dashboard(db: AsyncSession, sales_user: User) -> SalesDashboardResponse:
        new_enq = (await db.execute(select(func.count(Enquiry.id)).where(Enquiry.lead_status == LeadStatus.NEW))).scalar_one()
        assigned_enq = (await db.execute(
            select(func.count(Enquiry.id)).where(Enquiry.assigned_sales_id == sales_user.id)
        )).scalar_one()

        pending_followups = (await db.execute(
            select(func.count(Enquiry.id)).where(
                Enquiry.assigned_sales_id == sales_user.id,
                Enquiry.next_followup_date.is_not(None),
                Enquiry.lead_status.notin_([LeadStatus.CONVERTED, LeadStatus.REJECTED]),
            )
        )).scalar_one()

        sched_surveys = (await db.execute(
            select(func.count(SiteSurvey.id)).where(SiteSurvey.survey_status == SurveyStatus.SCHEDULED)
        )).scalar_one()

        approved_surveys = (await db.execute(
            select(func.count(SiteSurvey.id)).where(SiteSurvey.approval_status == SurveyApprovalStatus.APPROVED)
        )).scalar_one()

        draft_quotes = (await db.execute(
            select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.DRAFT)
        )).scalar_one()

        accepted_quotes = (await db.execute(
            select(func.count(Quotation.id)).where(Quotation.status == QuotationStatus.ACCEPTED)
        )).scalar_one()

        converted_orders = (await db.execute(select(func.count(Order.id)))).scalar_one()

        return SalesDashboardResponse(
            new_enquiries_count=new_enq,
            my_assigned_enquiries_count=assigned_enq,
            pending_followups_count=pending_followups,
            scheduled_surveys_count=sched_surveys,
            approved_surveys_count=approved_surveys,
            draft_quotations_count=draft_quotes,
            accepted_quotations_count=accepted_quotes,
            converted_orders_count=converted_orders,
        )

    @staticmethod
    async def get_technician_dashboard(db: AsyncSession, tech_user: User) -> TechnicianDashboardResponse:
        assigned_surveys = (await db.execute(
            select(func.count(SiteSurvey.id)).where(SiteSurvey.assigned_technician_id == tech_user.id)
        )).scalar_one()

        pending_surveys = (await db.execute(
            select(func.count(SiteSurvey.id)).where(
                SiteSurvey.assigned_technician_id == tech_user.id,
                SiteSurvey.survey_status.in_([SurveyStatus.SCHEDULED, SurveyStatus.IN_PROGRESS]),
            )
        )).scalar_one()

        assigned_inst = (await db.execute(
            select(func.count(InstallationJob.id)).where(InstallationJob.assigned_technician_id == tech_user.id)
        )).scalar_one()

        completed_inst = (await db.execute(
            select(func.count(InstallationJob.id)).where(
                InstallationJob.assigned_technician_id == tech_user.id,
                InstallationJob.installation_status == InstallationStatus.COMPLETED,
            )
        )).scalar_one()

        hours_res = await db.execute(
            select(func.coalesce(func.sum(TechnicianWorkLog.total_hours), Decimal("0.00"))).where(
                TechnicianWorkLog.technician_id == tech_user.id
            )
        )
        total_hours = hours_res.scalar_one()

        assigned_tickets = (await db.execute(
            select(func.count(ServiceTicket.id)).where(
                ServiceTicket.assigned_technician_id == tech_user.id,
                ServiceTicket.ticket_status != TicketStatus.CLOSED,
            )
        )).scalar_one()

        return TechnicianDashboardResponse(
            assigned_surveys_count=assigned_surveys,
            pending_surveys_count=pending_surveys,
            assigned_installations_count=assigned_inst,
            completed_installations_count=completed_inst,
            total_work_hours_logged=total_hours,
            assigned_service_tickets_count=assigned_tickets,
        )

    @staticmethod
    async def get_warehouse_dashboard(db: AsyncSession) -> WarehouseDashboardResponse:
        total_products = (await db.execute(select(func.count(Product.id)))).scalar_one()

        inv_res = await db.execute(select(Inventory))
        inventories = list(inv_res.scalars().all())

        total_units = sum(i.total_quantity for i in inventories) if inventories else Decimal("0.00")
        reserved_units = sum(i.reserved_quantity for i in inventories) if inventories else Decimal("0.00")
        low_stock = sum(1 for i in inventories if (i.total_quantity - i.reserved_quantity) <= i.minimum_stock_level)

        pending_dispatches = (await db.execute(
            select(func.count(Dispatch.id)).where(Dispatch.dispatch_status == DispatchStatus.PREPARING)
        )).scalar_one()

        completed_deliveries = (await db.execute(
            select(func.count(Dispatch.id)).where(Dispatch.dispatch_status == DispatchStatus.DELIVERED)
        )).scalar_one()

        return WarehouseDashboardResponse(
            total_catalog_products=total_products,
            total_stock_units=total_units,
            total_reserved_units=reserved_units,
            low_stock_alerts_count=low_stock,
            pending_dispatches_count=pending_dispatches,
            completed_deliveries_count=completed_deliveries,
        )

