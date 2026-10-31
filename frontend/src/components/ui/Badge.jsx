import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'forest' | 'neutral'
  size = 'md', // 'sm' | 'md' | 'lg'
  dot = false,
  className = '',
}) => {
  const variantMap = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    critical: 'bg-red-50 text-red-700 border-red-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    forest: 'bg-sky-100/70 text-[#0284C7] border-[#0284C7]/20',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColorMap = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    critical: 'bg-red-600',
    info: 'bg-sky-500',
    forest: 'bg-[#0284C7]',
    neutral: 'bg-slate-400',
  };

  // Standardized badge sizes with fixed heights and min-width for uniform appearance
  const sizeMap = {
    sm: 'text-[11px] h-6 px-2.5 font-medium gap-1.5 min-w-[90px] justify-center',
    md: 'text-xs h-6.5 px-3 font-semibold gap-1.5 min-w-[110px] justify-center',
    lg: 'text-xs h-7 px-3.5 font-bold gap-2 min-w-[124px] justify-center',
  };

  const selectedVariant = variantMap[variant] || variantMap.neutral;
  const selectedDotColor = dotColorMap[variant] || dotColorMap.neutral;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border whitespace-nowrap select-none transition-colors ${selectedVariant} ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedDotColor}`} />}
      <span className="truncate">{children}</span>
    </span>
  );
};

/**
 * Universal helper to auto-map status strings to uniform badge variant & size
 */
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  let variant = 'neutral';

  if (
    normalized.includes('complete') ||
    normalized.includes('approved') ||
    normalized.includes('paid') ||
    normalized.includes('success') ||
    normalized.includes('active') ||
    normalized.includes('resolved') ||
    normalized.includes('done')
  ) {
    variant = 'success';
  } else if (
    normalized.includes('progress') ||
    normalized.includes('pending') ||
    normalized.includes('scheduled') ||
    normalized.includes('survey') ||
    normalized.includes('warning') ||
    normalized.includes('medium') ||
    normalized.includes('low stock')
  ) {
    variant = 'warning';
  } else if (
    normalized.includes('cancel') ||
    normalized.includes('delayed') ||
    normalized.includes('overdue') ||
    normalized.includes('critical') ||
    normalized.includes('out of stock') ||
    normalized.includes('failed') ||
    normalized.includes('high')
  ) {
    variant = 'danger';
  } else if (
    normalized.includes('enquiry') ||
    normalized.includes('info') ||
    normalized.includes('new') ||
    normalized.includes('open') ||
    normalized.includes('draft') ||
    normalized.includes('sent') ||
    normalized.includes('quoted') ||
    normalized.includes('review')
  ) {
    variant = 'info';
  }

  return (
    <Badge variant={variant} dot size={size} className={className}>
      {status}
    </Badge>
  );
};

export default Badge;
