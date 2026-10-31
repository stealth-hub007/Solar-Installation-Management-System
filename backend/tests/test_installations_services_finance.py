import pytest
import io
import uuid
from decimal import Decimal
from httpx import AsyncClient
from app.core.init_db import DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD
from tests.test_quotations_orders import create_approved_survey, get_admin_token


@pytest.mark.asyncio
async def test_installation_service_tickets_and_finance_flow(async_client: AsyncClient):
    """Test full post-order execution: installation job completion, service tickets, warranty claims, project profitability, and dashboards."""
    token = await get_admin_token(async_client)
    survey_id = await create_approved_survey(async_client, token)

    # 1. Quotation -> Accept -> Convert to Order
    quote_resp = await async_client.post(
        "/api/v1/quotations",
        headers={"Authorization": f"Bearer {token}"},
        json={"survey_id": survey_id},
    )
    quote_id = quote_resp.json()["data"]["id"]
    await async_client.post(f"/api/v1/quotations/{quote_id}/accept", headers={"Authorization": f"Bearer {token}"})

    order_resp = await async_client.post(
        "/api/v1/orders/convert",
        headers={"Authorization": f"Bearer {token}"},
        json={"quotation_id": quote_id},
    )
    order_data = order_resp.json()["data"]
    order_id = order_data["id"]
    customer_id = order_data["customer_id"]

    # 2. Record 100% Payment
    await async_client.post(
        "/api/v1/payments",
        headers={"Authorization": f"Bearer {token}"},
        json={"order_id": order_id, "amount": order_data["total_amount"], "payment_type": "FINAL"},
    )

    # 3. Retrieve Pending Installation Job automatically generated for order
    jobs_resp = await async_client.get(
        "/api/v1/installations",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert jobs_resp.status_code == 200
    my_job = next(j for j in jobs_resp.json()["data"] if j["order_id"] == order_id)
    job_id = my_job["id"]
    assert my_job["installation_status"] == "PENDING_ASSIGNMENT"

    # 4. Create & Assign Technician
    tech_resp = await async_client.post(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "email": f"install.tech.{uuid.uuid4().hex[:6]}@sunpower.com",
            "password": "TechPassword@123",
            "full_name": "Deepak Installer",
            "role": "TECHNICIAN",
        },
    )
    tech_id = tech_resp.json()["data"]["id"]

    assign_resp = await async_client.post(
        f"/api/v1/installations/{job_id}/assign",
        headers={"Authorization": f"Bearer {token}"},
        json={"technician_id": tech_id, "scheduled_date": "2026-11-10T09:00:00Z"},
    )
    assert assign_resp.status_code == 200
    assert assign_resp.json()["data"]["installation_status"] == "SCHEDULED"

    # 5. Start Job & Update Checklist
    await async_client.post(f"/api/v1/installations/{job_id}/start", headers={"Authorization": f"Bearer {token}"})

    checklist_resp = await async_client.put(
        f"/api/v1/installations/{job_id}/checklist",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "mounting_stands_installed": True,
            "solar_panels_installed": True,
            "inverter_installed": True,
            "battery_installed": False,
            "wiring_completed": True,
            "safety_equipment_installed": True,
            "earthing_completed": True,
            "system_tested": True,
            "power_generation_verified": True,
        },
    )
    assert checklist_resp.status_code == 200

    # 6. Log Work Hours
    worklog_resp = await async_client.post(
        f"/api/v1/installations/{job_id}/work-logs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "start_time": "2026-11-10T09:00:00Z",
            "end_time": "2026-11-10T15:00:00Z",
            "hourly_rate": 350.00,
        },
    )
    assert worklog_resp.status_code == 201
    assert float(worklog_resp.json()["data"]["total_hours"]) == 6.0
    assert float(worklog_resp.json()["data"]["total_cost"]) == 2100.0

    # 7. Capture Customer Sign-off
    sig_content = b"fake-digital-signature-png-data"
    signoff_resp = await async_client.post(
        f"/api/v1/installations/{job_id}/signoff",
        headers={"Authorization": f"Bearer {token}"},
        data={"customer_name": "Ramesh Gupta", "feedback_rating": "5", "feedback_remarks": "Excellent generation!"},
        files={"signature_file": ("signature.png", io.BytesIO(sig_content), "image/png")},
    )
    assert signoff_resp.status_code == 201

    # 8. Complete Installation
    complete_resp = await async_client.post(
        f"/api/v1/installations/{job_id}/complete",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "power_generated_watts": 2850.0,
            "testing_results": "Grid synchronization achieved at 230V 50Hz, power output 2.85 kW",
        },
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["data"]["installation_status"] == "COMPLETED"

    # 9. Service Ticket & Warranty Claim Evaluation
    ticket_resp = await async_client.post(
        "/api/v1/service-tickets",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "customer_id": customer_id,
            "order_id": order_id,
            "complaint_description": "Inverter displays Error E04 during afternoon peak",
        },
    )
    assert ticket_resp.status_code == 201
    ticket_id = ticket_resp.json()["data"]["id"]

    # Assign technician to ticket
    await async_client.patch(
        f"/api/v1/service-tickets/{ticket_id}/assign",
        headers={"Authorization": f"Bearer {token}"},
        json={"technician_id": tech_id},
    )

    # Record Service Action (Covered Repair)
    action_resp = await async_client.post(
        f"/api/v1/service-tickets/{ticket_id}/actions",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "action_type": "REPAIR",
            "description": "Re-crimped MC4 connector and updated inverter firmware",
            "parts_cost": 500.0,
            "labour_cost": 800.0,
        },
    )
    assert action_resp.status_code == 201

    # Resolve and customer confirm
    await async_client.post(
        f"/api/v1/service-tickets/{ticket_id}/resolve",
        headers={"Authorization": f"Bearer {token}"},
        json={"resolution_details": "Error cleared, system generating at full capacity"},
    )
    close_resp = await async_client.post(
        f"/api/v1/service-tickets/{ticket_id}/confirm-and-close",
        headers={"Authorization": f"Bearer {token}"},
        json={"confirmed": True},
    )
    assert close_resp.status_code == 200
    assert close_resp.json()["data"]["ticket_status"] == "CLOSED"

    # 10. Record Project Expense
    exp_resp = await async_client.post(
        "/api/v1/expenses",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "order_id": order_id,
            "expense_category": "TRANSPORT",
            "amount": 2500.0,
            "description": "Logistics delivery vehicle rental",
        },
    )
    assert exp_resp.status_code == 201

    # 11. Project Profitability Calculation
    profit_resp = await async_client.get(
        f"/api/v1/reports/profitability/{order_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert profit_resp.status_code == 200
    profit_data = profit_resp.json()["data"]
    assert float(profit_data["billed_revenue"]) > 0
    assert float(profit_data["technician_labour_cost"]) == 2100.0
    assert float(profit_data["direct_project_expenses"]) == 2500.0
    assert float(profit_data["total_project_cost"]) > 0
    assert float(profit_data["net_profit"]) > 0
    assert float(profit_data["profit_margin_percentage"]) > 0

    # 12. Financial Summary Report & CSV Export
    summary_resp = await async_client.get(
        "/api/v1/reports/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert summary_resp.status_code == 200

    csv_resp = await async_client.get(
        "/api/v1/reports/profitability/export/csv",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert csv_resp.status_code == 200
    assert "Billed Revenue (INR)" in csv_resp.text

    # 13. Dashboards Verification
    admin_dash = await async_client.get("/api/v1/dashboard/admin", headers={"Authorization": f"Bearer {token}"})
    assert admin_dash.status_code == 200
    assert admin_dash.json()["data"]["total_customers"] >= 1

    tech_dash = await async_client.get("/api/v1/dashboard/technician", headers={"Authorization": f"Bearer {token}"})
    assert tech_dash.status_code == 200

    sales_dash = await async_client.get("/api/v1/dashboard/sales", headers={"Authorization": f"Bearer {token}"})
    assert sales_dash.status_code == 200

    warehouse_dash = await async_client.get("/api/v1/dashboard/warehouse", headers={"Authorization": f"Bearer {token}"})
    assert warehouse_dash.status_code == 200
