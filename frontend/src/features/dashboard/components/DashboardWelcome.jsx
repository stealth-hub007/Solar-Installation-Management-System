import React from 'react';
import { Sparkles, Calendar, RotateCw, SunMedium } from 'lucide-react';
import Button from '../../../components/common/Button';
import formatDate from '../../../utils/formatDate';

export const DashboardWelcome = ({
  adminName = 'Administrator',
  timeRange = '30d',
  onTimeRangeChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const today = formatDate(new Date(), { format: 'long' });

  const timeRanges = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 90 Days', value: '90d' },
    { label: 'Year to Date', value: '1y' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#F0F7FF] via-[#E0F2FE]/40 to-white border border-[#BAE6FD] p-5 sm:p-7 shadow-subtle">
      {/* Decorative background sun & glow in soft sky blue */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-6 opacity-10 hidden sm:block pointer-events-none">
        <SunMedium className="w-32 h-32 text-[#0284C7]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* Left Welcome Text */}
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#BAE6FD] text-[#0369A1] text-xs font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Solar Operations Command Center</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-[#0284C7]">{adminName}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Real-time solar installations, financial realization, warehouse inventory, and maintenance tickets with live LocalStorage persistence.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
            <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Operational Date: {today}</span>
          </div>
        </div>

        {/* Right Controls: Time Range, Refresh & Reset Demo Data */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200/90 shadow-xs max-w-full overflow-x-auto scrollbar-none">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                type="button"
                onClick={() => onTimeRangeChange && onTimeRangeChange(range.value)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all whitespace-nowrap ${
                  timeRange === range.value
                    ? 'bg-[#0284C7] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
              icon={RotateCw}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0284C7]"
              title="Refresh All Dashboard Data"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcome;
