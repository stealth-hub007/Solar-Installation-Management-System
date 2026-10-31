import math
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.service_ticket import ServiceTicket, ServiceAction, TicketStatus, ActionType
from app.models.customer import Customer
from app.models.warranty import Warranty, WarrantyStatus
from app.models.user import User, UserRole
from app.schemas.service_ticket import (
    TicketCreate, ServiceActionCreate, TicketResolveRequest, TicketConfirmRequest, ServiceTicketResponse
)
from app.core.exceptions import NotFoundException, BadRequestException


class ServiceTicketService:
    @staticmethod
    async def create_ticket(db: AsyncSession, ticket_in: TicketCreate) -> ServiceTicket:
        customer = await db.get(Customer, ticket_in.customer_id)
        if not customer:
            raise NotFoundException(message="Customer not found", error_code="CUSTOMER_NOT_FOUND")

        # Check warranty coverage
        is_under_warranty = False
        if ticket_in.serial_id:
            w_res = await db.execute(
                select(Warranty).where(
                    Warranty.serial_id == ticket_in.serial_id,
                    Warranty.warranty_status == WarrantyStatus.ACTIVE,
                    Warranty.warranty_expiry_date >= datetime.now(timezone.utc),
                )
            )
            if w_res.scalar_one_or_none():
                is_under_warranty = True
        elif ticket_in.product_id:
            w_res = await db.execute(
                select(Warranty).where(
                    Warranty.customer_id == ticket_in.customer_id,
                    Warranty.product_id == ticket_in.product_id,
                    Warranty.warranty_status == WarrantyStatus.ACTIVE,
                    Warranty.warranty_expiry_date >= datetime.now(timezone.utc),
                )
            )
            if w_res.scalar_one_or_none():
                is_under_warranty = True

        today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        total_tickets = (await db.execute(select(func.count(ServiceTicket.id)))).scalar_one()
        ticket_number = f"SRV-{today_str}-{total_tickets + 1:04d}"

        ticket = ServiceTicket(
            ticket_number=ticket_number,
            customer_id=customer.id,
            order_id=ticket_in.order_id,
            product_id=ticket_in.product_id,
            serial_id=ticket_in.serial_id,
            complaint_description=ticket_in.complaint_description,
            is_under_warranty=is_under_warranty,
            ticket_status=TicketStatus.OPEN,
        )
        db.add(ticket)
        await db.commit()
        return await ServiceTicketService.get_ticket_by_id(db, ticket.id)

    @staticmethod
    async def get_ticket_by_id(db: AsyncSession, ticket_id: uuid.UUID) -> ServiceTicket:
        stmt = (
            select(ServiceTicket)
            .options(selectinload(ServiceTicket.actions))
            .where(ServiceTicket.id == ticket_id)
        )
        res = await db.execute(stmt)
        ticket = res.scalar_one_or_none()
        if not ticket:
            raise NotFoundException(message="Service ticket not found", error_code="TICKET_NOT_FOUND")
        return ticket

    @staticmethod
    async def assign_technician(db: AsyncSession, ticket_id: uuid.UUID, technician_id: uuid.UUID) -> ServiceTicket:
        ticket = await ServiceTicketService.get_ticket_by_id(db, ticket_id)
        tech = await db.get(User, technician_id)
        if not tech or tech.role != UserRole.TECHNICIAN:
            raise BadRequestException(message="User must be an active Field Technician")

        ticket.assigned_technician_id = technician_id
        ticket.ticket_status = TicketStatus.ASSIGNED
        await db.commit()
        await db.refresh(ticket)
        return ticket

    @staticmethod
    async def record_action(
        db: AsyncSession,
        ticket_id: uuid.UUID,
        action_in: ServiceActionCreate,
        technician: User,
    ) -> ServiceAction:
        ticket = await ServiceTicketService.get_ticket_by_id(db, ticket_id)

        # STRICT WARRANTY RULE: Covered repair charge is ZERO
        if ticket.is_under_warranty:
            customer_charge = Decimal("0.00")
        else:
            customer_charge = action_in.parts_cost + action_in.labour_cost

        action = ServiceAction(
            ticket_id=ticket.id,
            technician_id=technician.id,
            action_type=action_in.action_type,
            description=action_in.description,
            parts_cost=action_in.parts_cost,
            labour_cost=action_in.labour_cost,
            customer_charge=customer_charge,
            action_date=datetime.now(timezone.utc),
        )
        db.add(action)

        if ticket.ticket_status in [TicketStatus.OPEN, TicketStatus.ASSIGNED]:
            ticket.ticket_status = TicketStatus.IN_PROGRESS

        await db.commit()
        await db.refresh(action)
        return action

    @staticmethod
    async def resolve_ticket(
        db: AsyncSession,
        ticket_id: uuid.UUID,
        resolve_in: TicketResolveRequest,
    ) -> ServiceTicket:
        ticket = await ServiceTicketService.get_ticket_by_id(db, ticket_id)
        ticket.resolution_details = resolve_in.resolution_details
        ticket.ticket_status = TicketStatus.CUSTOMER_CONFIRMATION_PENDING
        await db.commit()
        await db.refresh(ticket)
        return ticket

    @staticmethod
    async def confirm_and_close(
        db: AsyncSession,
        ticket_id: uuid.UUID,
        confirm_in: TicketConfirmRequest,
    ) -> ServiceTicket:
        ticket = await ServiceTicketService.get_ticket_by_id(db, ticket_id)

        if not confirm_in.confirmed:
            raise BadRequestException(message="Customer confirmation must be affirmative to close the service ticket")

        ticket.customer_confirmed = True
        ticket.customer_confirmation_date = datetime.now(timezone.utc)
        ticket.ticket_status = TicketStatus.CLOSED
        await db.commit()
        await db.refresh(ticket)
        return ticket

    @staticmethod
    async def list_tickets(
        db: AsyncSession,
        technician_id: Optional[uuid.UUID] = None,
        status: Optional[TicketStatus] = None,
    ) -> List[ServiceTicket]:
        stmt = (
            select(ServiceTicket)
            .options(selectinload(ServiceTicket.actions))
            .order_by(ServiceTicket.ticket_creation_date.desc())
        )
        if technician_id:
            stmt = stmt.where(ServiceTicket.assigned_technician_id == technician_id)
        if status:
            stmt = stmt.where(ServiceTicket.ticket_status == status)

        res = await db.execute(stmt)
        return list(res.scalars().all())

