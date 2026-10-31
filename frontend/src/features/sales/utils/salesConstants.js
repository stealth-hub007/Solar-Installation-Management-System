/**
 * Sales Constants, Status Enums, and Option Presets for SIMS
 */

export const CUSTOMER_TYPES = ['Residential', 'Commercial', 'Industrial', 'Institutional'];

export const CUSTOMER_STATUSES = ['Active', 'Prospect', 'Inactive'];

export const ENQUIRY_SOURCES = [
  'Website Form',
  'Referral',
  'Social Media',
  'Direct Call / Walk-in',
  'Campaign / Expo',
  'Architect / Builder',
  'Other',
];

export const ENQUIRY_STATUSES = [
  'New',
  'Contacted',
  'Follow-up Required',
  'Survey Scheduled',
  'Survey Completed',
  'Quotation Sent',
  'Negotiation',
  'Converted',
  'Lost',
];

export const FOLLOWUP_TYPES = [
  'Phone Call',
  'WhatsApp',
  'Email',
  'Meeting',
  'Site Visit',
  'Other',
];

export const FOLLOWUP_PRIORITIES = ['High', 'Medium', 'Low'];

export const FOLLOWUP_STATUSES = ['Pending', 'Completed', 'Overdue', 'Rescheduled', 'Cancelled'];

export const SURVEY_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

export const ROOF_TYPES = [
  'RCC Flat Roof',
  'Tin Shed Industrial',
  'Sloped Tile Roof',
  'Elevated Super Structure',
  'Ground Mount',
];

export const QUOTATION_STATUSES = [
  'Draft',
  'Submitted',
  'Approved',
  'Sent',
  'Accepted',
  'Rejected',
];

export const ORDER_STATUSES = [
  'Pending Confirmation',
  'Confirmed',
  'Processing',
  'Materials Pending',
  'Ready for Dispatch',
  'Dispatched',
  'Installation Pending',
  'Installed',
  'Completed',
  'Cancelled',
];

export const PAYMENT_STATUSES = [
  'Unpaid',
  'Advance Paid (30%)',
  'Milestone Paid (50%)',
  'Full Payment Received',
];

export const SOLAR_PANEL_PRESETS = [
  { name: 'Adani 540W Mono PERC Half-Cut', wattage: 540, unitPrice: 13000 },
  { name: 'Waaree 550W Bifacial TOPCon', wattage: 550, unitPrice: 14000 },
  { name: 'Tata Power 545W Mono PERC', wattage: 545, unitPrice: 13500 },
  { name: 'Vikram Solar 540W Somera Series', wattage: 540, unitPrice: 12800 },
];

export const INVERTER_PRESETS = [
  { name: 'Growatt 5kW 1-Phase On-Grid', capacityKw: 5, unitPrice: 48000 },
  { name: 'Growatt 8kW 3-Phase On-Grid', capacityKw: 8, unitPrice: 72000 },
  { name: 'Growatt 10kW 3-Phase On-Grid', capacityKw: 10, unitPrice: 85000 },
  { name: 'Sungrow 15kW 3-Phase Commercial', capacityKw: 15, unitPrice: 115000 },
  { name: 'Sungrow 33kW 3-Phase Commercial', capacityKw: 33, unitPrice: 185000 },
  { name: 'SolarEdge 40kW Inverter with Optimizers', capacityKw: 40, unitPrice: 310000 },
];

