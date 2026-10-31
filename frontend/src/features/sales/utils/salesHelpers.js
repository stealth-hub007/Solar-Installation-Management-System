/**
 * Sales Helper calculations & formatting for SIMS
 */

/**
 * Calculates estimated daily solar generation in kWh based on kW capacity
 * Average Indian solar insolation = ~4.2 to 4.8 units per kW per day
 */
export const calculateDailyGeneration = (capacityKw) => {
  const cap = Number(capacityKw) || 0;
  return Math.round(cap * 4.5);
};

/**
 * Estimates MNRE PM Surya Ghar Central Government Subsidy
 * 1 kW: ₹30,000
 * 2 kW: ₹60,000
 * 3 kW and above: ₹78,000 (Capped for residential)
 * Commercial/Industrial: ₹0
 */
export const calculateEstimatedSubsidy = (capacityKw, customerType = 'Residential') => {
  if (customerType !== 'Residential') return 0;
  const cap = Number(capacityKw) || 0;
  if (cap <= 0) return 0;
  if (cap >= 3) return 78000;
  if (cap >= 2) return 60000;
  return 30000;
};

/**
 * Calculate line item totals
 */
export const calculateLineTotal = (quantity, unitPrice) => {
  return (Number(quantity) || 0) * (Number(unitPrice) || 0);
};

/**
 * Format Indian currency string
 */
export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

