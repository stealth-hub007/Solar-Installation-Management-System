/**
 * Format ISO date string or Date object to readable representation
 * @param {string|Date} dateValue
 * @param {Object} options
 * @param {boolean} options.includeTime - Include hours and minutes
 * @param {string} options.format - 'short' | 'medium' | 'long'
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, { includeTime = false, format = 'medium' } = {}) => {
  if (!dateValue) return '—';

  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'Invalid date';

  const dateOptions = {
    day: '2-digit',
    month: format === 'short' ? 'numeric' : 'short',
    year: 'numeric',
  };

  if (includeTime) {
    return new Intl.DateTimeFormat('en-IN', {
      ...dateOptions,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-IN', dateOptions).format(date);
};

/**
 * Format relative time (e.g., '10 mins ago', '2 hours ago', 'Yesterday')
 * @param {string|Date} dateValue
 * @returns {string}
 */
export const formatRelativeTime = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '—';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  return formatDate(dateValue, { format: 'short' });
};

export default formatDate;

