import pytest
import uuid
from decimal import Decimal
from httpx import AsyncClient
from app.core.init_db import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD
from tests.test_quotations_orders import create_approved_survey, get_admin_token


@pytest.mark.asyncio
async def test_inventory_dispatch_and_automatic_warranty(async_client: AsyncClient):
    """Test stock reservation, dispatch with serial number, delivery confirmation, and automatic warranty registration."""
    token = await get_admin_token(async_client)
    survey_id = await create_approved_survey(async_client, token)

    # 1. Create Quotation and convert to Order
    quote_resp = await async_client.post(
        "/api/v1/quotations",
        headers={"Authorization": f"Bearer {token}"},
        json={"survey_id": survey_id},
    )
    quotation_id = quote_resp.json()["data"]["id"]
    await async_client.post(f"/api/v1/quotations/{quotation_id}/accept", headers={"Authorization": f"Bearer {token}"})

    order_resp = await async_client.post(
        "/api/v1/orders/convert",
        headers={"Authorization": f"Bearer {token}"},
        json={"quotation_id": quotation_id},
    )
    order_data = order_resp.json()["data"]
    order_id = order_data["id"]
    order_items = order_data["items"]

    # 2. Reserve Stock for Order
    reserve_resp = await async_client.post(
        f"/api/v1/inventory/reserve/{order_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert reserve_resp.status_code == 200

    # 3. Find serialized inverter item in order
    inverter_item = None
    for item in order_items:
        prod_resp = await async_client.get(
            f"/api/v1/products/{item['product_id']}",
            headers={"Authorization": f"Bearer {token}"},
        )
        if prod_resp.json()["data"]["is_serial_tracked"]:
            inverter_item = item
            break
    assert inverter_item is not None

    # 4. Register serial number for the inverter
    serial_str = f"INV-{uuid.uuid4().hex[:10].upper()}"
    reg_serial = await async_client.post(
        "/api/v1/serials/register",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "product_id": inverter_item["product_id"],
            "serial_numbers": [serial_str],
        },
    )
    assert reg_serial.status_code == 201
    serial_id = reg_serial.json()["data"][0]["id"]

    # 5. Create Dispatch with scanned serial number
    dispatch_items = []
    for itm in order_items:
        s_id = serial_id if itm["product_id"] == inverter_item["product_id"] else None
        dispatch_items.append({
            "product_id": itm["product_id"],
            "quantity": itm["quantity"],
            "serial_id": s_id,
        })

    dispatch_resp = await async_client.post(
        "/api/v1/dispatches",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "order_id": order_id,
            "items": dispatch_items,
            "remarks": "Packed and dispatched via company logistics van",
        },
    )
    assert dispatch_resp.status_code == 201
    dispatch_data = dispatch_resp.json()["data"]
    dispatch_id = dispatch_data["id"]
    assert dispatch_data["dispatch_status"] == "DISPATCHED"

    # 6. Verify warranty does NOT exist yet (only activated on delivery confirmation)
    w_before = await async_client.get(
        f"/api/v1/warranties/serial/{serial_str}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert w_before.status_code == 404

    # 7. Confirm Delivery On-Site
    confirm_resp = await async_client.post(
        f"/api/v1/dispatches/{dispatch_id}/confirm-delivery",
        headers={"Authorization": f"Bearer {token}"},
        json={"received_by_name": "Ramesh Gupta (Customer)"},
    )
    assert confirm_resp.status_code == 200

    # 8. BUSINESS RULE TEST: Warranty is now automatically registered and ACTIVE!
    w_after = await async_client.get(
        f"/api/v1/warranties/serial/{serial_str}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert w_after.status_code == 200
    warranty_data = w_after.json()["data"]
    assert warranty_data["warranty_status"] == "ACTIVE"
    assert warranty_data["is_valid"] is True
    assert warranty_data["warranty_duration_snapshot"] == 2  # 2 years inverter warranty
    assert warranty_data["customer_id"] == order_data["customer_id"]

