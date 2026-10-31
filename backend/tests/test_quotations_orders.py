import pytest
import uuid
from decimal import Decimal
from httpx import AsyncClient
from app.core.init_db import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD


async def get_admin_token(async_client: AsyncClient) -> str:
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    return login_resp.json()["data"]["access_token"]


async def create_approved_survey(async_client: AsyncClient, token: str) -> str:
    tech_resp = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "email": f"tech.{uuid.uuid4().hex[:6]}@sunpower.com",
            "password": "TechPassword@123",
            "full_name": "Test Tech",
            "role": "TECHNICIAN",
        },
    )
    tech_id = tech_resp.json()["data"]["id"]

    enquiry_resp = await async_client.post(
        "/api/v1/enquiries",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "customer_name": "Order Test Customer",
            "customer_phone": f"96{uuid.uuid4().hex[:8]}",
            "source": "PHONE_CALL",
            "system_capacity": "3kW",
            "system_type": "ON_GRID",
        },
    )
    enquiry_id = enquiry_resp.json()["data"]["id"]

    survey_resp = await async_client.post(
        "/api/v1/surveys",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "enquiry_id": enquiry_id,
            "assigned_technician_id": tech_id,
            "scheduled_date": "2026-11-05T09:00:00Z",
        },
    )
    survey_id = survey_resp.json()["data"]["id"]

    await async_client.put(
        f"/api/v1/surveys/{survey_id}/measurements",
        headers={"Authorization": f"Bearer {token}"},
        json={"roof_area_sqft": 500.0, "roof_orientation": "SOUTH", "grid_connection_suitable": True},
    )
    await async_client.post(f"/api/v1/surveys/{survey_id}/submit", headers={"Authorization": f"Bearer {token}"})
    await async_client.post(
        f"/api/v1/surveys/{survey_id}/review",
        headers={"Authorization": f"Bearer {token}"},
        json={"approval_status": "APPROVED"},
    )
    return survey_id


@pytest.mark.asyncio
async def test_quotation_to_order_and_payment_flow(async_client: AsyncClient):
    """Test full workflow: approved survey -> quotation -> accept -> order -> payment -> receipt."""
    token = await get_admin_token(async_client)
    survey_id = await create_approved_survey(async_client, token)

    # 1. Create Quotation
    quote_resp = await async_client.post(
        "/api/v1/quotations",
        headers={"Authorization": f"Bearer {token}"},
        json={"survey_id": survey_id, "discount": 1000.0},
    )
    assert quote_resp.status_code == 201
    quote_data = quote_resp.json()["data"]
    quotation_id = quote_data["id"]
    final_amount = quote_data["final_amount"]

    # 2. Cannot convert unaccepted quotation
    convert_fail = await async_client.post(
        "/api/v1/orders/convert",
        headers={"Authorization": f"Bearer {token}"},
        json={"quotation_id": quotation_id},
    )
    assert convert_fail.status_code == 400
    assert convert_fail.json()["error_code"] == "QUOTATION_NOT_ACCEPTED"

    # 3. Accept Quotation
    accept_resp = await async_client.post(
        f"/api/v1/quotations/{quotation_id}/accept",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert accept_resp.status_code == 200
    assert accept_resp.json()["data"]["status"] == "ACCEPTED"

    # 4. Convert to Order
    convert_resp = await async_client.post(
        "/api/v1/orders/convert",
        headers={"Authorization": f"Bearer {token}"},
        json={"quotation_id": quotation_id, "expected_installation_date": "2026-11-20T10:00:00Z"},
    )
    assert convert_resp.status_code == 201
    order_data = convert_resp.json()["data"]
    order_id = order_data["id"]
    assert Decimal(order_data["total_amount"]) == Decimal(final_amount)
    assert Decimal(order_data["outstanding_amount"]) == Decimal(final_amount)
    assert float(order_data["paid_amount"]) == 0.0
    assert order_data["payment_status"] == "PENDING"

    # 5. Record Advance Payment (50%)
    advance_amount = round(float(final_amount) / 2, 2)
    pay_resp = await async_client.post(
        "/api/v1/payments",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "order_id": order_id,
            "amount": advance_amount,
            "payment_method": "BANK_TRANSFER",
            "reference_number": "UTR-TEST-998877",
            "payment_type": "ADVANCE",
            "remarks": "50% advance for project initiation",
        },
    )
    assert pay_resp.status_code == 201
    pay_data = pay_resp.json()["data"]
    assert float(pay_data["amount"]) == advance_amount
    assert pay_data["receipt_pdf_path"] is not None

    # 6. Verify order outstanding updated
    order_check = await async_client.get(
        f"/api/v1/orders/{order_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert order_check.status_code == 200
    updated_order = order_check.json()["data"]
    assert float(updated_order["paid_amount"]) == advance_amount
    assert updated_order["payment_status"] == "PARTIALLY_PAID"
    assert round(float(updated_order["outstanding_amount"]), 2) == round(float(final_amount) - advance_amount, 2)
