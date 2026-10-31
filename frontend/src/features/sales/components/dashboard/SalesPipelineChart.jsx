import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../../../../components/ui/Card';
import formatCurrency from '../../../../utils/formatCurrency';

const DEFAULT_STAGES = [
  { stage: 'New Leads', count: 48, value: 7200000, fill: '#38BDF8' },
  { stage: 'Contacted', count: 62, value: 9300000, fill: '#0EA5E9' },
  { stage: 'Survey Scheduled', count: 28, value: 4500000, fill: '#0284C7' },
  { stage: 'Quotation Sent', count: 35, value: 5800000, fill: '#0369A1' },
  { stage: 'Negotiation', count: 22, value: 3600000, fill: '#F59E0B' },
  { stage: 'Converted (Order)', count: 38, value: 6200000, fill: '#10B981' },
];

export const SalesPipelineChart = ({ data = DEFAULT_STAGES }) => {
  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2.5 rounded-lg shadow-elevated border border-slate-200 text-xs">
          <p className="font-bold text-slate-800">{item.stage}</p>
          <p className="text-slate-600 mt-0.5">
            Deals: <span className="font-bold text-slate-900">{item.count}</span>
          </p>
          <p className="text-slate-600">
            Pipeline Value: <span className="font-bold text-[#0284C7]">{formatCurrency(item.value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Sales Pipeline Stages</h3>
          <p className="text-[11px] text-slate-500">Active opportunities by qualification funnel</p>
        </div>
        <span className="text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full border border-[#BAE6FD]">
          233 Total Opportunities
        </span>
      </div>

      <div className="h-60 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              width={110}
            />
            <Tooltip content={customTooltip} />
            <Bar dataKey="count" name="Opportunities" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesPipelineChart;

