import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  children,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80 ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17221E]">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center flex-wrap gap-2.5">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

