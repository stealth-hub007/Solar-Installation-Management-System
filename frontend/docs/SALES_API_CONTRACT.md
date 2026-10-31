# SIMS Sales Dashboard — FastAPI Backend API Contract

**Service Version**: `v1`  
**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)  
**Security Boundary**: Role-Based Access Control (`sales_rep`, `sales_manager`, `admin`)

---

## 1. Authentication & Security Headers

All requests to `/api/v1/sales/*` must include the standard HTTP Authorization header:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

### Authorization Roles:
- `sales_rep`: Can create and read assigned customers, enquiries, follow-ups, schedule surveys, create quotations, view orders.
- `sales_manager`: Can reassign leads, approve quotations, view team-wide analytics and sales pipeline.
- `admin`: Full system oversight.

### Standard Error Response Format:
```json
{
  "status_code": 422,
  "detail": [
    {
      "loc": ["body", "customer_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 2. Sales Dashboard Overview Endpoints

### 2.1 Get Sales KPIs & Metrics
- **Endpoint**: `GET /api/v1/sales/stats`
- **Query Parameters**:
  - `period`: `string` (`this_month`, `last_month`, `this_quarter`, `this_year`)
- **Response**: `200 OK`
```json
{
  "totalCustomers": 128,
  "totalEnquiries": 342,
  "newLeads": 48,
  "convertedEnquiries": 86,
  "conversionRate": 25.1,
  "pendingFollowUps": 14,
  "upcomingSurveys": 9,
  "pendingQuotations": 19,
  "acceptedQuotations": 24,
  "totalOrders": 38,
  "monthlySalesRevenue": 4850000,
  "monthlyTarget": 6000000,
  "targetAchievementPercent": 80.8
}
```

### 2.2 Get Sales Analytics (Revenue & Conversions)
- **Endpoint**: `GET /api/v1/sales/analytics`
- **Query Parameters**:
  - `range`: `string` (`7d`, `30d`, `90d`, `1y`)
- **Response**: `200 OK`
```json
{
  "revenueTrend": [
    { "month": "May", "revenue": 2800000, "target": 3000000, "orders": 12 },
    { "month": "Jun", "revenue": 3400000, "target": 3500000, "orders": 15 },
    { "month": "Jul", "revenue": 4100000, "target": 4000000, "orders": 18 },
    { "month": "Aug", "revenue": 3900000, "target": 4500000, "orders": 16 },
    { "month": "Sep", "revenue": 4600000, "target": 5000000, "orders": 21 },
    { "month": "Oct", "revenue": 4850000, "target": 6000000, "orders": 24 }
  ]
}
```

### 2.3 Get Enquiry Sources Distribution
- **Endpoint**: `GET /api/v1/sales/sources`
- **Response**: `200 OK`
```json
[
  { "source": "Website Direct", "count": 118, "percentage": 34.5 },
  { "source": "Referrals", "count": 92, "percentage": 26.9 },
  { "source": "Social Media", "count": 64, "percentage": 18.7 },
  { "source": "Direct Walk-in / Call", "count": 48, "percentage": 14.0 },
  { "source": "Campaigns & Expos", "count": 20, "percentage": 5.9 }
]
```

### 2.4 Get Sales Pipeline Funnel
- **Endpoint**: `GET /api/v1/sales/pipeline`
- **Response**: `200 OK`
```json
[
  { "stage": "New Leads", "count": 48, "value": 7200000 },
  { "stage": "Contacted", "count": 62, "value": 9300000 },
  { "stage": "Survey Scheduled", "count": 28, "value": 4500000 },
  { "stage": "Quotation Sent", "count": 35, "value": 5800000 },
  { "stage": "Negotiation", "count": 22, "value": 3600000 },
  { "stage": "Converted (Order)", "count": 38, "value": 6200000 }
]
```

---

## 3. Customer Management Endpoints

### 3.1 List Customers
- **Endpoint**: `GET /api/v1/sales/customers`
- **Query Parameters**:
  - `page`: `integer` (default: `1`)
  - `page_size`: `integer` (default: `10`, options: `10, 20, 50`)
  - `search`: `string` (name, phone, email, city)
  - `type`: `string` (`all`, `Residential`, `Commercial`, `Industrial`)
  - `status`: `string` (`all`, `Active`, `Prospect`, `Inactive`)
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "CUST-1001",
      "name": "Rajesh Kumar Sharma",
      "phone": "+91 98290 12345",
      "email": "rajesh.sharma@example.com",
      "city": "Jaipur",
      "state": "Rajasthan",
      "address": "Plot 42, Malviya Nagar",
      "pincode": "302017",
      "type": "Residential",
      "assignedTo": "Vikram Singh (Sales)",
      "status": "Active",
      "totalCapacity": 8.5,
      "createdDate": "2026-09-15T10:30:00Z"
    }
  ],
  "total": 128,
  "page": 1,
  "pageSize": 10,
  "totalPages": 13
}
```

### 3.2 Create Customer
- **Endpoint**: `POST /api/v1/sales/customers`
- **Request Body**:
```json
{
  "name": "Ramesh Chandra",
  "phone": "+91 98765 43210",
  "email": "ramesh.chandra@gmail.com",
  "address": "B-12 Jagatpura",
  "city": "Jaipur",
  "state": "Rajasthan",
  "pincode": "302025",
  "type": "Residential",
  "notes": "Interested in rooftop subsidy scheme PM Surya Ghar"
}
```
- **Response**: `201 Created`

### 3.3 Update Customer
- **Endpoint**: `PUT /api/v1/sales/customers/{id}`
- **Response**: `200 OK`

---

## 4. Enquiry Management Endpoints

### 4.1 List Enquiries
- **Endpoint**: `GET /api/v1/sales/enquiries`
- **Query Parameters**:
  - `page`: `integer` (default: `1`)
  - `page_size`: `integer` (default: `10`)
  - `search`: `string`
  - `status`: `string` (`all`, `New`, `Contacted`, `Follow-up Required`, `Survey Scheduled`, `Quotation Sent`, `Converted`, `Lost`)
  - `source`: `string`
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "ENQ-4401",
      "customerId": "CUST-1001",
      "customerName": "Rajesh Kumar Sharma",
      "phone": "+91 98290 12345",
      "email": "rajesh.sharma@example.com",
      "source": "Website",
      "capacity": 10.0,
      "propertyType": "Residential",
      "location": "Jaipur, Rajasthan",
      "assignedSalesperson": "Vikram Singh",
      "enquiryDate": "2026-10-25T11:00:00Z",
      "nextFollowUp": "2026-11-02T10:00:00Z",
      "status": "Quotation Sent",
      "notes": "3-phase meter available. Client requested subsidy estimate."
    }
  ],
  "total": 342,
  "page": 1,
  "pageSize": 10,
  "totalPages": 35
}
```

### 4.2 Create Enquiry
- **Endpoint**: `POST /api/v1/sales/enquiries`
- **Request Body**:
```json
{
  "customerId": "CUST-1001",
  "customerName": "Rajesh Kumar Sharma",
  "phone": "+91 98290 12345",
  "email": "rajesh.sharma@example.com",
  "source": "Website",
  "capacity": 10.0,
  "propertyType": "Residential",
  "location": "Jaipur, Rajasthan",
  "monthlyBill": 8500,
  "notes": "Wants quotation within 24 hours"
}
```

---

## 5. Follow-Up Management Endpoints

### 5.1 List Follow-ups
- **Endpoint**: `GET /api/v1/sales/follow-ups`
- **Query Parameters**:
  - `status`: `string` (`all`, `Pending`, `Completed`, `Overdue`, `Rescheduled`)
  - `filter`: `string` (`all`, `today`, `upcoming`, `overdue`)
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "FOL-301",
      "enquiryId": "ENQ-4401",
      "customerId": "CUST-1001",
      "customerName": "Rajesh Kumar Sharma",
      "contact": "+91 98290 12345",
      "followUpDate": "2026-11-01T11:30:00Z",
      "type": "Phone Call",
      "purpose": "Quotation discussion and DISCOM subsidy explanation",
      "priority": "High",
      "status": "Pending",
      "notes": "Client requested comparative quotes for Mono PERC vs TOPCon."
    }
  ],
  "total": 14
}
```

### 5.2 Create / Schedule Follow-up
- **Endpoint**: `POST /api/v1/sales/follow-ups`
- **Request Body**:
```json
{
  "enquiryId": "ENQ-4401",
  "customerId": "CUST-1001",
  "customerName": "Rajesh Kumar Sharma",
  "contact": "+91 98290 12345",
  "followUpDate": "2026-11-02",
  "followUpTime": "14:30",
  "type": "WhatsApp",
  "purpose": "Send system layout diagram",
  "priority": "Medium",
  "notes": "Follow up after engineer shares CAD drawing"
}
```

### 5.3 Complete / Update Follow-up
- **Endpoint**: `PATCH /api/v1/sales/follow-ups/{id}/complete`
- **Request Body**:
```json
{
  "status": "Completed",
  "outcomeNotes": "Customer agreed to site survey on Nov 4th. Scheduling now."
}
```

---

## 6. Site Survey Scheduling Endpoints

### 6.1 List Surveys
- **Endpoint**: `GET /api/v1/sales/surveys`
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "SRV-201",
      "enquiryId": "ENQ-4401",
      "customerId": "CUST-1001",
      "customerName": "Rajesh Kumar Sharma",
      "siteLocation": "Plot 42, Malviya Nagar, Jaipur",
      "scheduledDate": "2026-11-04",
      "scheduledTime": "11:00 AM",
      "assignedSurveyor": "Kailash Chand (Field Tech)",
      "status": "Scheduled",
      "roofType": "RCC Flat Roof",
      "notes": "Verify shadow cast from adjacent water tank"
    }
  ],
  "total": 9
}
```

### 6.2 Schedule Survey
- **Endpoint**: `POST /api/v1/sales/surveys`
- **Request Body**:
```json
{
  "enquiryId": "ENQ-4401",
  "customerId": "CUST-1001",
  "customerName": "Rajesh Kumar Sharma",
  "siteLocation": "Plot 42, Malviya Nagar, Jaipur",
  "scheduledDate": "2026-11-04",
  "scheduledTime": "11:00 AM",
  "assignedSurveyor": "Kailash Chand",
  "roofType": "RCC Flat Roof",
  "notes": "Customer requested morning slot"
}
```

---

## 7. Quotation Management Endpoints

### 7.1 List Quotations
- **Endpoint**: `GET /api/v1/sales/quotations`
- **Query Parameters**:
  - `status`: `string` (`all`, `Draft`, `Submitted`, `Approved`, `Sent`, `Accepted`, `Rejected`)
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "QUO-701",
      "enquiryId": "ENQ-4401",
      "customerId": "CUST-1001",
      "customerName": "Rajesh Kumar Sharma",
      "systemCapacity": 10.0,
      "items": [
        { "name": "Adani 540W Mono PERC Panels (20 Nos)", "quantity": 20, "unitPrice": 12500, "lineTotal": 250000 },
        { "name": "Growatt 10kW On-Grid 3-Phase Inverter", "quantity": 1, "unitPrice": 85000, "lineTotal": 85000 },
        { "name": "Aluminium HD Mounting Structure", "quantity": 1, "unitPrice": 42000, "lineTotal": 42000 },
        { "name": "BOS & AC/DC Protection Boxes, Earthing", "quantity": 1, "unitPrice": 38000, "lineTotal": 38000 },
        { "name": "Turnkey Installation, Testing & DISCOM Net-Metering", "quantity": 1, "unitPrice": 45000, "lineTotal": 45000 }
      ],
      "subtotal": 460000,
      "subsidy": 78000,
      "discount": 10000,
      "taxRate": 13.8,
      "taxAmount": 52000,
      "finalAmount": 424000,
      "createdDate": "2026-10-28T14:00:00Z",
      "expiryDate": "2026-11-28T23:59:59Z",
      "approvalStatus": "Approved",
      "status": "Sent"
    }
  ],
  "total": 19
}
```

### 7.2 Create Quotation
- **Endpoint**: `POST /api/v1/sales/quotations`
- **Request Body**:
```json
{
  "customerId": "CUST-1001",
  "customerName": "Rajesh Kumar Sharma",
  "enquiryId": "ENQ-4401",
  "systemCapacity": 10.0,
  "items": [...],
  "subtotal": 460000,
  "subsidy": 78000,
  "discount": 10000,
  "taxAmount": 52000,
  "finalAmount": 424000,
  "status": "Draft"
}
```

### 7.3 Submit for Approval / Mark Accepted
- **Endpoint**: `PATCH /api/v1/sales/quotations/{id}/status`
- **Request Body**:
```json
{
  "status": "Accepted",
  "convertToOrder": true
}
```

---

## 8. Orders Management Endpoints

### 8.1 List Orders
- **Endpoint**: `GET /api/v1/sales/orders`
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "ORD-901",
      "quotationId": "QUO-701",
      "customerId": "CUST-1001",
      "customerName": "Rajesh Kumar Sharma",
      "capacity": "10.0 kW",
      "orderAmount": 424000,
      "orderDate": "2026-10-30T16:20:00Z",
      "paymentStatus": "Advance Paid (30%)",
      "orderStatus": "Processing",
      "milestones": [
        { "step": "Contract Signed", "status": "Completed" },
        { "step": "DISCOM Sanction Letter", "status": "In Progress" },
        { "step": "Warehouse Allocation", "status": "Pending" },
        { "step": "Site Installation", "status": "Pending" },
        { "step": "Net Meter Testing", "status": "Pending" }
      ]
    }
  ],
  "total": 38
}
```

