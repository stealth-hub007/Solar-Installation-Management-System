/**
 * Technician Module Constants
 */

export const SURVEY_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'amber' },
  { value: 'SUBMITTED', label: 'Submitted', color: 'purple' },
  { value: 'COMPLETED', label: 'Completed', color: 'emerald' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'rose' },
];

export const SURVEY_APPROVAL_STATUSES = [
  { value: 'all', label: 'All Approvals' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval', color: 'amber' },
  { value: 'APPROVED', label: 'Approved', color: 'emerald' },
  { value: 'REJECTED', label: 'Rejected', color: 'rose' },
];

export const ROOF_ORIENTATIONS = [
  { value: 'SOUTH', label: 'South (Optimal for Solar)' },
  { value: 'SOUTH_EAST', label: 'South-East' },
  { value: 'SOUTH_WEST', label: 'South-West' },
  { value: 'EAST', label: 'East' },
  { value: 'WEST', label: 'West' },
  { value: 'NORTH', label: 'North' },
  { value: 'NORTH_EAST', label: 'North-East' },
  { value: 'NORTH_WEST', label: 'North-West' },
  { value: 'FLAT', label: 'Flat Roof (Rooftop Elevated)' },
];

export const ROOF_TYPES = [
  { value: 'RCC Flat Roof', label: 'RCC Flat Concrete Roof' },
  { value: 'Tin Shed Structure', label: 'Industrial / Commercial Tin Shed' },
  { value: 'Clay Tile Sloped', label: 'Traditional Sloped Tile Roof' },
  { value: 'Elevated Superstructure', label: 'Custom Elevated Superstructure (>8ft)' },
];

export const PHOTO_CATEGORIES = [
  { id: 'ROOF_OVERVIEW', label: 'Roof Overview & Azimuth' },
  { id: 'ELECTRICAL_PANEL', label: 'Main LT Panel & Meter Board' },
  { id: 'SHADOW_OBSTACLES', label: 'Shadow Obstacles & Parapet' },
  { id: 'EARTHING_LOCATION', label: 'Earthing & Lightning Pit Location' },
  { id: 'INVERTER_LOCATION', label: 'Proposed Inverter Mounting Area' },
  { id: 'CABLE_ROUTING', label: 'Cable Trench & Conduit Route' },
];

export const INSTALLATION_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING_ASSIGNMENT', label: 'Pending Assignment', color: 'slate' },
  { value: 'SCHEDULED', label: 'Scheduled', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'amber' },
  { value: 'TESTING', label: 'Testing & Commissioning', color: 'indigo' },
  { value: 'COMPLETED', label: 'Completed & Handed Over', color: 'emerald' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'rose' },
];

export const MANDATORY_CHECKLIST_ITEMS = [
  { key: 'mounting_stands_installed', label: 'Mounting Structure & Rail Anchoring Installed', category: 'Structure' },
  { key: 'solar_panels_installed', label: 'Tier-1 Solar PV Modules Fixed & Clamped', category: 'Panels' },
  { key: 'inverter_installed', label: 'On-Grid / Hybrid Inverter Mounted & Wall Clamped', category: 'Electrical' },
  { key: 'battery_installed', label: 'LiFePO4 Battery Bank Connected (if applicable)', category: 'Storage', optional: true },
  { key: 'wiring_completed', label: 'DC Cabling, Conduit & ACDB/DCDB Connections', category: 'Electrical' },
  { key: 'safety_equipment_installed', label: 'MC4 Connectors, Isolators & Surge Arresters (SPD)', category: 'Safety' },
  { key: 'earthing_completed', label: 'Dedicated Chemical Earthing Pit & Lightning Arrester (LA)', category: 'Safety' },
  { key: 'system_tested', label: 'Voc, Isc Voltage Readings & Insulation Resistance Check', category: 'Testing' },
  { key: 'power_generation_verified', label: 'Bi-Directional Net-Meter Sync & Active kW Generation', category: 'Commissioning' },
];

export const EQUIPMENT_VERIFICATION_STATUSES = [
  { value: 'VERIFIED', label: 'Verified & Matched', color: 'emerald' },
  { value: 'PENDING', label: 'Pending Verification', color: 'amber' },
  { value: 'MISMATCH', label: 'Serial Mismatch', color: 'rose' },
  { value: 'DAMAGED', label: 'Physical Damage Noted', color: 'purple' },
];
