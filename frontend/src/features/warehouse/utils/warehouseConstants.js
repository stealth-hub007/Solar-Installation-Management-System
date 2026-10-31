/**
 * Warehouse Constants & Enumerations for Solar Installation Management System (SIMS)
 */

export const SOLAR_PRODUCT_CATEGORIES = [
  'Solar Panels',
  'Solar Inverters',
  'Solar Batteries',
  'Mounting Structures',
  'DC Cables',
  'AC Cables',
  'Connectors',
  'Protection Devices',
  'Electrical Accessories',
  'Monitoring Equipment',
  'Other Solar Components',
];

export const STOCK_MOVEMENT_TYPES = {
  STOCK_IN: { label: 'Stock In / Receipt', color: 'emerald', badge: 'Stock In' },
  STOCK_RESERVATION: { label: 'Order Reservation', color: 'amber', badge: 'Reserved' },
  RESERVATION_RELEASE: { label: 'Reservation Release', color: 'blue', badge: 'Released' },
  STOCK_DISPATCH: { label: 'Dispatch Fulfillment', color: 'indigo', badge: 'Dispatched' },
  STOCK_ADJUSTMENT: { label: 'Audit Adjustment', color: 'purple', badge: 'Adjustment' },
};

export const DISPATCH_STATUSES = {
  PREPARING: { label: 'Preparing / Staging', color: 'amber', badge: 'Preparing' },
  DISPATCHED: { label: 'Dispatched in Transit', color: 'sky', badge: 'Dispatched' },
  DELIVERED: { label: 'Delivered & Verified', color: 'emerald', badge: 'Delivered' },
  CANCELLED: { label: 'Cancelled', color: 'rose', badge: 'Cancelled' },
};

export const SERIAL_STATUSES = {
  IN_STOCK: { label: 'In Stock (Available)', color: 'emerald' },
  RESERVED: { label: 'Reserved for Order', color: 'amber' },
  DISPATCHED: { label: 'Dispatched with Carrier', color: 'sky' },
  DELIVERED: { label: 'Delivered to Customer', color: 'indigo' },
  DEFECTIVE: { label: 'Defective / Quarantined', color: 'rose' },
};

export const PURCHASE_STATUSES = {
  DRAFT: { label: 'Draft', color: 'slate' },
  SUBMITTED: { label: 'Submitted for Approval', color: 'amber' },
  APPROVED: { label: 'Approved & Issued', color: 'sky' },
  PARTIALLY_RECEIVED: { label: 'Partially Received', color: 'purple' },
  RECEIVED: { label: 'Fully Received', color: 'emerald' },
  CANCELLED: { label: 'Cancelled', color: 'rose' },
};

export const TRANSFER_STATUSES = {
  REQUESTED: { label: 'Requested', color: 'amber' },
  APPROVED: { label: 'Approved', color: 'sky' },
  IN_TRANSIT: { label: 'In Transit', color: 'indigo' },
  RECEIVED: { label: 'Completed', color: 'emerald' },
  CANCELLED: { label: 'Cancelled', color: 'rose' },
};

export const WAREHOUSES = [
  { id: 'wh-main', code: 'WH-JPR-01', name: 'Jaipur Central Solar Logistics Hub', location: 'Jaipur, Rajasthan', isPrimary: true },
  { id: 'wh-udaipur', code: 'WH-UDR-02', name: 'Udaipur Regional Depot', location: 'Udaipur, Rajasthan', isPrimary: false },
  { id: 'wh-jodhpur', code: 'WH-JDH-03', name: 'Jodhpur Solar Depot', location: 'Jodhpur, Rajasthan', isPrimary: false },
];

