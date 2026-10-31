import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  padding = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-card hover:border-slate-300' : ''
      } ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-sky-50 text-[#0284C7]">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          {title && <h3 className="text-base font-semibold text-[#17221E]">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default Card;

