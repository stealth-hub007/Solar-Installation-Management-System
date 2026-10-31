import React from 'react';
import {
  BarChart,
  Bar,
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
import { Boxes } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-slate-200/90 shadow-elevated text-xs space-y-1.5 z-20">
        <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">{entry.name}:</span>
            </div>
            <span className="font-bold text-slate-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const InventoryChart = ({
  data = [],
  isLoading = false,
  error = null,
  onRetry,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        icon={Boxes}
        title="Warehouse Inventory Thresholds"
        subtitle="Stock levels vs safety buffers across critical equipment categories"
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
            title="No inventory records"
            description="Warehouse item counts are currently unavailable."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar dataKey="available" name="Available Stock" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="reserved" name="Reserved for Projects" fill="#F5B942" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lowStock" name="Safety Buffer" fill="#FB923C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outOfStock" name="Out of Stock" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default InventoryChart;

