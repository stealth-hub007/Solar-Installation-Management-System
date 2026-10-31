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
import { Wrench } from 'lucide-react';

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
            <span className="font-bold text-slate-900">{entry.value} sites</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const InstallationChart = ({
  data = [],
  isLoading = false,
  error = null,
  onRetry,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        icon={Wrench}
        title="Weekly Installation Velocity"
        subtitle="Tracking scheduled vs completed and delayed field installations"
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
            title="No installation activity"
            description="No installation performance logs for this cycle."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar dataKey="scheduled" name="Scheduled" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default InstallationChart;

