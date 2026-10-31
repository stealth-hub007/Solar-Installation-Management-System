import React from 'react';
import Card from '../../../../components/ui/Card';
import formatCurrency from '../../../../utils/formatCurrency';
import { Target, TrendingUp, Award, Clock } from 'lucide-react';

export const MonthlyTargetProgress = ({
  target = 6000000,
  achieved = 4850000,
  remaining = 1150000,
  percentage = 80.8,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Sales Target</h3>
              <p className="text-[11px] text-slate-500">Commercial Quota — Current Month</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {percentage}% Achieved
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900">{formatCurrency(achieved)} / {formatCurrency(target)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-left">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Remaining Deficit
            </span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">
              {formatCurrency(remaining)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F0F7FF] border border-[#BAE6FD]/60 text-left">
            <span className="text-[10px] font-semibold text-[#0284C7] uppercase tracking-wider block">
              Avg Deal Size
            </span>
            <span className="text-xs font-bold text-[#0284C7] mt-0.5 block">
              ₹2,02,000 / kW
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> 18 Days Remaining
        </span>
        <span className="text-emerald-600 font-semibold flex items-center gap-1">
          <Award className="w-3.5 h-3.5" /> High Performance
        </span>
      </div>
    </Card>
  );
};

export default MonthlyTargetProgress;

