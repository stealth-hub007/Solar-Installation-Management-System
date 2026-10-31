# SIMS Technician Dashboard – API Integration Contract

This document specifies the technical API integration contract between the **Technician Dashboard** frontend module and the **FastAPI + PostgreSQL** backend services for the Solar Installation Management System (SIMS).

---

## 1. Authentication & Role Permissions

- **Base URL**: `/api/v1`
- **Header**: `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Authorized Roles**:
  - `TECHNICIAN`: Permitted on self-assigned surveys, installation jobs, checklist updates, work logs, photograph uploads, and customer sign-off.
  - `ADMIN`: Full administrative read/write/review across all field assignments.
  - `SALES`: Read-only access to approved surveys and project progress; forbidden from modifying field measurements or serial validations.

---

## 2. API Endpoints Specification

### A. Field Workload & Dashboard Metrics
- **Endpoint**: `GET /api/v1/dashboard/technician`
- **Description**: Returns authenticated technician's active workload summary.
- **Response**:
```json
{
  "success": true,
  "message": "Technician metrics loaded successfully",
  "data": {
    "assigned_surveys_count": 4,
    "pending_surveys_count": 3,
    "assigned_installations_count": 5,
    "completed_installations_count": 1,
    "total_work_hours_logged": 34.50,
    "assigned_service_tickets_count": 1
  }
}
```

---

### B. Site Surveys Management

#### 1. List Assigned Surveys
- **Endpoint**: `GET /api/v1/surveys`
- **Query Parameters**:
  - `page`: integer (default: 1)
  - `size`: integer (default: 20)
  - `survey_status`: `SCHEDULED` | `IN_PROGRESS` | `SUBMITTED` | `COMPLETED` | `CANCELLED`
  - `approval_status`: `PENDING_APPROVAL` | `APPROVED` | `REJECTED`
- **Response**:
```json
{
  "success": true,
  "message": "Site surveys retrieved successfully",
  "data": {
    "items": [
      {
        "id": "SRV-101",
        "customerName": "Sunita Agarwal",
        "siteAddress": "34 Civil Lines, Jaipur, Rajasthan",
        "proposedCapacity": "8.0 kW",
        "scheduledDate": "2026-11-02",
        "survey_status": "SCHEDULED",
        "approval_status": "PENDING_APPROVAL"
      }
    ],
    "total": 4,
    "page": 1,
    "size": 20
  }
}
```

#### 2. Get Survey Details
- **Endpoint**: `GET /api/v1/surveys/{survey_id}`
- **Response**: Returns complete technical measurements, azimuth, photos, and remarks.

#### 3. Update Technical Measurements
- **Endpoint**: `PUT /api/v1/surveys/{survey_id}/measurements`
- **Payload**:
```json
{
  "roof_area_sqft": 850.00,
  "shadow_free_area_sqft": 750.00,
  "roof_orientation": "SOUTH",
  "roof_tilt_degrees": 15.0,
  "monthly_bill": 8500.00,
  "grid_connection_suitable": true,
  "cable_distance_meters": 18.00,
  "technician_remarks": "Optimal south-facing shadow-free area on main terrace."
}
```

#### 4. Upload Site Photograph
- **Endpoint**: `POST /api/v1/surveys/{survey_id}/photos`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: Binary image file (`.jpg`, `.jpeg`, `.png`, `.webp`)
  - `caption`: string (e.g., `"Roof terrace parapet overview"`)

#### 5. Submit Survey for Review
- **Endpoint**: `POST /api/v1/surveys/{survey_id}/submit`
- **Behavior**: Transitions `survey_status` to `SUBMITTED`. Quotation generation in Sales is unlocked once Admin reviews and marks `APPROVED`.

---

### C. Installation Jobs & Checklists

#### 1. List Assigned Installations
- **Endpoint**: `GET /api/v1/installations`
- **Query Parameters**: `status` (`SCHEDULED` | `IN_PROGRESS` | `TESTING` | `COMPLETED`)

#### 2. Start Installation Job
- **Endpoint**: `POST /api/v1/installations/{installation_id}/start`
- **Behavior**: Sets `start_time` and transitions status to `IN_PROGRESS`.

#### 3. Update 9-Point Mandatory Checklist
- **Endpoint**: `PUT /api/v1/installations/{installation_id}/checklist`
- **Payload**:
```json
{
  "mounting_stands_installed": true,
  "solar_panels_installed": true,
  "inverter_installed": true,
  "battery_installed": false,
  "wiring_completed": true,
  "safety_equipment_installed": true,
  "earthing_completed": true,
  "system_tested": true,
  "power_generation_verified": true
}
```

#### 4. Record Technician Labor Hours
- **Endpoint**: `POST /api/v1/installations/{installation_id}/work-logs`
- **Payload**:
```json
{
  "start_time": "2026-10-31T09:00:00Z",
  "end_time": "2026-10-31T14:30:00Z",
  "notes": "DC string wiring and earthing pit chemical compound filling."
}
```

#### 5. Customer Digital Sign-Off
- **Endpoint**: `POST /api/v1/installations/{installation_id}/signoff`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `customer_name`: string
  - `feedback_rating`: integer (1 to 5)
  - `feedback_remarks`: string
  - `signature_file`: Binary PNG image drawn on touch/mouse canvas

#### 6. Complete Installation Job
- **Endpoint**: `POST /api/v1/installations/{installation_id}/complete`
- **Validation**: Backend enforces that `checklist.is_fully_completed()` is `true` and customer sign-off signature is present.
- **Payload**:
```json
{
  "power_generated_watts": 9800.00,
  "testing_results": "Voc = 485V, Isc = 11.2A, Net meter synchronized.",
  "remarks": "Commissioned without defects."
}
```

---

### D. Equipment Serial Number Verification
- **Endpoint**: `GET /api/v1/serials/{serial_number}`
- **Description**: Verifies physical serial numbers scanned on panels and inverters against warehouse delivery challan inventory.
