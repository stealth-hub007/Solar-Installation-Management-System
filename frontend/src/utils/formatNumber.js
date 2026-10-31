/**
 * Format numbers using Indian numbering system
 * @param {number|string} value - The numeric value
 * @param {Object} options
 * @param {boolean} options.compact - Compact representation (k, L, Cr)
 * @param {number} options.decimals - Decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, { compact = false, decimals = 0 } = {}) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }

  const num = Number(value);

  if (compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (abs >= 10000000) {
      return `${sign}${(abs / 10000000).toFixed(decimals > 0 ? decimals : 2)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${(abs / 100000).toFixed(decimals > 0 ? decimals : 1)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${(abs / 1000).toFixed(decimals > 0 ? decimals : 1)} k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(num);
};

export default formatNumber;

