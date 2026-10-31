import math
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.dispatch import Dispatch, DispatchItem, DeliveryConfirmation, DispatchStatus
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.inventory import (
    Inventory, StockMovement, ProductSerial, MovementType, SerialStatus
)
from app.models.warranty import Warranty, WarrantyStatus
from app.models.user import User
from app.schemas.dispatch import DispatchCreate, DeliveryConfirmRequest, DispatchResponse
from app.services.inventory_service import InventoryService
from app.services.warranty_service import WarrantyService
from app.core.exceptions import NotFoundException, BadRequestException, ConflictException


class DispatchService:
    @staticmethod
    async def create_dispatch(
        db: AsyncSession,
        dispatch_in: DispatchCreate,
        warehouse_user: User,
    ) -> Dispatch:
        order = await db.get(Order, dispatch_in.order_id)
        if not order:
            raise NotFoundException(message="Order not found", error_code="ORDER_NOT_FOUND")

        # 1. Generate unique dispatch number
        today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        total_dispatches = (await db.execute(select(func.count(Dispatch.id)))).scalar_one()
        dispatch_number = f"DSP-{today_str}-{total_dispatches + 1:04d}"

        dispatch = Dispatch(
            dispatch_number=dispatch_number,
            order_id=order.id,
            warehouse_user_id=warehouse_user.id,
            dispatch_status=DispatchStatus.DISPATCHED,
            remarks=dispatch_in.remarks,
        )
        db.add(dispatch)
        await db.flush()

        # 2. Process dispatch items and deduct stock
        for itm in dispatch_in.items:
            product = await db.get(Product, itm.product_id)
            if not product:
                raise NotFoundException(message=f"Product {itm.product_id} not found")

            # Validate serial if required
            serial_record = None
            if product.is_serial_tracked:
                if not itm.serial_id:
                    raise BadRequestException(
                        message=f"Serial tracking is required for product '{product.name}'. Serial ID must be provided.",
                        error_code="SERIAL_NUMBER_REQUIRED",
                    )
                serial_record = await db.get(ProductSerial, itm.serial_id)
                if not serial_record or serial_record.status not in [SerialStatus.IN_STOCK, SerialStatus.RESERVED]:
                    raise BadRequestException(
                        message=f"Serial number for '{product.name}' is invalid or already dispatched",
                        error_code="SERIAL_UNAVAILABLE",
                    )
                serial_record.status = SerialStatus.DISPATCHED
                serial_record.order_id = order.id
                serial_record.customer_id = order.customer_id
                serial_record.dispatch_id = dispatch.id

            dispatch_item = DispatchItem(
                dispatch_id=dispatch.id,
                product_id=itm.product_id,
                quantity=itm.quantity,
                serial_id=itm.serial_id,
            )
            db.add(dispatch_item)

            # Deduct stock exactly once from physical & reserved inventory
            inv = await InventoryService.get_or_create_inventory(db, itm.product_id)
            inv.total_quantity = max(Decimal("0.00"), inv.total_quantity - itm.quantity)
            inv.reserved_quantity = max(Decimal("0.00"), inv.reserved_quantity - itm.quantity)

            # Record dispatch movement
            movement = StockMovement(
                inventory_id=inv.id,
                product_id=itm.product_id,
                movement_type=MovementType.STOCK_DISPATCH,
                quantity=itm.quantity,
                reference_id=dispatch.id,
                performed_by_id=warehouse_user.id,
                remarks=f"Dispatched in {dispatch_number}",
            )
            db.add(movement)

        # Update order status
        order.order_status = OrderStatus.DISPATCHED

        await db.commit()
        return await DispatchService.get_dispatch_by_id(db, dispatch.id)

    @staticmethod
    async def get_dispatch_by_id(db: AsyncSession, dispatch_id: uuid.UUID) -> Dispatch:
        stmt = (
            select(Dispatch)
            .options(
                selectinload(Dispatch.items),
                selectinload(Dispatch.delivery_confirmation),
            )
            .where(Dispatch.id == dispatch_id)
        )
        res = await db.execute(stmt)
        dispatch = res.scalar_one_or_none()
        if not dispatch:
            raise NotFoundException(message="Dispatch not found", error_code="DISPATCH_NOT_FOUND")
        return dispatch

    @staticmethod
    async def confirm_delivery(
        db: AsyncSession,
        dispatch_id: uuid.UUID,
        confirm_in: DeliveryConfirmRequest,
        current_user: User,
    ) -> DeliveryConfirmation:
        dispatch = await DispatchService.get_dispatch_by_id(db, dispatch_id)

        # Prevent duplicate delivery confirmation
        if dispatch.delivery_confirmation:
            raise ConflictException(
                message="Delivery has already been confirmed for this dispatch",
                error_code="DELIVERY_ALREADY_CONFIRMED",
            )

        delivery_date = confirm_in.delivery_date or datetime.now(timezone.utc)

        confirmation = DeliveryConfirmation(
            dispatch_id=dispatch.id,
            order_id=dispatch.order_id,
            delivery_date=delivery_date,
            received_by_name=confirm_in.received_by_name.strip(),
            confirmed_by_user_id=current_user.id,
        )
        db.add(confirmation)

        dispatch.dispatch_status = DispatchStatus.DELIVERED
        order = await db.get(Order, dispatch.order_id)

        # ----------------------------------------------------------------------
        # AUTOMATIC WARRANTY REGISTRATION
        # "Warranty starts on confirmed delivery date, not dispatch date"
        # ----------------------------------------------------------------------
        total_warranties = (await db.execute(select(func.count(Warranty.id)))).scalar_one()

        for idx, itm in enumerate(dispatch.items, start=1):
            product = await db.get(Product, itm.product_id)
            if not product:
                continue

            # Update serial status if serialized
            if itm.serial_id:
                serial_record = await db.get(ProductSerial, itm.serial_id)
                if serial_record:
                    serial_record.status = SerialStatus.DELIVERED
                    serial_record.delivery_date = delivery_date

            # Calculate warranty expiration
            expiry_date = WarrantyService.calculate_expiry_date(
                start_date=delivery_date,
                duration=product.warranty_duration,
                unit=product.warranty_unit,
            )

            # Generate unique certificate number
            cert_no = f"WAR-{delivery_date.strftime('%Y%m')}-{total_warranties + idx:04d}-{uuid.uuid4().hex[:4].upper()}"

            warranty = Warranty(
                warranty_certificate_number=cert_no,
                product_id=product.id,
                serial_id=itm.serial_id,
                customer_id=order.customer_id,
                order_id=order.id,
                warranty_start_date=delivery_date,
                warranty_expiry_date=expiry_date,
                warranty_duration_snapshot=product.warranty_duration,
                warranty_unit_snapshot=product.warranty_unit,
                warranty_status=WarrantyStatus.ACTIVE,
            )
            db.add(warranty)

        await db.commit()
        await db.refresh(confirmation)
        return confirmation

    @staticmethod
    async def list_dispatches(db: AsyncSession) -> List[Dispatch]:
        stmt = (
            select(Dispatch)
            .options(selectinload(Dispatch.items), selectinload(Dispatch.delivery_confirmation))
            .order_by(Dispatch.created_at.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())
