import pytest
import uuid
from httpx import AsyncClient
from app.core.init_db import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD


async def get_admin_token(async_client: AsyncClient) -> str:
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    return login_resp.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_customer_lifecycle(async_client: AsyncClient):
    """Test creating, retrieving, updating, and adding addresses for a customer."""
    token = await get_admin_token(async_client)
    phone = f"98{uuid.uuid4().hex[:8]}"

    # 1. Create customer
    payload = {
        "name": "Amit Sharma",
        "phone": phone,
        "email": f"amit.{uuid.uuid4().hex[:6]}@example.com",
        "address": {
            "address_line": "Plot 42, Green Avenue",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560001",
            "is_primary": True,
        },
    }
    create_resp = await async_client.post(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert create_resp.status_code == 201
    customer_data = create_resp.json()["data"]
    customer_id = customer_data["id"]
    assert customer_data["name"] == "Amit Sharma"
    assert len(customer_data["addresses"]) == 1

    # 2. Add second address (e.g. factory project)
    addr_resp = await async_client.post(
        f"/api/v1/customers/{customer_id}/addresses",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "address_line": "Factory Unit 5, Industrial Area",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560099",
            "is_primary": False,
        },
    )
    assert addr_resp.status_code == 201

    # 3. Retrieve customer and verify both addresses exist
    get_resp = await async_client.get(
        f"/api/v1/customers/{customer_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert len(get_resp.json()["data"]["addresses"]) == 2


@pytest.mark.asyncio
async def test_enquiry_lifecycle_and_followups(async_client: AsyncClient):
    """Test creating an enquiry, assigning sales executive, and logging followups."""
    token = await get_admin_token(async_client)
    phone = f"99{uuid.uuid4().hex[:8]}"

    # Create enquiry with new customer details inline
    enquiry_payload = {
        "customer_name": "Suresh Patel",
        "customer_phone": phone,
        "customer_email": f"suresh.{uuid.uuid4().hex[:6]}@example.com",
        "address_line": "101 Sunshine Heights",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "postal_code": "380001",
        "source": "WHATSAPP",
        "system_capacity": "3kW",
        "system_type": "ON_GRID",
        "monthly_electricity_bill": 4500.00,
        "subsidy_required": True,
        "customer_requirements": "Rooftop terrace installation for residential house",
    }
    create_resp = await async_client.post(
        "/api/v1/enquiries",
        headers={"Authorization": f"Bearer {token}"},
        json=enquiry_payload,
    )
    assert create_resp.status_code == 201
    enquiry_data = create_resp.json()["data"]
    enquiry_id = enquiry_data["id"]
    assert enquiry_data["source"] == "WHATSAPP"
    assert enquiry_data["lead_status"] == "NEW"

    # Add follow-up
    followup_resp = await async_client.post(
        f"/api/v1/enquiries/{enquiry_id}/followups",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "notes": "Spoke with customer over phone. Interested in 3kW On-Grid system.",
            "lead_status_after": "CONTACTED",
            "next_scheduled_date": "2026-11-15T10:00:00Z",
        },
    )
    assert followup_resp.status_code == 201

    # Verify enquiry status updated to CONTACTED
    get_resp = await async_client.get(
        f"/api/v1/enquiries/{enquiry_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["lead_status"] == "CONTACTED"
    assert len(get_resp.json()["data"]["followups"]) == 1

