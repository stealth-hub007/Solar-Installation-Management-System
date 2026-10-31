/**
 * Format numeric value to Indian Rupee (INR) currency representation
 * @param {number|string} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.compact - Whether to use compact representation (e.g. ₹1.2 L, ₹2.5 Cr)
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, { compact = false, decimals = 0 } = {}) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }

  const num = Number(amount);

  if (compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (abs >= 10000000) {
      // Crores
      return `${sign}₹${(abs / 10000000).toFixed(decimals > 0 ? decimals : 2)} Cr`;
    }
    if (abs >= 100000) {
      // Lakhs
      return `${sign}₹${(abs / 100000).toFixed(decimals > 0 ? decimals : 1)} L`;
    }
    if (abs >= 1000) {
      // Thousands
      return `${sign}₹${(abs / 1000).toFixed(decimals > 0 ? decimals : 1)} k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num);
};

export default formatCurrency;

