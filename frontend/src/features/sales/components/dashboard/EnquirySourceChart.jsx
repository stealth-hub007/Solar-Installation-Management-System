import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../../../../components/ui/Card';

const DEFAULT_SOURCES = [
  { name: 'Website Direct', value: 118, percentage: 34.5, color: '#0284C7' },
  { name: 'Referrals', value: 92, percentage: 26.9, color: '#10B981' },
  { name: 'Social Media', value: 64, percentage: 18.7, color: '#F59E0B' },
  { name: 'Direct Walk-in', value: 48, percentage: 14.0, color: '#6366F1' },
  { name: 'Expos & Campaigns', value: 20, percentage: 5.9, color: '#EC4899' },
];

export const EnquirySourceChart = ({ data = DEFAULT_SOURCES }) => {
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-lg shadow-elevated border border-slate-200 text-xs">
          <p className="font-bold text-slate-800">{item.name}</p>
          <p className="text-slate-600 mt-0.5">
            <span className="font-semibold text-slate-900">{item.value}</span> Leads ({item.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900">Lead Acquisition Sources</h3>
        <p className="text-[11px] text-slate-500">Distribution of inbound enquiries</p>
      </div>

      <div className="flex-1 min-h-[190px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-slate-800">342</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Total Leads
          </span>
        </div>
      </div>

      {/* Sources Legend Grid */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="font-semibold text-slate-800">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default EnquirySourceChart;

