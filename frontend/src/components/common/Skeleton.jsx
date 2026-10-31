import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular', // 'text' | 'circular' | 'rectangular'
  width,
  height,
}) => {
  const baseClasses = 'animate-pulse bg-slate-200/80 rounded';

  const variantClasses = {
    text: 'h-4 rounded my-1',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const TableRowSkeleton = ({ columns = 6 }) => {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};

export const CardSkeleton = ({ height = '120px' }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton variant="circular" className="w-9 h-9" />
      </div>
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3 w-44" />
    </div>
  );
};

export default Skeleton;

