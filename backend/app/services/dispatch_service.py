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
    Inventory, StockMovement, ProductSerial, StockReservation, MovementType,
    ReservationStatus, SerialStatus
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
        if order.order_status != OrderStatus.CONFIRMED:
            raise BadRequestException(
                message=f"Only confirmed orders can be dispatched (current status: {order.order_status.value})",
                error_code="ORDER_NOT_DISPATCHABLE",
            )

        order_items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        order_items = list(order_items_result.scalars().all())
        expected_quantities = {}
        for item in order_items:
            expected_quantities[item.product_id] = (
                expected_quantities.get(item.product_id, Decimal("0.00")) + item.quantity
            )

        dispatch_quantities = {}
        for item in dispatch_in.items:
            dispatch_quantities[item.product_id] = (
                dispatch_quantities.get(item.product_id, Decimal("0.00")) + item.quantity
            )
        if dispatch_quantities != expected_quantities:
            raise BadRequestException(
                message="Dispatch items and quantities must exactly match the confirmed order",
                error_code="DISPATCH_ITEMS_MISMATCH",
            )

        reservations_result = await db.execute(
            select(StockReservation).where(
                StockReservation.order_id == order.id,
                StockReservation.status == ReservationStatus.ACTIVE,
            )
        )
        active_reservations = list(reservations_result.scalars().all())
        reserved_quantities = {}
        for reservation in active_reservations:
            reserved_quantities[reservation.product_id] = (
                reserved_quantities.get(reservation.product_id, Decimal("0.00"))
                + reservation.reserved_quantity
            )
        if reserved_quantities != expected_quantities:
            raise BadRequestException(
                message="Reserve the complete order inventory before dispatch",
                error_code="ORDER_STOCK_NOT_RESERVED",
            )

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
                if itm.quantity != Decimal("1.00"):
                    raise BadRequestException(
                        message=f"Dispatch one serial-tracked '{product.name}' per line item",
                        error_code="SERIAL_QUANTITY_UNSUPPORTED",
                    )
                if itm.serial_id:
                    serial_record = await db.get(ProductSerial, itm.serial_id)
                    if (
                        not serial_record
                        or serial_record.product_id != product.id
                        or serial_record.status not in [SerialStatus.IN_STOCK, SerialStatus.RESERVED]
                    ):
                        raise BadRequestException(
                            message=f"Serial number for '{product.name}' is invalid or already dispatched",
                            error_code="SERIAL_UNAVAILABLE",
                        )
                    serial_record.status = SerialStatus.DISPATCHED
                    serial_record.order_id = order.id
                    serial_record.customer_id = order.customer_id
                    serial_record.dispatch_id = dispatch.id
                else:
                    # Auto-find an available serial for this product
                    from sqlalchemy import select as sa_select
                    avail_serial_stmt = sa_select(ProductSerial).where(
                        ProductSerial.product_id == itm.product_id,
                        ProductSerial.status.in_([SerialStatus.IN_STOCK, SerialStatus.RESERVED]),
                    ).limit(1)
                    avail_serial = (await db.execute(avail_serial_stmt)).scalars().first()
                    if not avail_serial:
                        raise BadRequestException(
                            message=f"No available serial number for '{product.name}'",
                            error_code="SERIAL_UNAVAILABLE",
                        )
                    avail_serial.status = SerialStatus.DISPATCHED
                    avail_serial.order_id = order.id
                    avail_serial.customer_id = order.customer_id
                    avail_serial.dispatch_id = dispatch.id
                    serial_record = avail_serial
            elif itm.serial_id:
                raise BadRequestException(
                    message=f"Product '{product.name}' is not serial-tracked",
                    error_code="UNEXPECTED_SERIAL",
                )

            dispatch_item = DispatchItem(
                dispatch_id=dispatch.id,
                product_id=itm.product_id,
                quantity=itm.quantity,
                serial_id=serial_record.id if serial_record else itm.serial_id,
            )
            db.add(dispatch_item)

            # Deduct stock exactly once from physical & reserved inventory
            inv = await InventoryService.get_or_create_inventory(db, itm.product_id)
            if inv.total_quantity < itm.quantity or inv.reserved_quantity < itm.quantity:
                raise BadRequestException(
                    message=f"Insufficient reserved inventory for '{product.name}'",
                    error_code="INSUFFICIENT_RESERVED_STOCK",
                )
            inv.total_quantity -= itm.quantity
            inv.reserved_quantity -= itm.quantity

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

        for reservation in active_reservations:
            reservation.status = ReservationStatus.DISPATCHED

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

        if dispatch.dispatch_status != DispatchStatus.DISPATCHED:
            raise BadRequestException(
                message="Delivery can only be confirmed for a dispatched shipment",
                error_code="DISPATCH_NOT_SHIPPED",
            )

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
