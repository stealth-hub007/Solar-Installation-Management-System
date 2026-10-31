import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../../../../components/ui/Card';

export const SalesStatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  trendLabel = 'vs last month',
  subtitle,
  onClick,
  variant = 'default', // 'default' | 'primary' | 'highlight'
}) => {
  return (
    <Card
      padding={false}
      hover={!!onClick}
      onClick={onClick}
      className={`p-4 transition-all duration-200 border relative overflow-hidden group rounded-2xl
        ${onClick ? 'cursor-pointer hover:border-[#0284C7] hover:shadow-card' : ''}
        ${
          variant === 'primary'
            ? 'bg-white border-2 border-[#38BDF8] shadow-xs'
            : variant === 'highlight'
            ? 'bg-white border-slate-200/90'
            : 'bg-white border-slate-200/80'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105
            ${
              variant === 'highlight'
                ? 'bg-emerald-50 text-emerald-500'
                : 'bg-sky-50 text-[#0284C7]'
            }
          `}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1 font-semibold text-xs">
              <span className="flex items-center gap-0.5 text-emerald-600 font-semibold">
                {trendDirection === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {trendDirection === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                {trend}
              </span>
              <span className="text-slate-400 font-normal">{trendLabel}</span>
            </div>
          ) : (
            <span className="text-slate-400 truncate text-xs">{subtitle}</span>
          )}

          {onClick && (
            <span className="text-[#0284C7] group-hover:translate-x-0.5 transition-transform text-xs font-semibold flex items-center">
              View <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default SalesStatCard;

