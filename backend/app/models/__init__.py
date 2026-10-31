"""ORM Models Package exposing all domain entities for SQLAlchemy and Alembic."""
from app.core.database import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.user import User, PasswordResetOTP, UserRole
from app.models.customer import Customer, CustomerAddress, Enquiry, EnquiryFollowup, EnquirySource, SystemCapacity, SystemType, LeadStatus
from app.models.survey import SiteSurvey, SurveyPhoto, SurveyStatus, SurveyApprovalStatus, RoofOrientation
from app.models.product import ProductCategory, Product, Package, PackageItem, WarrantyUnit
from app.models.quotation import Quotation, QuotationItem, QuotationRevision, QuotationStatus
from app.models.order import Order, OrderItem, Payment, Invoice, OrderStatus, PaymentStatus, PaymentMethod, PaymentType, PaymentRecordStatus
from app.models.inventory import Inventory, StockMovement, StockReservation, ProductSerial, MovementType, ReservationStatus, SerialStatus
from app.models.dispatch import Dispatch, DispatchItem, DeliveryConfirmation, DispatchStatus
from app.models.warranty import Warranty, WarrantyStatus
from app.models.installation import InstallationJob, InstallationChecklist, InstallationPhoto, TechnicianWorkLog, InstallationSignoff, InstallationStatus
from app.models.service_ticket import ServiceTicket, ServiceAction, TicketStatus, ActionType
from app.models.finance import ProjectExpense, SubsidyRecord, ExpenseCategory, SubsidyStatus
from app.models.system import Notification, AuditLog

__all__ = [
    "Base",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "User",
    "PasswordResetOTP",
    "UserRole",
    "Customer",
    "CustomerAddress",
    "Enquiry",
    "EnquiryFollowup",
    "EnquirySource",
    "SystemCapacity",
    "SystemType",
    "LeadStatus",
    "SiteSurvey",
    "SurveyPhoto",
    "SurveyStatus",
    "SurveyApprovalStatus",
    "RoofOrientation",
    "ProductCategory",
    "Product",
    "Package",
    "PackageItem",
    "WarrantyUnit",
    "Quotation",
    "QuotationItem",
    "QuotationRevision",
    "QuotationStatus",
    "Order",
    "OrderItem",
    "Payment",
    "Invoice",
    "OrderStatus",
    "PaymentStatus",
    "PaymentMethod",
    "PaymentType",
    "PaymentRecordStatus",
    "Inventory",
    "StockMovement",
    "StockReservation",
    "ProductSerial",
    "MovementType",
    "ReservationStatus",
    "SerialStatus",
    "Dispatch",
    "DispatchItem",
    "DeliveryConfirmation",
    "DispatchStatus",
    "Warranty",
    "WarrantyStatus",
    "InstallationJob",
    "InstallationChecklist",
    "InstallationPhoto",
    "TechnicianWorkLog",
    "InstallationSignoff",
    "InstallationStatus",
    "ServiceTicket",
    "ServiceAction",
    "TicketStatus",
    "ActionType",
    "ProjectExpense",
    "SubsidyRecord",
    "ExpenseCategory",
    "SubsidyStatus",
    "Notification",
    "AuditLog",
]
