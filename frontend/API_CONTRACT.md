# Solar Installation Management System (SIMS)
## Backend API Contract Specification (FastAPI / SQLAlchemy / PostgreSQL)

This document defines the complete RESTful API contract required by the SIMS Frontend Admin Dashboard.
All responses follow standardized JSON structures, including HTTP status codes, error details, and pagination metadata.

---

### Global Conventions

- **Base URL Prefix:** `/api/v1` (or `/api`)
- **Default Content-Type:** `application/json`
- **Authentication:** Bearer Token via HTTP Header `Authorization: Bearer <JWT_TOKEN>` (ready for auth module)
- **Standard Date Format:** ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`)
- **Currency:** Values formatted in Indian Rupee (INR) numbers (e.g. `2450000.00`)

---

### Standard Paginated Response Structure

All paginated list endpoints return this exact schema:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalRecords": 154,
    "totalPages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Standard Error Response Structure (FastAPI default compliant)

```json
{
  "success": false,
  "detail": "Descriptive error message explaining the failure",
  "errorCode": "INVALID_PARAMETERS",
  "errors": [
    {
      "field": "timeRange",
      "message": "Must be one of: 7d, 30d, 90d, 1y"
    }
  ]
}
```

---

## 1. Dashboard KPI Metrics Endpoint

### `GET /api/dashboard/stats`
Fetches high-level executive KPIs.

- **Query Parameters:**
  - `timeRange` (optional, string, default: `30d`): `7d` | `30d` | `90d` | `1y`

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": {
      "value": 48500000,
      "changePercentage": 14.2,
      "trend": "up",
      "comparisonPeriod": "vs last month"
    },
    "paymentsReceived": {
      "value": 36200000,
      "changePercentage": 8.5,
      "trend": "up",
      "comparisonPeriod": "vs last month"
    },
    "outstandingPayments": {
      "value": 12300000,
      "changePercentage": -4.1,
      "trend": "down",
      "comparisonPeriod": "vs last month"
    },
    "totalCustomers": {
      "value": 1284,
      "changePercentage": 18.0,
      "trend": "up",
      "comparisonPeriod": "vs last month"
    },
    "totalEnquiries": {
      "value": 438,
      "changePercentage": 22.4,
      "trend": "up",
      "comparisonPeriod": "vs last month"
    },
    "activeProjects": {
      "value": 76,
      "changePercentage": 5.2,
      "trend": "up",
      "comparisonPeriod": "vs last month"
    },
    "pendingSurveys": {
      "value": 19,
      "changePercentage": -12.5,
      "trend": "down",
      "comparisonPeriod": "vs last week"
    },
    "openServiceTickets": {
      "value": 11,
      "changePercentage": 0.0,
      "trend": "neutral",
      "comparisonPeriod": "vs last week"
    },
    "lowStockAlerts": {
      "value": 4,
      "changePercentage": 33.3,
      "trend": "up",
      "comparisonPeriod": "critical stock items"
    }
  }
}
```

---

## 2. Analytics Charts Endpoints

### A. `GET /api/dashboard/analytics/revenue`
- **Query Parameters:**
  - `period` (optional, string, default: `12m`): `6m` | `12m` | `ytd`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "month": "Jan", "revenue": 3200000, "received": 2800000, "outstanding": 400000 },
    { "month": "Feb", "revenue": 3800000, "received": 3100000, "outstanding": 700000 },
    { "month": "Mar", "revenue": 4200000, "received": 3500000, "outstanding": 700000 },
    { "month": "Apr", "revenue": 4900000, "received": 4100000, "outstanding": 800000 },
    { "month": "May", "revenue": 5400000, "received": 4600000, "outstanding": 800000 },
    { "month": "Jun", "revenue": 6100000, "received": 5200000, "outstanding": 900000 },
    { "month": "Jul", "revenue": 5800000, "received": 4900000, "outstanding": 900000 },
    { "month": "Aug", "revenue": 6700000, "received": 5800000, "outstanding": 900000 },
    { "month": "Sep", "revenue": 7200000, "received": 6100000, "outstanding": 1100000 },
    { "month": "Oct", "revenue": 8100000, "received": 6800000, "outstanding": 1300000 }
  ]
}
```

### B. `GET /api/dashboard/analytics/project-status`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "status": "Enquiry", "count": 28, "color": "#38BDF8" },
    { "status": "Survey Pending", "count": 19, "color": "#F59E0B" },
    { "status": "Quotation Pending", "count": 14, "color": "#FB923C" },
    { "status": "Approved", "count": 22, "color": "#10B981" },
    { "status": "In Progress", "count": 35, "color": "#F5B942" },
    { "status": "Completed", "count": 84, "color": "#123C32" },
    { "status": "Cancelled", "count": 6, "color": "#EF4444" }
  ]
}
```

### C. `GET /api/dashboard/analytics/installations`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "week": "W1", "scheduled": 16, "completed": 14, "pending": 2, "delayed": 0 },
    { "week": "W2", "scheduled": 22, "completed": 19, "pending": 2, "delayed": 1 },
    { "week": "W3", "scheduled": 20, "completed": 17, "pending": 1, "delayed": 2 },
    { "week": "W4", "scheduled": 25, "completed": 21, "pending": 3, "delayed": 1 }
  ]
}
```

### D. `GET /api/dashboard/analytics/inventory`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "category": "Solar Panels (kW)", "available": 420, "lowStockThreshold": 80, "outOfStock": 0, "reserved": 140 },
    { "category": "Inverters (Units)", "available": 65, "lowStockThreshold": 15, "outOfStock": 2, "reserved": 25 },
    { "category": "Batteries (kWh)", "available": 180, "lowStockThreshold": 40, "outOfStock": 0, "reserved": 50 },
    { "category": "Mounting Struct (Sets)", "available": 92, "lowStockThreshold": 20, "outOfStock": 0, "reserved": 35 },
    { "category": "Solar Cables (Meters)", "available": 8500, "lowStockThreshold": 1500, "outOfStock": 0, "reserved": 2200 }
  ]
}
```

---

## 3. Operational Alerts Endpoint

### `GET /api/dashboard/alerts`
- **Query Parameters:**
  - `severity` (optional, string): `critical` | `warning` | `info`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ALT-101",
      "title": "Low Inventory: 10kW Hybrid Inverters",
      "description": "Stock count dropped to 2 units (Threshold: 5 units).",
      "severity": "critical",
      "module": "Inventory",
      "timestamp": "2026-10-31T07:15:00Z",
      "actionRoute": "/admin/inventory"
    },
    {
      "id": "ALT-102",
      "title": "Delayed Installation: Project SIMS-PRJ-1044",
      "description": "Installation in Jaipur delayed by 48 hours due to unseasonal rain.",
      "severity": "warning",
      "module": "Installations",
      "timestamp": "2026-10-31T05:30:00Z",
      "actionRoute": "/admin/installations"
    },
    {
      "id": "ALT-103",
      "title": "3 Site Surveys Awaiting Lead Approval",
      "description": "Surveys in Jodhpur region submitted over 24 hours ago.",
      "severity": "warning",
      "module": "Surveys",
      "timestamp": "2026-10-30T16:00:00Z",
      "actionRoute": "/admin/surveys"
    },
    {
      "id": "ALT-104",
      "title": "Payment Milestone Overdue",
      "description": "₹1,20,000 pending for Project SIMS-PRJ-1029.",
      "severity": "critical",
      "module": "Payments",
      "timestamp": "2026-10-30T11:20:00Z",
      "actionRoute": "/admin/payments"
    }
  ]
}
```

---

## 4. Paginated Data Table Endpoints

### A. `GET /api/dashboard/recent-projects`
- **Query Parameters:**
  - `page` (default: 1): integer
  - `pageSize` (default: 10): integer (`10`, `20`, `50`)
  - `search` (optional): string
  - `status` (optional): string
  - `sortBy` (optional): string (`createdDate`, `capacity`, etc.)
  - `sortDirection` (optional): `asc` | `desc`

### B. `GET /api/dashboard/recent-payments`
- **Query Parameters:** `page`, `pageSize`, `search`, `status`, `sortBy`, `sortDirection`

### C. `GET /api/dashboard/recent-enquiries`
- **Query Parameters:** `page`, `pageSize`, `search`, `status`, `sortBy`, `sortDirection`

### D. `GET /api/dashboard/recent-service-tickets`
- **Query Parameters:** `page`, `pageSize`, `search`, `priority`, `status`, `sortBy`, `sortDirection`

### E. `GET /api/dashboard/recent-activity`
- **Query Parameters:** `page`, `pageSize`, `search`, `module`, `sortBy`, `sortDirection`

