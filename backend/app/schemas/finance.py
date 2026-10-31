from typing import Optional, List
from datetime import datetime
import uuid
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

from app.models.finance import ExpenseCategory, SubsidyStatus


class ExpenseCreate(BaseModel):
    order_id: uuid.UUID
    expense_category: ExpenseCategory = ExpenseCategory.MISCELLANEOUS
    amount: Decimal = Field(..., gt=0)
    description: str = Field(..., min_length=3)
    expense_date: Optional[datetime] = None


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    order_id: uuid.UUID
    expense_category: ExpenseCategory
    amount: Decimal
    expense_date: datetime
    description: str
    recorded_by_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectProfitabilityResponse(BaseModel):
    order_id: uuid.UUID
    order_number: str
    customer_id: uuid.UUID
    billed_revenue: Decimal
    cash_collected: Decimal
    outstanding_receivable: Decimal
    equipment_purchase_cost: Decimal
    technician_labour_cost: Decimal
    direct_project_expenses: Decimal
    total_project_cost: Decimal
    net_profit: Decimal
    profit_margin_percentage: Decimal


class FinancialSummaryReport(BaseModel):
    total_orders_count: int
    total_billed_revenue: Decimal
    total_cash_collected: Decimal
    total_outstanding_receivables: Decimal
    total_equipment_cost: Decimal
    total_technician_labour_cost: Decimal
    total_direct_expenses: Decimal
    total_cost_of_delivery: Decimal
    total_net_profit: Decimal
    overall_profit_margin_percentage: Decimal

