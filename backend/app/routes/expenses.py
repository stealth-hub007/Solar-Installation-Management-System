import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.finance import ExpenseCreate, ExpenseResponse
from app.services.finance_service import FinanceService

router = APIRouter(prefix="/expenses", tags=["Project Expense Management"])


@router.post(
    "",
    response_model=APIResponse[ExpenseResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Record Project Expense",
    description="Logs direct costs (transport, permits, subcontractors, miscellaneous) incurred on a project.",
)
async def record_expense(
    expense_in: ExpenseCreate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    expense = await FinanceService.record_expense(db, expense_in, current_user)
    return APIResponse(
        success=True,
        message="Project expense recorded successfully",
        data=ExpenseResponse.model_validate(expense),
    )


@router.get(
    "/order/{order_id}",
    response_model=APIResponse[List[ExpenseResponse]],
    summary="List Expenses for Order",
)
async def list_order_expenses(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    expenses = await FinanceService.list_expenses_for_order(db, order_id)
    return APIResponse(
        success=True,
        message="Expenses retrieved successfully",
        data=[ExpenseResponse.model_validate(e) for e in expenses],
    )

