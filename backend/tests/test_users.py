import pytest
import uuid
from httpx import AsyncClient
from app.core.init_db import (
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
)


async def get_admin_token(async_client: AsyncClient) -> str:
    """Helper to login as admin and return access token."""
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    return login_resp.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_admin_create_sales_user(async_client: AsyncClient):
    """Test admin creating a new sales executive account."""
    admin_token = await get_admin_token(async_client)
    unique_email = f"sales.{uuid.uuid4().hex[:6]}@sunpower.com"

    sales_payload = {
        "email": unique_email,
        "password": "SalesPassword@123",
        "full_name": "Ravi Kumar (Sales)",
        "phone": f"9811{uuid.uuid4().hex[:6]}",
        "role": "SALES",
    }
    response = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=sales_payload,
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["email"] == unique_email
    assert data["role"] == "SALES"
    assert data["is_active"] is True
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_duplicate_user_conflict(async_client: AsyncClient):
    """Test creating a user with an existing email returns 409 conflict."""
    admin_token = await get_admin_token(async_client)
    dup_email = f"dup.{uuid.uuid4().hex[:6]}@sunpower.com"

    payload = {
        "email": dup_email,
        "password": "SalesPassword@123",
        "full_name": "Original User",
        "phone": "9811998877",
        "role": "SALES",
    }
    first_resp = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert first_resp.status_code == 201

    dup_resp = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json=payload,
    )
    assert dup_resp.status_code == 409
    assert dup_resp.json()["error_code"] == "EMAIL_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_non_admin_cannot_create_user(async_client: AsyncClient):
    """Test that a sales user cannot create new user accounts (403 Forbidden)."""
    admin_token = await get_admin_token(async_client)
    sales_email = f"sales.{uuid.uuid4().hex[:6]}@sunpower.com"
    sales_pw = "SalesPassword@123"

    await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": sales_email,
            "password": sales_pw,
            "full_name": "Sales Rep",
            "role": "SALES",
        },
    )

    sales_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": sales_email, "password": sales_pw},
    )
    sales_token = sales_login.json()["data"]["access_token"]

    tech_payload = {
        "email": f"tech.{uuid.uuid4().hex[:6]}@sunpower.com",
        "password": "TechPassword@123",
        "full_name": "New Tech",
        "role": "TECHNICIAN",
    }
    response = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {sales_token}"},
        json=tech_payload,
    )
    assert response.status_code == 403
    assert response.json()["error_code"] == "FORBIDDEN_ROLE"


@pytest.mark.asyncio
async def test_admin_list_users(async_client: AsyncClient):
    """Test listing users with role filtering and pagination."""
    admin_token = await get_admin_token(async_client)

    response = await async_client.get(
        "/api/v1/users?role=SALES&page=1&size=10",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "items" in data
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["role"] == "SALES"


@pytest.mark.asyncio
async def test_admin_deactivate_and_activate_user(async_client: AsyncClient):
    """Test toggling user active status and verifying login is blocked when inactive."""
    admin_token = await get_admin_token(async_client)

    # 1. Create a technician to test deactivation
    tech_email = f"tech.{uuid.uuid4().hex[:6]}@sunpower.com"
    tech_pw = "TechPass@123"
    create_resp = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": tech_email,
            "password": tech_pw,
            "full_name": "Temporary Technician",
            "role": "TECHNICIAN",
        },
    )
    assert create_resp.status_code == 201
    user_id = create_resp.json()["data"]["id"]

    # 2. Deactivate the technician
    deact_resp = await async_client.patch(
        f"/api/v1/users/{user_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"is_active": False},
    )
    assert deact_resp.status_code == 200
    assert deact_resp.json()["data"]["is_active"] is False

    # 3. Attempt login with deactivated user -> should fail with 401
    login_attempt = await async_client.post(
        "/api/v1/auth/login",
        json={"email": tech_email, "password": tech_pw},
    )
    assert login_attempt.status_code == 401
    assert login_attempt.json()["error_code"] == "ACCOUNT_INACTIVE"

    # 4. Reactivate user
    react_resp = await async_client.patch(
        f"/api/v1/users/{user_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"is_active": True},
    )
    assert react_resp.status_code == 200
    assert react_resp.json()["data"]["is_active"] is True

    # 5. Login should now succeed
    login_success = await async_client.post(
        "/api/v1/auth/login",
        json={"email": tech_email, "password": tech_pw},
    )
    assert login_success.status_code == 200


@pytest.mark.asyncio
async def test_admin_cannot_deactivate_self(async_client: AsyncClient):
    """Test business rule preventing administrators from deactivating their own account."""
    admin_token = await get_admin_token(async_client)

    # Get admin self user ID
    me_resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    admin_id = me_resp.json()["data"]["id"]

    # Try deactivating self
    deact_resp = await async_client.patch(
        f"/api/v1/users/{admin_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"is_active": False},
    )
    assert deact_resp.status_code == 400
    assert deact_resp.json()["error_code"] == "CANNOT_DEACTIVATE_SELF"
