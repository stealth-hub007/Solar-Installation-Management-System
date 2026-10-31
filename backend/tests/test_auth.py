import pytest
from httpx import AsyncClient
from app.core.init_db import (
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASSWORD,
)


@pytest.mark.asyncio
async def test_admin_login_success(async_client: AsyncClient):
    """Test login with valid administrator credentials."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["token_type"] == "bearer"
    assert data["data"]["user"]["email"] == DEFAULT_ADMIN_EMAIL
    assert data["data"]["user"]["role"] == "ADMIN"
    assert "hashed_password" not in data["data"]["user"]


@pytest.mark.asyncio
async def test_login_invalid_password(async_client: AsyncClient):
    """Test login with wrong password returns 401."""
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": "WrongPassword123!"},
    )
    assert response.status_code == 401
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "INVALID_CREDENTIALS"


@pytest.mark.asyncio
async def test_refresh_token_flow(async_client: AsyncClient):
    """Test refreshing an access token using a valid refresh token."""
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    refresh_token = login_resp.json()["data"]["refresh_token"]

    refresh_resp = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 200
    new_data = refresh_resp.json()["data"]
    assert "access_token" in new_data
    assert "refresh_token" in new_data


@pytest.mark.asyncio
async def test_get_current_user_profile(async_client: AsyncClient):
    """Test retrieving authenticated user's own profile via /api/v1/auth/me."""
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    token = login_resp.json()["data"]["access_token"]

    me_resp = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 200
    me_data = me_resp.json()["data"]
    assert me_data["email"] == DEFAULT_ADMIN_EMAIL
    assert me_data["role"] == "ADMIN"


@pytest.mark.asyncio
async def test_update_profile(async_client: AsyncClient):
    """Test updating authenticated user's profile details."""
    login_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": DEFAULT_ADMIN_PASSWORD},
    )
    token = login_resp.json()["data"]["access_token"]

    update_resp = await async_client.put(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "Chief Solar Officer", "phone": "9998887776"},
    )
    assert update_resp.status_code == 200
    updated_data = update_resp.json()["data"]
    assert updated_data["full_name"] == "Chief Solar Officer"
    assert updated_data["phone"] == "9998887776"


@pytest.mark.asyncio
async def test_password_reset_with_otp_flow(async_client: AsyncClient):
    """Test requesting an OTP and resetting the password."""
    # 1. Request OTP
    forgot_resp = await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": DEFAULT_ADMIN_EMAIL},
    )
    assert forgot_resp.status_code == 200
    forgot_data = forgot_resp.json()["data"]
    assert "dev_otp" in forgot_data
    otp_code = forgot_data["dev_otp"]
    assert len(otp_code) == 6

    # 2. Reset Password with OTP
    new_temp_pw = "NewAdminSecure@999"
    reset_resp = await async_client.post(
        "/api/v1/auth/reset-password",
        json={
            "email": DEFAULT_ADMIN_EMAIL,
            "otp_code": otp_code,
            "new_password": new_temp_pw,
        },
    )
    assert reset_resp.status_code == 200

    # 3. Verify login works with new password
    verify_resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": DEFAULT_ADMIN_EMAIL, "password": new_temp_pw},
    )
    assert verify_resp.status_code == 200

    # 4. Restore original password for other tests
    token = verify_resp.json()["data"]["access_token"]
    restore_resp = await async_client.post(
        "/api/v1/auth/change-password",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "current_password": new_temp_pw,
            "new_password": DEFAULT_ADMIN_PASSWORD,
        },
    )
    assert restore_resp.status_code == 200

