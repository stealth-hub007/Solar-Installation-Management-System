import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const TechnicianStatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  onClick,
}) => {
  const getBadgeClass = () => {
    switch (badgeVariant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'primary':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-subtle transition-all duration-200 hover:shadow-card hover:border-[#0284C7]/40 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate" title={title}>
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-sky-50 text-[#0284C7] shrink-0 group-hover:bg-[#0284C7] group-hover:text-white transition-colors duration-200">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 font-medium truncate">{subtext}</span>
        {badgeText && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getBadgeClass()}`}>
            {badgeText}
          </span>
        )}
      </div>

      {onClick && (
        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#0284C7]" />
        </div>
      )}
    </div>
  );
};

export default TechnicianStatCard;
