from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Body, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.sales_service import SalesService

router = APIRouter(tags=["Sales Operations"])


# ==============================================================================
# 1. SALES OVERVIEW & METRICS
# ==============================================================================

@router.get("/stats", summary="Get Sales KPIs and Metrics")
async def get_sales_stats(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_sales_stats(db)


@router.get("/analytics", summary="Get Sales Analytics & Revenue Trend")
async def get_sales_analytics(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_sales_analytics(db)


@router.get("/sources", summary="Get Enquiry Lead Sources")
async def get_sales_sources(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_sales_sources(db)


@router.get("/pipeline", summary="Get Sales Pipeline Funnel")
async def get_sales_pipeline(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_sales_pipeline(db)


@router.get("/activities", summary="Get Recent Sales Activities")
async def get_sales_activities(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_sales_activities(db)


# ==============================================================================
# 2. CUSTOMERS
# ==============================================================================

@router.get("/customers", summary="List Sales Customers")
async def list_sales_customers(
    search: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.get_customers(db, search=search, status=status, type=type)


@router.get("/customers/{customer_id}", summary="Get Customer by ID")
async def get_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
):
    cust = await SalesService.get_customer_by_id(db, customer_id)
    return cust or {}


@router.post("/customers", summary="Create Customer")
async def create_customer(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.create_customer(db, data)


@router.put("/customers/{customer_id}", summary="Update Customer")
async def update_customer(
    customer_id: str,
    patch: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.update_customer(db, customer_id, patch)


@router.delete("/customers/{customer_id}", summary="Delete Customer")
async def delete_customer(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.delete_customer(db, customer_id)


# ==============================================================================
# 3. ENQUIRIES
# ==============================================================================

@router.get("/enquiries", summary="List Sales Enquiries")
async def list_sales_enquiries(
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.get_enquiries(db, search=search, status=status)


@router.get("/enquiries/{enquiry_id}", summary="Get Enquiry by ID")
async def get_enquiry(
    enquiry_id: str,
    db: AsyncSession = Depends(get_db),
):
    enq = await SalesService.get_enquiry_by_id(db, enquiry_id)
    return enq or {}


@router.post("/enquiries", summary="Create Lead Enquiry")
async def create_enquiry(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.create_enquiry(db, data)


@router.put("/enquiries/{enquiry_id}", summary="Update Lead Enquiry")
async def update_enquiry(
    enquiry_id: str,
    patch: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.update_enquiry(db, enquiry_id, patch)


@router.patch("/enquiries/{enquiry_id}/status", summary="Update Enquiry Stage")
async def update_enquiry_status(
    enquiry_id: str,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.update_enquiry_status(db, enquiry_id, body.get("status", "Contacted"))


@router.delete("/enquiries/{enquiry_id}", summary="Delete Lead Enquiry")
async def delete_enquiry(
    enquiry_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.delete_enquiry(db, enquiry_id)


# ==============================================================================
# 4. FOLLOW-UPS
# ==============================================================================

@router.get("/follow-ups", summary="List Follow-ups")
async def list_follow_ups(
    status: Optional[str] = None,
    filter: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.get_follow_ups(db, status=status, filter_type=filter)


@router.post("/follow-ups", summary="Schedule Follow-up")
async def create_follow_up(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.create_follow_up(db, data)


@router.patch("/follow-ups/{followup_id}/complete", summary="Mark Follow-up as Completed")
async def complete_follow_up(
    followup_id: str,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.complete_follow_up(db, followup_id, body.get("outcomeNotes"))


@router.patch("/follow-ups/{followup_id}/reschedule", summary="Reschedule Follow-up")
async def reschedule_follow_up(
    followup_id: str,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.reschedule_follow_up(
        db,
        followup_id,
        body.get("followUpDate", ""),
        body.get("followUpTime", ""),
        body.get("notes"),
    )


@router.delete("/follow-ups/{followup_id}", summary="Delete Follow-up")
async def delete_follow_up(
    followup_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.delete_follow_up(db, followup_id)


# ==============================================================================
# 5. QUOTATIONS
# ==============================================================================

@router.get("/quotations", summary="List Quotations")
async def list_quotations(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.get_quotations(db, status=status)


@router.get("/quotations/{quotation_id}", summary="Get Quotation Details")
async def get_quotation(
    quotation_id: str,
    db: AsyncSession = Depends(get_db),
):
    quo = await SalesService.get_quotation_by_id(db, quotation_id)
    return quo or {}


@router.post("/quotations", summary="Create Quotation")
async def create_quotation(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.create_quotation(db, data)


@router.put("/quotations/{quotation_id}", summary="Update Quotation")
async def update_quotation(
    quotation_id: str,
    patch: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.update_quotation(db, quotation_id, patch)


@router.post("/quotations/{quotation_id}/submit", summary="Submit Quotation for Review")
async def submit_quotation(
    quotation_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.submit_quotation(db, quotation_id)


@router.post("/quotations/{quotation_id}/approve", summary="Approve Quotation")
async def approve_quotation(
    quotation_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.approve_quotation(db, quotation_id)


@router.post("/quotations/{quotation_id}/accept", summary="Accept Quotation & Convert to Order")
async def accept_quotation(
    quotation_id: str,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.accept_quotation(
        db, quotation_id, convert_to_order=body.get("convertToOrder", True)
    )


@router.delete("/quotations/{quotation_id}", summary="Delete Quotation")
async def delete_quotation(
    quotation_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.delete_quotation(db, quotation_id)


# ==============================================================================
# 6. ORDERS
# ==============================================================================

@router.get("/orders", summary="List Sales Orders")
async def list_orders(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_orders(db)


@router.get("/orders/{order_id}", summary="Get Order Details")
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
):
    ord = await SalesService.get_order_by_id(db, order_id)
    return ord or {}


@router.post("/orders", summary="Create Sales Order")
async def create_order(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.create_order(db, data)


@router.patch("/orders/{order_id}/status", summary="Update Order Stage")
async def update_order_status(
    order_id: str,
    body: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.update_order_status(db, order_id, body.get("status", "Processing"))


# ==============================================================================
# 7. SURVEYS
# ==============================================================================

@router.get("/surveys", summary="List Site Surveys")
async def list_surveys(db: AsyncSession = Depends(get_db)):
    return await SalesService.get_surveys(db)


@router.get("/surveys/{survey_id}", summary="Get Survey by ID")
async def get_survey(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
):
    srv = await SalesService.get_survey_by_id(db, survey_id)
    return srv or {}


@router.post("/surveys", summary="Schedule Site Survey")
async def schedule_survey(
    data: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.schedule_survey(db, data)


@router.put("/surveys/{survey_id}", summary="Update Survey Details")
async def update_survey(
    survey_id: str,
    patch: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.update_survey(db, survey_id, patch)


@router.delete("/surveys/{survey_id}", summary="Delete Survey")
async def delete_survey(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
):
    return await SalesService.delete_survey(db, survey_id)
