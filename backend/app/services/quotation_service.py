import math
import uuid
import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.quotation import Quotation, QuotationItem, QuotationRevision, QuotationStatus
from app.models.survey import SiteSurvey, SurveyApprovalStatus
from app.models.customer import Customer, Enquiry
from app.models.product import Package, PackageItem, Product
from app.models.user import User
from app.schemas.quotation import QuotationCreate, QuotationUpdate, QuotationResponse
from app.schemas.common import PaginatedData
from app.services.product_service import ProductService
from app.utils.pdf_generator import PDFGenerator
from app.core.exceptions import NotFoundException, BadRequestException, ConflictException
from app.core.config import settings


class QuotationService:
    @staticmethod
    async def create_quotation(
        db: AsyncSession,
        quote_in: QuotationCreate,
        current_user: User,
    ) -> Quotation:
        # 1. Fetch survey
        survey = await db.get(SiteSurvey, quote_in.survey_id)
        if not survey:
            raise NotFoundException(message="Site survey not found", error_code="SURVEY_NOT_FOUND")

        # STRICT BUSINESS RULE: Survey MUST be approved
        if survey.approval_status != SurveyApprovalStatus.APPROVED:
            raise BadRequestException(
                message="Quotation creation is blocked. Associated site survey has not been approved.",
                error_code="SURVEY_NOT_APPROVED",
            )

        customer = await db.get(Customer, survey.customer_id)
        if not customer:
            raise NotFoundException(message="Customer not found")

        # 2. Select package
        package_id = quote_in.package_id
        if not package_id:
            enquiry = await db.get(Enquiry, survey.enquiry_id)
            if not enquiry:
                raise NotFoundException(message="Survey enquiry not found")
            matched_pkg = await ProductService.get_matching_package(db, enquiry.system_capacity, enquiry.system_type)
            package_id = matched_pkg.id

        package = await ProductService.get_package_by_id(db, package_id)

        # 3. Calculate component prices & subtotal
        items_to_create = []
        subtotal = package.installation_charge  # Base installation charge
        pdf_item_list = []

        if package.installation_charge > 0:
            pdf_item_list.append({
                "name": "Standard Installation & Commissioning Service",
                "quantity": Decimal("1.00"),
                "unit_price": package.installation_charge,
                "total_price": package.installation_charge,
            })

        for pkg_item in package.items:
            product = pkg_item.product
            item_total = pkg_item.quantity * product.selling_price
            subtotal += item_total

            items_to_create.append({
                "product_id": product.id,
                "product_name_snapshot": product.name,
                "quantity": pkg_item.quantity,
                "unit_price_snapshot": product.selling_price,
                "total_price": item_total,
            })
            pdf_item_list.append({
                "name": f"{product.name} ({product.sku})",
                "quantity": pkg_item.quantity,
                "unit_price": product.selling_price,
                "total_price": item_total,
            })

        discount = quote_in.discount
        taxable_amount = max(Decimal("0.00"), subtotal - discount)
        tax_percentage = Decimal("18.00")
        tax_amount = (taxable_amount * tax_percentage / Decimal("100.00")).quantize(Decimal("0.01"))
        final_amount = taxable_amount + tax_amount

        # 4. Generate unique quotation number
        today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        count_stmt = select(func.count(Quotation.id))
        total_quotes = (await db.execute(count_stmt)).scalar_one()
        quote_number = f"QT-{today_str}-{total_quotes + 1:04d}"

        valid_until = datetime.now(timezone.utc) + timedelta(days=quote_in.valid_days)

        quotation = Quotation(
            quotation_number=quote_number,
            customer_id=customer.id,
            survey_id=survey.id,
            package_id=package.id,
            created_by_id=current_user.id,
            valid_until=valid_until,
            subtotal=subtotal,
            discount=discount,
            tax_percentage=tax_percentage,
            tax_amount=tax_amount,
            final_amount=final_amount,
            status=QuotationStatus.DRAFT,
            revision_number=1,
            terms_conditions=quote_in.terms_conditions,
        )
        db.add(quotation)
        await db.flush()

        for itm in items_to_create:
            q_item = QuotationItem(
                quotation_id=quotation.id,
                product_id=itm["product_id"],
                product_name_snapshot=itm["product_name_snapshot"],
                quantity=itm["quantity"],
                unit_price_snapshot=itm["unit_price_snapshot"],
                total_price=itm["total_price"],
            )
            db.add(q_item)

        # 5. Generate Quotation PDF
        pdf_dir = os.path.join(settings.UPLOAD_DIR, "documents")
        os.makedirs(pdf_dir, exist_ok=True)
        pdf_filename = f"{quote_number}.pdf"
        pdf_full_path = os.path.join(pdf_dir, pdf_filename)

        PDFGenerator.generate_quotation_pdf(
            output_path=pdf_full_path,
            quotation_number=quote_number,
            customer_name=customer.name,
            customer_phone=customer.phone,
            date_str=datetime.now(timezone.utc).strftime("%d-%b-%Y"),
            valid_until_str=valid_until.strftime("%d-%b-%Y"),
            items=pdf_item_list,
            subtotal=subtotal,
            discount=discount,
            tax_amount=tax_amount,
            final_amount=final_amount,
        )
        quotation.pdf_path = pdf_full_path

        await db.commit()
        return await QuotationService.get_quotation_by_id(db, quotation.id)

    @staticmethod
    async def get_quotation_by_id(db: AsyncSession, quotation_id: uuid.UUID) -> Quotation:
        stmt = (
            select(Quotation)
            .options(selectinload(Quotation.items), selectinload(Quotation.revisions))
            .where(Quotation.id == quotation_id)
        )
        res = await db.execute(stmt)
        quotation = res.scalar_one_or_none()
        if not quotation:
            raise NotFoundException(message="Quotation not found", error_code="QUOTATION_NOT_FOUND")
        return quotation

    @staticmethod
    async def get_quotation_response(db: AsyncSession, quotation_id: uuid.UUID) -> QuotationResponse:
        quotation = await QuotationService.get_quotation_by_id(db, quotation_id)
        response = QuotationResponse.model_validate(quotation)

        customer = await db.get(Customer, quotation.customer_id)
        if customer:
            response.customer_name = customer.name

        package = await db.get(Package, quotation.package_id)
        if package:
            response.system_capacity = package.capacity.value

        return response

    @staticmethod
    async def accept_quotation(db: AsyncSession, quotation_id: uuid.UUID) -> Quotation:
        quotation = await QuotationService.get_quotation_by_id(db, quotation_id)
        if quotation.status == QuotationStatus.ACCEPTED:
            return quotation
        if quotation.status in [QuotationStatus.REJECTED, QuotationStatus.EXPIRED, QuotationStatus.CONVERTED_TO_ORDER]:
            raise BadRequestException(
                message=f"Cannot accept quotation with status '{quotation.status.value}'",
                error_code="INVALID_QUOTATION_STATUS",
            )
        quotation.status = QuotationStatus.ACCEPTED
        await db.commit()
        await db.refresh(quotation)
        return quotation

    @staticmethod
    async def reject_quotation(db: AsyncSession, quotation_id: uuid.UUID) -> Quotation:
        quotation = await QuotationService.get_quotation_by_id(db, quotation_id)
        quotation.status = QuotationStatus.REJECTED
        await db.commit()
        await db.refresh(quotation)
        return quotation

    @staticmethod
    async def list_quotations(
        db: AsyncSession,
        page: int = 1,
        size: int = 20,
        customer_id: Optional[uuid.UUID] = None,
        status: Optional[QuotationStatus] = None,
    ) -> PaginatedData[QuotationResponse]:
        skip = (page - 1) * size
        stmt = (
            select(Quotation, Customer.name, Package.capacity)
            .join(Customer, Customer.id == Quotation.customer_id)
            .join(Package, Package.id == Quotation.package_id)
            .options(selectinload(Quotation.items))
        )
        count_stmt = select(func.count(Quotation.id))

        if customer_id:
            stmt = stmt.where(Quotation.customer_id == customer_id)
            count_stmt = count_stmt.where(Quotation.customer_id == customer_id)
        if status:
            stmt = stmt.where(Quotation.status == status)
            count_stmt = count_stmt.where(Quotation.status == status)

        total_res = await db.execute(count_stmt)
        total = total_res.scalar_one()

        stmt = stmt.order_by(Quotation.created_at.desc()).offset(skip).limit(size)
        res = await db.execute(stmt)
        quotations = res.all()

        total_pages = math.ceil(total / size) if total > 0 else 0
        items = []
        for quotation, customer_name, capacity in quotations:
            response = QuotationResponse.model_validate(quotation)
            response.customer_name = customer_name
            response.system_capacity = capacity.value
            items.append(response)
        return PaginatedData(items=items, total=total, page=page, size=size, total_pages=total_pages)
