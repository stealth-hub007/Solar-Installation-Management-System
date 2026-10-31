import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'forest' | 'neutral'
  size = 'md', // 'sm' | 'md'
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

  const sizeMap = {
    sm: 'text-[11px] px-2 py-0.5 font-medium gap-1.5',
    md: 'text-xs px-2.5 py-1 font-medium gap-1.5',
  };

  const selectedVariant = variantMap[variant] || variantMap.neutral;
  const selectedDotColor = dotColorMap[variant] || dotColorMap.neutral;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${selectedVariant} ${sizeMap[size] || sizeMap.md} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedDotColor}`} />}
      <span>{children}</span>
    </span>
  );
};

/**
 * Helper to auto-map status strings to badge variant
 */
export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toLowerCase().trim();

  let variant = 'neutral';

  if (
    normalized.includes('complete') ||
    normalized.includes('approved') ||
    normalized.includes('paid') ||
    normalized.includes('success') ||
    normalized.includes('active') ||
    normalized.includes('resolved')
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
    normalized.includes('open')
  ) {
    variant = 'info';
  }

  return (
    <Badge variant={variant} dot className={className}>
      {status}
    </Badge>
  );
};

export default Badge;

