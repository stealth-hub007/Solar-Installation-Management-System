import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardHeader } from '../../../components/ui/Card';
import Skeleton from '../../../components/common/Skeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { formatCurrency } from '../../../utils/formatCurrency';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/90 shadow-elevated text-xs space-y-1.5 z-20">
        <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">{entry.name}:</span>
            </div>
            <span className="font-bold text-slate-900">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({
  data = [],
  period = '12m',
  onPeriodChange,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const periods = [
    { label: '6 Months', value: '6m' },
    { label: '12 Months', value: '12m' },
    { label: 'YTD', value: 'ytd' },
  ];

  const periodSelector = (
    <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200/80">
      {periods.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onPeriodChange && onPeriodChange(p.value)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            period === p.value
              ? 'bg-[#0284C7] text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        icon={TrendingUp}
        title="Revenue & Collections Analytics"
        subtitle="Monthly comparison of invoiced revenue vs cash collected"
        action={periodSelector}
      />

      <div className="h-72 w-full mt-2">
        {isLoading ? (
          <div className="h-full flex flex-col justify-end gap-3 p-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No revenue records found"
            description="No transaction or invoice records exist for the selected period."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                {/* Royal/Sky Blue Gradient */}
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
                {/* Light Cyan Gradient */}
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
                {/* Coral Gradient for Outstanding */}
                <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(val) => formatCurrency(val, { compact: true })}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                name="Total Revenue"
                stroke="#0284C7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="received"
                name="Payments Received"
                stroke="#38BDF8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReceived)"
              />
              <Area
                type="monotone"
                dataKey="outstanding"
                name="Outstanding"
                stroke="#F43F5E"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorOutstanding)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default RevenueChart;
