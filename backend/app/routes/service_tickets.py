import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin, require_technician_or_admin
from app.models.user import User, UserRole
from app.models.service_ticket import TicketStatus
from app.schemas.common import APIResponse
from app.schemas.service_ticket import (
    TicketCreate, TicketAssign, ServiceActionCreate,
    TicketResolveRequest, TicketConfirmRequest,
    ServiceTicketResponse, ServiceActionResponse
)
from app.services.service_ticket_service import ServiceTicketService

router = APIRouter(prefix="/service-tickets", tags=["Service Ticket Management"])


@router.post(
    "",
    response_model=APIResponse[ServiceTicketResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create Customer Service Ticket",
    description="Registers customer defect/complaint and automatically evaluates warranty coverage.",
)
async def create_ticket(
    ticket_in: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticket = await ServiceTicketService.create_ticket(db, ticket_in)
    return APIResponse(
        success=True,
        message="Service ticket registered successfully",
        data=ServiceTicketResponse.model_validate(ticket),
    )


@router.get(
    "",
    response_model=APIResponse[List[ServiceTicketResponse]],
    summary="List Service Tickets",
)
async def list_tickets(
    status: Optional[TicketStatus] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    effective_tech_id = current_user.id if current_user.role == UserRole.TECHNICIAN else None
    tickets = await ServiceTicketService.list_tickets(db, technician_id=effective_tech_id, status=status)
    return APIResponse(
        success=True,
        message="Service tickets retrieved successfully",
        data=[ServiceTicketResponse.model_validate(t) for t in tickets],
    )


@router.get(
    "/{ticket_id}",
    response_model=APIResponse[ServiceTicketResponse],
    summary="Get Ticket Details",
)
async def get_ticket(
    ticket_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticket = await ServiceTicketService.get_ticket_by_id(db, ticket_id)
    return APIResponse(
        success=True,
        message="Ticket retrieved successfully",
        data=ServiceTicketResponse.model_validate(ticket),
    )


@router.patch(
    "/{ticket_id}/assign",
    response_model=APIResponse[ServiceTicketResponse],
    summary="Assign Service Technician (Admin Only)",
)
async def assign_technician(
    ticket_id: uuid.UUID,
    assign_in: TicketAssign,
    current_admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    ticket = await ServiceTicketService.assign_technician(db, ticket_id, assign_in.technician_id)
    return APIResponse(
        success=True,
        message="Technician assigned successfully",
        data=ServiceTicketResponse.model_validate(ticket),
    )


@router.post(
    "/{ticket_id}/actions",
    response_model=APIResponse[ServiceActionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Record Service Action / Repair",
    description="Logs technician diagnostic or replacement action. If covered under warranty, customer charge is automatically ₹0.00.",
)
async def record_action(
    ticket_id: uuid.UUID,
    action_in: ServiceActionCreate,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    action = await ServiceTicketService.record_action(db, ticket_id, action_in, current_user)
    return APIResponse(
        success=True,
        message="Service action recorded successfully",
        data=ServiceActionResponse.model_validate(action),
    )


@router.post(
    "/{ticket_id}/resolve",
    response_model=APIResponse[ServiceTicketResponse],
    summary="Mark Ticket as Resolved",
)
async def resolve_ticket(
    ticket_id: uuid.UUID,
    resolve_in: TicketResolveRequest,
    current_user: User = Depends(require_technician_or_admin),
    db: AsyncSession = Depends(get_db),
):
    ticket = await ServiceTicketService.resolve_ticket(db, ticket_id, resolve_in)
    return APIResponse(
        success=True,
        message="Ticket marked as resolved, awaiting customer confirmation",
        data=ServiceTicketResponse.model_validate(ticket),
    )


@router.post(
    "/{ticket_id}/confirm-and-close",
    response_model=APIResponse[ServiceTicketResponse],
    summary="Confirm Working System and Close Ticket",
    description="Customer confirms system restoration, officially closing the service ticket.",
)
async def confirm_and_close(
    ticket_id: uuid.UUID,
    confirm_in: TicketConfirmRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ticket = await ServiceTicketService.confirm_and_close(db, ticket_id, confirm_in)
    return APIResponse(
        success=True,
        message="Customer confirmation verified. Service ticket closed successfully.",
        data=ServiceTicketResponse.model_validate(ticket),
    )

