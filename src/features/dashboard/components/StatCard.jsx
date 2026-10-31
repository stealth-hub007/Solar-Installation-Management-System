import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatNumber } from '../../../utils/formatNumber';

export const StatCard = ({
  title,
  value,
  isCurrency = false,
  compact = false,
  icon: Icon,
  iconBgColor = 'bg-sky-50 text-[#0284C7]',
  changePercentage,
  trend, // 'up' | 'down' | 'neutral'
  comparisonPeriod,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col justify-between h-36">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-subtle flex flex-col justify-between h-36">
        <div className="flex items-center gap-2 text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold">{title}</span>
        </div>
        <p className="text-xs text-rose-600 line-clamp-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[11px] font-semibold text-rose-800 underline hover:text-rose-950 text-left"
          >
            Retry Loading
          </button>
        )}
      </div>
    );
  }

  // Format value safely
  const formattedValue = isCurrency
    ? formatCurrency(value, { compact })
    : formatNumber(value, { compact });

  // Has valid comparison & trend
  const hasTrend =
    trend !== undefined &&
    trend !== null &&
    changePercentage !== undefined &&
    changePercentage !== null;

  const isPositive = trend === 'up';
  const isNegative = trend === 'down';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
      {/* Card Header: Title & Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBgColor}`}>
            <Icon className="w-5 h-5 stroke-[1.8]" />
          </div>
        )}
      </div>

      {/* Main KPI Value */}
      <div className="mt-2 mb-1">
        <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
          {formattedValue}
        </div>
      </div>

      {/* Footer: Trend and comparison text (only rendered when real comparison data exists) */}
      <div className="flex items-center gap-2 text-xs pt-1">
        {hasTrend ? (
          <div
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-[11px] ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : isNegative
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : isNegative ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(changePercentage)}%</span>
          </div>
        ) : null}

        {comparisonPeriod ? (
          <span className="text-slate-400 text-[11px] truncate">
            {comparisonPeriod}
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">Active count</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
