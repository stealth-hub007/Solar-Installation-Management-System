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
async def test_survey_workflow_and_approval_rule(async_client: AsyncClient):
    """Test full survey lifecycle and verify that quotations are blocked unless survey is approved."""
    token = await get_admin_token(async_client)

    # 1. Create Technician
    tech_email = f"survey.tech.{uuid.uuid4().hex[:6]}@sunpower.com"
    tech_resp = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "email": tech_email,
            "password": "TechPassword@123",
            "full_name": "Karthik Technician",
            "role": "TECHNICIAN",
        },
    )
    assert tech_resp.status_code == 201
    tech_id = tech_resp.json()["data"]["id"]

    # 2. Create Enquiry
    enquiry_resp = await async_client.post(
        "/api/v1/enquiries",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "customer_name": "Ramesh Gupta",
            "customer_phone": f"97{uuid.uuid4().int % 10**8:08d}",
            "source": "WEBSITE_FORM",
            "system_capacity": "5kW",
            "system_type": "ON_GRID",
        },
    )
    assert enquiry_resp.status_code == 201
    enquiry_id = enquiry_resp.json()["data"]["id"]

    # 3. Schedule Survey
    survey_resp = await async_client.post(
        "/api/v1/surveys",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "enquiry_id": enquiry_id,
            "assigned_technician_id": tech_id,
            "scheduled_date": "2026-11-05T09:00:00Z",
        },
    )
    assert survey_resp.status_code == 201
    survey_data = survey_resp.json()["data"]
    survey_id = survey_data["id"]
    assert survey_data["survey_status"] == "SCHEDULED"
    assert survey_data["approval_status"] == "PENDING_APPROVAL"

    # 4. BUSINESS RULE TEST: Attempt to create quotation while survey is NOT approved -> MUST FAIL
    blocked_quote = await async_client.post(
        "/api/v1/quotations",
        headers={"Authorization": f"Bearer {token}"},
        json={"survey_id": survey_id},
    )
    assert blocked_quote.status_code == 400
    assert blocked_quote.json()["error_code"] == "SURVEY_NOT_APPROVED"

    # 5. Technician Records Measurements
    meas_resp = await async_client.put(
        f"/api/v1/surveys/{survey_id}/measurements",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "roof_area_sqft": 450.0,
            "roof_orientation": "SOUTH",
            "roof_tilt_degrees": 15.0,
            "shadow_free_area_sqft": 400.0,
            "monthly_bill": 3500.0,
            "cable_distance_meters": 22.5,
            "grid_connection_suitable": True,
            "technician_remarks": "Clean reinforced concrete roof, zero shadows",
        },
    )
    assert meas_resp.status_code == 200

    # 6. Technician Submits Survey
    sub_resp = await async_client.post(
        f"/api/v1/surveys/{survey_id}/submit",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert sub_resp.status_code == 200
    assert sub_resp.json()["data"]["survey_status"] == "SUBMITTED"

    # 7. Admin Approves Survey
    approve_resp = await async_client.post(
        f"/api/v1/surveys/{survey_id}/review",
        headers={"Authorization": f"Bearer {token}"},
        json={"approval_status": "APPROVED"},
    )
    assert approve_resp.status_code == 200
    assert approve_resp.json()["data"]["approval_status"] == "APPROVED"

    # 8. BUSINESS RULE TEST: Now quotation creation MUST succeed!
    success_quote = await async_client.post(
        "/api/v1/quotations",
        headers={"Authorization": f"Bearer {token}"},
        json={"survey_id": survey_id, "discount": 2000.0},
    )
    assert success_quote.status_code == 201
    quote_data = success_quote.json()["data"]
    assert quote_data["status"] == "DRAFT"
    assert float(quote_data["discount"]) == 2000.0
    assert float(quote_data["final_amount"]) > 0
    assert quote_data["pdf_path"] is not None


@pytest.mark.asyncio
async def test_sales_scheduled_survey_is_visible_to_assigned_technician(async_client: AsyncClient):
    admin_token = await get_admin_token(async_client)
    tech_email = f"assigned.tech.{uuid.uuid4().hex[:8]}@sunpower.com"
    technician_response = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": tech_email,
            "password": "TechPassword@123",
            "full_name": "Assigned Test Technician",
            "role": "TECHNICIAN",
        },
    )
    assert technician_response.status_code == 201
    technician_id = technician_response.json()["data"]["id"]

    technician_list_response = await async_client.get(
        "/api/v1/sales/technicians",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert technician_list_response.status_code == 200
    assert any(item["id"] == technician_id for item in technician_list_response.json())

    enquiry_response = await async_client.post(
        "/api/v1/enquiries",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "customer_name": "Sales Scheduled Survey Customer",
            "customer_phone": f"97{uuid.uuid4().int % 10**8:08d}",
            "source": "WEBSITE_FORM",
            "system_capacity": "5kW",
            "system_type": "ON_GRID",
        },
    )
    assert enquiry_response.status_code == 201
    enquiry_id = enquiry_response.json()["data"]["id"]

    schedule_response = await async_client.post(
        "/api/v1/sales/surveys",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "enquiryId": enquiry_id,
            "assignedTechnicianId": technician_id,
            "scheduledDate": "2026-11-05",
            "scheduledTime": "10:30 AM",
        },
    )
    assert schedule_response.status_code == 200
    survey_id = schedule_response.json()["id"]
    assert schedule_response.json()["assignedTechnicianId"] == technician_id

    technician_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": tech_email, "password": "TechPassword@123"},
    )
    assert technician_login.status_code == 200
    technician_token = technician_login.json()["data"]["access_token"]
    assigned_surveys_response = await async_client.get(
        "/api/v1/surveys?page=1&size=100",
        headers={"Authorization": f"Bearer {technician_token}"},
    )
    assert assigned_surveys_response.status_code == 200
    assigned_surveys = assigned_surveys_response.json()["data"]["items"]
    assert any(str(survey["id"]) == survey_id for survey in assigned_surveys)

    measurement_response = await async_client.put(
        f"/api/v1/surveys/{survey_id}/measurements",
        headers={"Authorization": f"Bearer {technician_token}"},
        json={
            "roof_area_sqft": 500.0,
            "shadow_free_area_sqft": 450.0,
            "roof_orientation": "SOUTH",
            "roof_tilt_degrees": 15.0,
            "cable_distance_meters": 20.0,
            "monthly_bill": 3500.0,
            "grid_connection_suitable": True,
        },
    )
    assert measurement_response.status_code == 200

    submit_response = await async_client.post(
        f"/api/v1/surveys/{survey_id}/submit",
        headers={"Authorization": f"Bearer {technician_token}"},
    )
    assert submit_response.status_code == 200
    assert submit_response.json()["data"]["survey_status"] == "SUBMITTED"

    review_response = await async_client.post(
        f"/api/v1/surveys/{survey_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"approval_status": "APPROVED"},
    )
    assert review_response.status_code == 200
    assert review_response.json()["data"]["approval_status"] == "APPROVED"

    quotation_response = await async_client.post(
        "/api/v1/quotations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"survey_id": survey_id},
    )
    assert quotation_response.status_code == 201
