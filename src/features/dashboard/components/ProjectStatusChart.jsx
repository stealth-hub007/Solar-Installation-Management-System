import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card, { CardHeader } from '../../../components/ui/Card';
import Skeleton from '../../../components/common/Skeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatNumber } from '../../../utils/formatNumber';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-elevated text-xs space-y-1 z-20">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color || data.color }}
          />
          <span>{data.name}</span>
        </div>
        <p className="text-slate-600">
          Count: <span className="font-bold text-slate-900">{data.value} projects</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ProjectStatusChart = ({
  data = [],
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const totalProjects = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        icon={PieChartIcon}
        title="Project Pipeline Distribution"
        subtitle={`Current active stages across ${formatNumber(totalProjects)} total installations`}
      />

      <div className="h-72 w-full relative flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Skeleton variant="circular" className="w-44 h-44" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onRetry={onRetry} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No project stage data"
            description="No active project status metrics recorded."
          />
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || '#0284C7'}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '10px',
                    fontSize: '11px',
                    lineHeight: '1.4',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Donut Metric */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-bold text-[#17221E] block leading-none">
                {totalProjects}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Projects
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ProjectStatusChart;

