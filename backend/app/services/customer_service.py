import math
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import selectinload

from app.models.customer import Customer, CustomerAddress, Enquiry, EnquiryFollowup, LeadStatus, EnquirySource
from app.models.user import User, UserRole
from app.schemas.customer import (
    CustomerCreate, CustomerUpdate, AddressCreate,
    EnquiryCreate, EnquiryUpdate, FollowupCreate, CustomerResponse, EnquiryResponse
)
from app.schemas.common import PaginatedData
from app.core.exceptions import NotFoundException, ConflictException, BadRequestException


class CustomerService:
    @staticmethod
    async def create_customer(db: AsyncSession, customer_in: CustomerCreate) -> Customer:
        # Check phone duplicate
        stmt = select(Customer).where(Customer.phone == customer_in.phone.strip())
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise ConflictException(
                message=f"Customer with phone number '{customer_in.phone}' already exists",
                error_code="CUSTOMER_PHONE_EXISTS",
            )

        customer = Customer(
            name=customer_in.name.strip(),
            phone=customer_in.phone.strip(),
            email=customer_in.email.strip().lower() if customer_in.email else None,
            is_active=True,
        )
        db.add(customer)
        await db.flush()

        if customer_in.address:
            address = CustomerAddress(
                customer_id=customer.id,
                address_line=customer_in.address.address_line.strip(),
                city=customer_in.address.city.strip(),
                state=customer_in.address.state.strip(),
                postal_code=customer_in.address.postal_code.strip(),
                is_primary=True,
            )
            db.add(address)

        await db.commit()
        return await CustomerService.get_customer_by_id(db, customer.id)

    @staticmethod
    async def get_customer_by_id(db: AsyncSession, customer_id: uuid.UUID) -> Customer:
        stmt = (
            select(Customer)
            .options(selectinload(Customer.addresses), selectinload(Customer.enquiries))
            .where(Customer.id == customer_id)
        )
        res = await db.execute(stmt)
        customer = res.scalar_one_or_none()
        if not customer:
            raise NotFoundException(message="Customer not found", error_code="CUSTOMER_NOT_FOUND")
        return customer

    @staticmethod
    async def update_customer(db: AsyncSession, customer_id: uuid.UUID, update_in: CustomerUpdate) -> Customer:
        customer = await CustomerService.get_customer_by_id(db, customer_id)

        if update_in.phone and update_in.phone.strip() != customer.phone:
            stmt = select(Customer).where(Customer.phone == update_in.phone.strip())
            res = await db.execute(stmt)
            if res.scalar_one_or_none():
                raise ConflictException(
                    message=f"Customer with phone number '{update_in.phone}' already exists",
                    error_code="CUSTOMER_PHONE_EXISTS",
                )
            customer.phone = update_in.phone.strip()

        if update_in.name is not None:
            customer.name = update_in.name.strip()
        if update_in.email is not None:
            customer.email = update_in.email.strip().lower() if update_in.email else None
        if update_in.is_active is not None:
            customer.is_active = update_in.is_active

        await db.commit()
        await db.refresh(customer)
        return customer

    @staticmethod
    async def add_address(db: AsyncSession, customer_id: uuid.UUID, address_in: AddressCreate) -> CustomerAddress:
        customer = await CustomerService.get_customer_by_id(db, customer_id)

        if address_in.is_primary:
            # Set other addresses to not primary
            for addr in customer.addresses:
                addr.is_primary = False

        address = CustomerAddress(
            customer_id=customer.id,
            address_line=address_in.address_line.strip(),
            city=address_in.city.strip(),
            state=address_in.state.strip(),
            postal_code=address_in.postal_code.strip(),
            is_primary=address_in.is_primary,
        )
        db.add(address)
        await db.commit()
        await db.refresh(address)
        return address

    @staticmethod
    async def list_customers(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> PaginatedData[CustomerResponse]:
        skip = (page - 1) * size
        stmt = select(Customer).options(selectinload(Customer.addresses))
        count_stmt = select(func.count(Customer.id))

        if is_active is not None:
            stmt = stmt.where(Customer.is_active == is_active)
            count_stmt = count_stmt.where(Customer.is_active == is_active)

        if search:
            pat = f"%{search.strip().lower()}%"
            cond = or_(
                func.lower(Customer.name).like(pat),
                Customer.phone.like(pat),
                func.lower(Customer.email).like(pat),
            )
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(Customer.created_at.desc()).offset(skip).limit(size)
        res = await db.execute(stmt)
        customers = list(res.scalars().all())

        total_pages = math.ceil(total / size) if total > 0 else 0
        items = [CustomerResponse.model_validate(c) for c in customers]
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)

    # --------------------------------------------------------------------------
    # Enquiry Services
    # --------------------------------------------------------------------------
    @staticmethod
    async def create_enquiry(db: AsyncSession, enquiry_in: EnquiryCreate) -> Enquiry:
        customer_id = enquiry_in.customer_id
        address_id = None

        if not customer_id:
            if not enquiry_in.customer_phone or not enquiry_in.customer_name:
                raise BadRequestException(
                    message="Either customer_id or customer_name and customer_phone must be provided",
                    error_code="CUSTOMER_DETAILS_REQUIRED",
                )
            # Find or create customer
            stmt = select(Customer).where(Customer.phone == enquiry_in.customer_phone.strip())
            res = await db.execute(stmt)
            existing_cust = res.scalar_one_or_none()

            if existing_cust:
                customer_id = existing_cust.id
            else:
                new_cust = Customer(
                    name=enquiry_in.customer_name.strip(),
                    phone=enquiry_in.customer_phone.strip(),
                    email=enquiry_in.customer_email.strip().lower() if enquiry_in.customer_email else None,
                    is_active=True,
                )
                db.add(new_cust)
                await db.flush()
                customer_id = new_cust.id

                if enquiry_in.address_line and enquiry_in.city:
                    new_addr = CustomerAddress(
                        customer_id=new_cust.id,
                        address_line=enquiry_in.address_line.strip(),
                        city=enquiry_in.city.strip(),
                        state=enquiry_in.state.strip() if enquiry_in.state else "N/A",
                        postal_code=enquiry_in.postal_code.strip() if enquiry_in.postal_code else "000000",
                        is_primary=True,
                    )
                    db.add(new_addr)
                    await db.flush()
                    address_id = new_addr.id

        # Verify sales rep if provided
        if enquiry_in.assigned_sales_id:
            sales_user = await db.get(User, enquiry_in.assigned_sales_id)
            if not sales_user or sales_user.role not in [UserRole.SALES, UserRole.ADMIN]:
                raise BadRequestException(
                    message="Assigned user must be an active Sales Executive or Admin",
                    error_code="INVALID_SALES_REPRESENTATIVE",
                )

        enquiry = Enquiry(
            customer_id=customer_id,
            address_id=address_id,
            assigned_sales_id=enquiry_in.assigned_sales_id,
            source=enquiry_in.source,
            system_capacity=enquiry_in.system_capacity,
            system_type=enquiry_in.system_type,
            monthly_electricity_bill=enquiry_in.monthly_electricity_bill,
            subsidy_required=enquiry_in.subsidy_required,
            customer_requirements=enquiry_in.customer_requirements,
            lead_status=LeadStatus.NEW,
            remarks=enquiry_in.remarks,
        )
        db.add(enquiry)
        await db.commit()
        return await CustomerService.get_enquiry_by_id(db, enquiry.id)

    @staticmethod
    async def get_enquiry_by_id(db: AsyncSession, enquiry_id: uuid.UUID) -> Enquiry:
        stmt = (
            select(Enquiry)
            .options(
                selectinload(Enquiry.customer).selectinload(Customer.addresses),
                selectinload(Enquiry.followups),
            )
            .where(Enquiry.id == enquiry_id)
        )
        res = await db.execute(stmt)
        enquiry = res.scalar_one_or_none()
        if not enquiry:
            raise NotFoundException(message="Enquiry not found", error_code="ENQUIRY_NOT_FOUND")
        return enquiry

    @staticmethod
    async def assign_sales(db: AsyncSession, enquiry_id: uuid.UUID, sales_id: uuid.UUID) -> Enquiry:
        enquiry = await CustomerService.get_enquiry_by_id(db, enquiry_id)
        sales_user = await db.get(User, sales_id)
        if not sales_user or sales_user.role not in [UserRole.SALES, UserRole.ADMIN]:
            raise BadRequestException(
                message="User must be an active Sales Executive or Admin",
                error_code="INVALID_SALES_REPRESENTATIVE",
            )
        enquiry.assigned_sales_id = sales_id
        await db.commit()
        await db.refresh(enquiry)
        return enquiry

    @staticmethod
    async def update_status(db: AsyncSession, enquiry_id: uuid.UUID, lead_status: LeadStatus, remarks: Optional[str] = None) -> Enquiry:
        enquiry = await CustomerService.get_enquiry_by_id(db, enquiry_id)
        enquiry.lead_status = lead_status
        if remarks:
            enquiry.remarks = remarks
        await db.commit()
        await db.refresh(enquiry)
        return enquiry

    @staticmethod
    async def add_followup(db: AsyncSession, enquiry_id: uuid.UUID, user_id: uuid.UUID, followup_in: FollowupCreate) -> EnquiryFollowup:
        enquiry = await CustomerService.get_enquiry_by_id(db, enquiry_id)

        followup = EnquiryFollowup(
            enquiry_id=enquiry.id,
            user_id=user_id,
            notes=followup_in.notes,
            lead_status_after=followup_in.lead_status_after,
            next_scheduled_date=followup_in.next_scheduled_date,
        )
        db.add(followup)

        # Automatically update enquiry status and next followup date
        enquiry.lead_status = followup_in.lead_status_after
        enquiry.next_followup_date = followup_in.next_scheduled_date
        await db.commit()
        await db.refresh(followup)
        return followup

    @staticmethod
    async def list_enquiries(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        status: Optional[LeadStatus] = None,
        source: Optional[EnquirySource] = None,
        assigned_sales_id: Optional[uuid.UUID] = None,
        customer_id: Optional[uuid.UUID] = None,
    ) -> PaginatedData[EnquiryResponse]:
        skip = (page - 1) * size
        stmt = select(Enquiry).options(
            selectinload(Enquiry.customer).selectinload(Customer.addresses),
            selectinload(Enquiry.followups),
        )
        count_stmt = select(func.count(Enquiry.id))

        if status:
            stmt = stmt.where(Enquiry.lead_status == status)
            count_stmt = count_stmt.where(Enquiry.lead_status == status)
        if source:
            stmt = stmt.where(Enquiry.source == source)
            count_stmt = count_stmt.where(Enquiry.source == source)
        if assigned_sales_id:
            stmt = stmt.where(Enquiry.assigned_sales_id == assigned_sales_id)
            count_stmt = count_stmt.where(Enquiry.assigned_sales_id == assigned_sales_id)
        if customer_id:
            stmt = stmt.where(Enquiry.customer_id == customer_id)
            count_stmt = count_stmt.where(Enquiry.customer_id == customer_id)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(Enquiry.created_at.desc()).offset(skip).limit(size)
        res = await db.execute(stmt)
        enquiries = list(res.scalars().all())

        total_pages = math.ceil(total / size) if total > 0 else 0
        items = [EnquiryResponse.model_validate(e) for e in enquiries]
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)

    @staticmethod
    async def get_pending_followups(db: AsyncSession, sales_id: Optional[uuid.UUID] = None) -> List[EnquiryResponse]:
        now = datetime.now(timezone.utc)
        stmt = (
            select(Enquiry)
            .options(
                selectinload(Enquiry.customer).selectinload(Customer.addresses),
                selectinload(Enquiry.followups),
            )
            .where(
                Enquiry.next_followup_date.is_not(None),
                Enquiry.lead_status.notin_([LeadStatus.CONVERTED, LeadStatus.REJECTED]),
            )
            .order_by(Enquiry.next_followup_date.asc())
        )
        if sales_id:
            stmt = stmt.where(Enquiry.assigned_sales_id == sales_id)

        res = await db.execute(stmt)
        enquiries = list(res.scalars().all())
        return [EnquiryResponse.model_validate(e) for e in enquiries]

