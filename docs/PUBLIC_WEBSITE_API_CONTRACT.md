# Public Website API Contract

## Endpoint: Submit Public Solar Installation Enquiry

### Request

- **Method**: `POST`
- **Path**: `/api/v1/enquiries/public`
- **Authentication**: None (Public endpoint)
- **Headers**:
  ```http
  Content-Type: application/json
  ```

### JSON Request Body Schema

```json
{
  "full_name": "string (min 2, max 150, required)",
  "phone": "string (min 8, max 20, required, 10-digit mobile)",
  "email": "string (valid email address, required)",
  "city": "string (min 2, max 100, required)",
  "property_type": "string (Residential | Commercial | Industrial | Other, required)",
  "interested_service": "string (required, e.g. Residential Solar Installation)",
  "property_address": "string (optional street/colony address)",
  "required_solar_capacity": "string (optional, e.g. 1kW, 2kW, 3kW, 5kW, 10kW+, Not sure)",
  "message": "string (min 5, max 2000, required)",
  "consent": "boolean (required, must be true)",
  "honeypot": "string (optional bot trap, must be null/empty for valid humans)"
}
```

### Success Response (HTTP 201 Created)

```json
{
  "success": true,
  "message": "Thank you! Your installation request has been submitted successfully. Our Sales team has received your request and will contact you as soon as possible.",
  "data": {
    "enquiry_id": "a3b302f9-c21e-48cf-b34b-4fef7c923a02",
    "customer_name": "Ananya Verma",
    "status": "NEW",
    "source": "WEBSITE_FORM"
  }
}
```

### Validation Error Response (HTTP 422 Unprocessable Entity)

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    }
  ]
}
```

