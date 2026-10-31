import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../../../../components/ui/Card';
import formatCurrency from '../../../../utils/formatCurrency';

export const SalesOverviewChart = ({ data = [] }) => {
  const [metric, setMetric] = useState('both'); // 'revenue' | 'orders' | 'both'

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-elevated border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-1.5">{label} Performance</p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-semibold text-slate-900">
                {item.name === 'Revenue' || item.name === 'Target'
                  ? formatCurrency(item.value)
                  : `${item.value} Deals`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sales Revenue & Conversions</h3>
          <p className="text-[11px] text-slate-500">Monthly booked contracts vs projected target</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setMetric('both')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              metric === 'both' ? 'bg-white text-[#0284C7] shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMetric('revenue')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              metric === 'revenue' ? 'bg-white text-[#0284C7] shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('orders')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              metric === 'orders' ? 'bg-white text-[#0284C7] shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `₹${v / 100000}L`}
            />
            {metric !== 'revenue' && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
            )}
            <Tooltip content={customTooltip} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

            {(metric === 'both' || metric === 'revenue') && (
              <>
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  fill="#0284C7"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  yAxisId="left"
                  dataKey="target"
                  name="Target"
                  fill="#BAE6FD"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </>
            )}

            {(metric === 'both' || metric === 'orders') && (
              <Line
                yAxisId={metric === 'orders' ? 'left' : 'right'}
                type="monotone"
                dataKey="orders"
                name="Converted Orders"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10B981', strokeWidth: 1.5, stroke: '#fff' }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesOverviewChart;

