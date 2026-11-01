"""
End-to-End Lifecycle Test: Complete 18-Phase Solar Installation Management System
Tests all sequential phases from customer enquiry to installation closure and warranty.
"""

import os
import io
import json
import uuid
import pytest
import httpx
from datetime import datetime, timedelta, timezone

BASE_URL = os.environ.get("TEST_BASE_URL", "http://127.0.0.1:8000/api/v1")


class TestSolarCustomerToInstallationLifecycle:
    @classmethod
    def setup_class(cls):
        # 1. Authenticate users
        cls.client = httpx.Client(timeout=30.0)

        # Admin login
        admin_login = cls.client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "admin@sunpower.com", "password": "Admin@12345Password"},
        ).json()
        assert admin_login.get("success") is True, f"Admin login failed: {admin_login}"
        cls.admin_token = admin_login["data"]["access_token"]
        cls.admin_headers = {"Authorization": f"Bearer {cls.admin_token}"}

        # Technician login
        tech_login = cls.client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "vikram.tech@sunpower.com", "password": "Tech@12345Pass"},
        ).json()
        assert tech_login.get("success") is True, f"Technician login failed: {tech_login}"
        cls.tech_token = tech_login["data"]["access_token"]
        cls.tech_id = tech_login["data"]["user"]["id"]
        cls.tech_headers = {"Authorization": f"Bearer {cls.tech_token}"}

        # Warehouse login
        wh_login = cls.client.post(
            f"{BASE_URL}/auth/login",
            json={"email": "warehouse@sunpower.com", "password": "Warehouse@12345Pass"},
        ).json()
        assert wh_login.get("success") is True, f"Warehouse login failed: {wh_login}"
        cls.wh_token = wh_login["data"]["access_token"]
        cls.wh_headers = {"Authorization": f"Bearer {cls.wh_token}"}

        cls.unique_suffix = uuid.uuid4().hex[:6]
        cls.numeric_suffix = f"{uuid.uuid4().int % 10**8:08d}"
        print(f"\n[E2E SETUP] Authenticated all 3 operational roles. Test run ID: {cls.unique_suffix}")

    @classmethod
    def teardown_class(cls):
        cls.client.close()

    def test_full_18_phase_lifecycle(self):
        suffix = self.unique_suffix

        # =========================================================================
        # PHASE 1: Customer Enquiry
        # =========================================================================
        print("\n--> [Phase 1/18] Submitting Customer Enquiry...")
        enquiry_payload = {
            "customer_name": f"Rajesh Sharma {suffix}",
            "customer_phone": f"+91 98{self.numeric_suffix}",
            "customer_email": f"rajesh.sharma.{suffix}@gmail.com",
            "address_line": "Villa 42, Palm Greens, Vaishali Nagar",
            "city": "Jaipur",
            "state": "Rajasthan",
            "postal_code": "302021",
            "source": "WEBSITE_FORM",
            "system_capacity": "3kW",
            "system_type": "ON_GRID",
            "monthly_electricity_bill": 4500.0,
            "subsidy_required": True,
            "customer_requirements": "Interested in 3kW on-grid rooftop system to offset high AC power bills.",
        }
        res = self.client.post(f"{BASE_URL}/enquiries", json=enquiry_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 1 failed: {res.text}"
        enquiry_data = res.json()["data"]
        enquiry_id = enquiry_data["id"]
        print(f"  [PASS] Enquiry created successfully. ID: {enquiry_id}, Status: {enquiry_data['lead_status']}")

        # =========================================================================
        # PHASE 2: Customer Registration
        # =========================================================================
        print("\n--> [Phase 2/18] Registering & Verifying Customer Profile and Property Details...")
        customer_id = enquiry_data["customer_id"]

        # Sales records verified property address
        property_address_payload = {
            "address_line": "Villa 42, Palm Greens, Vaishali Nagar",
            "city": "Jaipur",
            "state": "Rajasthan",
            "postal_code": "302021",
            "is_primary": True,
        }
        res = self.client.post(f"{BASE_URL}/customers/{customer_id}/addresses", json=property_address_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 2 address creation failed: {res.text}"

        # Sales updates and confirms customer profile
        customer_update_payload = {
            "name": f"Rajesh Sharma {suffix}",
            "email": f"rajesh.sharma.{suffix}@gmail.com",
            "is_active": True,
        }
        res = self.client.put(f"{BASE_URL}/customers/{customer_id}", json=customer_update_payload, headers=self.admin_headers)
        assert res.status_code == 200, f"Phase 2 customer update failed: {res.text}"
        customer_data = res.json()["data"]
        print(f"  [PASS] Customer registered and property details saved. ID: {customer_id}, Name: {customer_data['name']}")

        # =========================================================================
        # PHASE 3: Site Survey Scheduling
        # =========================================================================
        print("\n--> [Phase 3/18] Scheduling Site Survey with Field Technician...")
        survey_schedule_payload = {
            "enquiry_id": enquiry_id,
            "assigned_technician_id": self.tech_id,
            "scheduled_date": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
        }
        res = self.client.post(f"{BASE_URL}/surveys", json=survey_schedule_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 3 failed: {res.text}"
        survey_data = res.json()["data"]
        survey_id = survey_data["id"]
        assert survey_data["survey_status"] == "SCHEDULED"
        print(f"  [PASS] Survey scheduled. Survey ID: {survey_id}, Status: {survey_data['survey_status']}")

        # =========================================================================
        # PHASE 4: Site Survey Execution (Measurements, Photos, Submission)
        # =========================================================================
        print("\n--> [Phase 4/18] Recording Survey Measurements & Photos by Technician...")
        measurements_payload = {
            "roof_area_sqft": 480.0,
            "roof_orientation": "SOUTH",
            "roof_tilt_degrees": 26.5,
            "shadow_free_area_sqft": 420.0,
            "monthly_bill": 4500.0,
            "grid_connection_suitable": True,
            "cable_distance_meters": 18.5,
            "technician_remarks": "South-facing RCC flat terrace with zero shading. Excellent solar irradiance. Feasible for 3kW rooftop system.",
        }
        res = self.client.put(f"{BASE_URL}/surveys/{survey_id}/measurements", json=measurements_payload, headers=self.tech_headers)
        assert res.status_code == 200, f"Phase 4 (measurements) failed: {res.text}"

        # Upload dummy site survey photo
        photo_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        files = {"file": ("roof_inspection.png", photo_bytes, "image/png")}
        data = {"caption": "Roof south orientation and clean unshaded layout"}
        res = self.client.post(f"{BASE_URL}/surveys/{survey_id}/photos", files=files, data=data, headers=self.tech_headers)
        assert res.status_code == 201, f"Phase 4 (photos) failed: {res.text}"

        # Submit survey for review
        res = self.client.post(f"{BASE_URL}/surveys/{survey_id}/submit", headers=self.tech_headers)
        assert res.status_code == 200, f"Phase 4 (submit) failed: {res.text}"
        assert res.json()["data"]["survey_status"] == "SUBMITTED"
        print(f"  [PASS] Survey measurements & photos saved. Status: SUBMITTED")

        # =========================================================================
        # PHASE 5: Survey Approval
        # =========================================================================
        print("\n--> [Phase 5/18] Reviewing & Approving Site Survey (Admin)...")
        review_payload = {
            "approval_status": "APPROVED",
            "rejection_reason": None,
        }
        res = self.client.post(f"{BASE_URL}/surveys/{survey_id}/review", json=review_payload, headers=self.admin_headers)
        assert res.status_code == 200, f"Phase 5 failed: {res.text}"
        survey_approved = res.json()["data"]
        assert survey_approved["approval_status"] == "APPROVED"
        print(f"  [PASS] Survey approved. Approval Status: {survey_approved['approval_status']}")

        # =========================================================================
        # PHASE 6: Quotation Generation
        # =========================================================================
        print("\n--> [Phase 6/18] Generating Quotation based on Approved Survey...")
        # Get 3kW package
        pkg_res = self.client.get(f"{BASE_URL}/packages", headers=self.admin_headers)
        packages = pkg_res.json()["data"]
        target_pkg = next((p for p in packages if "3" in str(p.get("capacity", "")) or "3" in p.get("name", "")), packages[0])
        package_id = target_pkg["id"]

        quote_payload = {
            "survey_id": survey_id,
            "package_id": package_id,
            "discount": 5000.0,
            "valid_days": 30,
            "terms_conditions": "1. 30% advance on order confirmation. 2. 5-year comprehensive system warranty.",
        }
        res = self.client.post(f"{BASE_URL}/quotations", json=quote_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 6 failed: {res.text}"
        quotation_data = res.json()["data"]
        quotation_id = quotation_data["id"]
        final_amount = float(quotation_data["final_amount"])
        print(f"  [PASS] Quotation created: {quotation_data['quotation_number']}, Final Amount: ₹{final_amount:,.2f}")

        # =========================================================================
        # PHASE 7: Customer Quotation Acceptance
        # =========================================================================
        print("\n--> [Phase 7/18] Customer Accepts Quotation...")
        res = self.client.post(f"{BASE_URL}/quotations/{quotation_id}/accept", headers=self.admin_headers)
        assert res.status_code == 200, f"Phase 7 failed: {res.text}"
        assert res.json()["data"]["status"] == "ACCEPTED"
        print(f"  [PASS] Quotation status: ACCEPTED")

        # =========================================================================
        # PHASE 8 & 9: Sales Order Confirmation & Advance Payment
        # =========================================================================
        print("\n--> [Phase 8/18 & 9/18] Converting Quotation to Sales Order...")
        convert_payload = {
            "quotation_id": quotation_id,
            "expected_installation_date": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        }
        res = self.client.post(f"{BASE_URL}/orders/convert", json=convert_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 9 failed: {res.text}"
        order_data = res.json()["data"]
        order_id = order_data["id"]
        order_number = order_data["order_number"]
        assert order_data["order_status"] == "CONFIRMED"
        print(f"  [PASS] Sales Order confirmed: {order_number}, Total: ₹{float(order_data['total_amount']):,.2f}")

        print("\n--> [Phase 8/18] Recording Advance Payment...")
        advance_amount = round(final_amount * 0.30, 2)
        payment_payload = {
            "order_id": order_id,
            "amount": advance_amount,
            "payment_method": "BANK_TRANSFER",
            "payment_type": "ADVANCE",
            "reference_number": f"NEFT-SIMS-{suffix.upper()}-ADV",
            "remarks": "30% Advance booking deposit received.",
        }
        res = self.client.post(f"{BASE_URL}/payments", json=payment_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 8 failed: {res.text}"
        adv_payment = res.json()["data"]
        print(f"  [PASS] Advance payment recorded: {adv_payment['payment_number']}, Amount: ₹{float(adv_payment['amount']):,.2f}")

        # =========================================================================
        # PHASE 10: Material Reservation & Procurement Check
        # =========================================================================
        print("\n--> [Phase 10/18] Reserving Material Stock in Warehouse...")
        res = self.client.post(f"{BASE_URL}/inventory/reserve/{order_id}", headers=self.wh_headers)
        assert res.status_code == 200, f"Phase 10 failed: {res.text}"
        print(f"  [PASS] Warehouse stock successfully reserved for order {order_number}")

        # =========================================================================
        # PHASE 11: Picking, Packing, and Dispatch
        # =========================================================================
        print("\n--> [Phase 11/18] Picking, Packing, and Dispatching Materials...")
        order_get = self.client.get(f"{BASE_URL}/orders/{order_id}", headers=self.admin_headers).json()["data"]
        dispatch_items = []
        for itm in order_get["items"]:
            prod_id = itm["product_id"]
            qty = float(itm["quantity"])

            prod_info = self.client.get(f"{BASE_URL}/products/{prod_id}", headers=self.admin_headers).json()["data"]
            if prod_info["is_serial_tracked"]:
                new_serial = f"INV-TEST-{suffix.upper()}-{uuid.uuid4().hex[:4].upper()}"
                reg_res = self.client.post(
                    f"{BASE_URL}/serials/register",
                    json={"product_id": prod_id, "serial_numbers": [new_serial]},
                    headers=self.wh_headers,
                )
                assert reg_res.status_code == 201, f"Serial register failed: {reg_res.text}"
                serial_id = reg_res.json()["data"][0]["id"]
                dispatch_items.append({"product_id": prod_id, "quantity": qty, "serial_id": serial_id})
            else:
                dispatch_items.append({"product_id": prod_id, "quantity": qty, "serial_id": None})

        dispatch_payload = {
            "order_id": order_id,
            "items": dispatch_items,
            "remarks": "Materials verified, packed in weather-resistant crates and dispatched via SunPower Logistics.",
        }
        res = self.client.post(f"{BASE_URL}/dispatches", json=dispatch_payload, headers=self.wh_headers)
        assert res.status_code == 201, f"Phase 11 failed: {res.text}"
        dispatch_data = res.json()["data"]
        dispatch_id = dispatch_data["id"]
        assert dispatch_data["dispatch_status"] == "DISPATCHED"
        print(f"  [PASS] Dispatch created: {dispatch_data['dispatch_number']}, Status: DISPATCHED")

        # =========================================================================
        # PHASE 12: Delivery Confirmation
        # =========================================================================
        print("\n--> [Phase 12/18] Confirming Equipment Delivery on Customer Site...")
        delivery_payload = {
            "received_by_name": f"Rajesh Sharma (Customer)",
            "delivery_date": datetime.now(timezone.utc).isoformat(),
        }
        res = self.client.post(f"{BASE_URL}/dispatches/{dispatch_id}/confirm-delivery", json=delivery_payload, headers=self.admin_headers)
        assert res.status_code == 200, f"Phase 12 failed: {res.text}"
        deliv_res = res.json()["data"]
        assert deliv_res["dispatch_id"] == dispatch_id

        # Confirm dispatch status transitioned to DELIVERED
        dsp_check = self.client.get(f"{BASE_URL}/dispatches/{dispatch_id}", headers=self.admin_headers).json()["data"]
        assert dsp_check["dispatch_status"] == "DELIVERED"
        print(f"  [PASS] Delivery confirmed by recipient ({deliv_res['received_by_name']}). Status: DELIVERED")

        # =========================================================================
        # PHASE 13: Installation Scheduling
        # =========================================================================
        print("\n--> [Phase 13/18] Scheduling Installation Job & Assigning Technician...")
        jobs_res = self.client.get(f"{BASE_URL}/installations", headers=self.admin_headers).json()["data"]
        inst_job = next((j for j in jobs_res if j["order_id"] == order_id), None)
        assert inst_job is not None, f"No installation job found for order {order_id}"
        installation_id = inst_job["id"]

        assign_payload = {
            "technician_id": self.tech_id,
            "scheduled_date": datetime.now(timezone.utc).isoformat(),
        }
        res = self.client.post(f"{BASE_URL}/installations/{installation_id}/assign", json=assign_payload, headers=self.admin_headers)
        assert res.status_code == 200, f"Phase 13 failed: {res.text}"
        job_assigned = res.json()["data"]
        assert job_assigned["installation_status"] == "SCHEDULED"
        print(f"  [PASS] Installation scheduled: {job_assigned['job_number']}, Assigned Tech ID: {self.tech_id}")

        # =========================================================================
        # PHASE 14: Solar Installation Commencement
        # =========================================================================
        print("\n--> [Phase 14/18] Technician Starts Installation Work...")
        res = self.client.post(f"{BASE_URL}/installations/{installation_id}/start", headers=self.tech_headers)
        assert res.status_code == 200, f"Phase 14 failed: {res.text}"
        job_started = res.json()["data"]
        assert job_started["installation_status"] == "IN_PROGRESS"
        print(f"  [PASS] Installation job in progress. Status: IN_PROGRESS")

        # =========================================================================
        # PHASE 15: Testing and Commissioning (Checklist & Work Logs)
        # =========================================================================
        print("\n--> [Phase 15/18] Completing Commissioning Checklist & Logging Labor Hours...")
        checklist_payload = {
            "mounting_stands_installed": True,
            "solar_panels_installed": True,
            "inverter_installed": True,
            "battery_installed": True,
            "wiring_completed": True,
            "safety_equipment_installed": True,
            "earthing_completed": True,
            "system_tested": True,
            "power_generation_verified": True,
        }
        res = self.client.put(f"{BASE_URL}/installations/{installation_id}/checklist", json=checklist_payload, headers=self.tech_headers)
        assert res.status_code == 200, f"Phase 15 (checklist) failed: {res.text}"
        chk_data = res.json()["data"]
        assert chk_data["power_generation_verified"] is True

        worklog_payload = {
            "start_time": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
            "end_time": datetime.now(timezone.utc).isoformat(),
            "hourly_rate": 350.0,
        }
        res = self.client.post(f"{BASE_URL}/installations/{installation_id}/work-logs", json=worklog_payload, headers=self.tech_headers)
        assert res.status_code == 201, f"Phase 15 (worklog) failed: {res.text}"
        print(f"  [PASS] Mandatory checklist 100% verified & technician work hours logged.")

        # =========================================================================
        # PHASE 16: Customer Handover & Digital Sign-off
        # =========================================================================
        print("\n--> [Phase 16/18] Capturing Customer Digital Sign-off & Inspection Handover...")
        sig_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        sig_files = {"signature_file": ("cust_signature.png", sig_bytes, "image/png")}
        sig_form = {
            "customer_name": f"Rajesh Sharma {suffix}",
            "feedback_rating": 5,
            "feedback_remarks": "Flawless rooftop installation. Power generation verified at 3.12 kW in full sunlight. Highly satisfied!",
        }
        res = self.client.post(
            f"{BASE_URL}/installations/{installation_id}/signoff",
            files=sig_files,
            data=sig_form,
            headers=self.tech_headers,
        )
        assert res.status_code == 201, f"Phase 16 failed: {res.text}"
        signoff_res = res.json()["data"]
        print(f"  [PASS] Customer sign-off recorded. Signature path: {signoff_res['signature_path']}")

        # =========================================================================
        # PHASE 17: Final Payment
        # =========================================================================
        print("\n--> [Phase 17/18] Customer Settles Outstanding Balance (Final Payment)...")
        final_balance = round(final_amount - advance_amount, 2)
        final_payment_payload = {
            "order_id": order_id,
            "amount": final_balance,
            "payment_method": "UPI",
            "payment_type": "FINAL",
            "reference_number": f"UPI-{suffix.upper()}-FINAL-PAY",
            "remarks": "Final balance cleared upon verified customer handover.",
        }
        res = self.client.post(f"{BASE_URL}/payments", json=final_payment_payload, headers=self.admin_headers)
        assert res.status_code == 201, f"Phase 17 failed: {res.text}"
        final_pay_res = res.json()["data"]
        print(f"  [PASS] Final payment recorded: {final_pay_res['payment_number']}, Amount: ₹{float(final_pay_res['amount']):,.2f}")

        # =========================================================================
        # PHASE 18: Project Closure & Warranty Verification
        # =========================================================================
        print("\n--> [Phase 18/18] Closing Project & Verifying Warranty Certificates...")
        complete_payload = {
            "power_generated_watts": 3120.0,
            "testing_results": "Voc: 428V, Isc: 9.8A, AC Voltage: 238V @ 50.0Hz. Inverter synchronization verified, generation stable at 3120W.",
            "remarks": "System fully commissioned, energized, and handed over to customer.",
        }
        res = self.client.post(f"{BASE_URL}/installations/{installation_id}/complete", json=complete_payload, headers=self.tech_headers)
        assert res.status_code == 200, f"Phase 18 (complete) failed: {res.text}"
        completed_job = res.json()["data"]
        assert completed_job["installation_status"] == "COMPLETED"

        # Verify active warranties for this customer
        cust_warranties_res = self.client.get(f"{BASE_URL}/warranties/customer/{customer_id}", headers=self.admin_headers)
        assert cust_warranties_res.status_code == 200, f"Phase 18 (warranties) failed: {cust_warranties_res.text}"
        warranties = cust_warranties_res.json()["data"]
        assert len(warranties) > 0, f"Expected active warranties for customer {customer_id}, found none"

        print(f"  [PASS] Installation Job COMPLETED: {completed_job['job_number']}")
        print(f"  [PASS] Verified {len(warranties)} active warranty certificate(s) issued for customer {customer_id}:")
        for w in warranties:
            print(f"    - Certificate: {w['warranty_certificate_number']}, Status: {w['warranty_status']}, Expiry: {w['warranty_expiry_date']}")

        print("\n" + "=" * 80)
        print("ALL 18 PHASES OF CUSTOMER-TO-INSTALLATION LIFECYCLE COMPLETED SUCCESSFULLY!")
        print("=" * 80)
