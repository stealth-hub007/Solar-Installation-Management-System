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
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 pb-6 sm:pb-7 mb-6 sm:mb-8 border-b border-slate-200/90 ${className}`}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center flex-wrap gap-3 sm:gap-3.5 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
