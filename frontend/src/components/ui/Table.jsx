import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton, TableRowSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorMessage from '../common/ErrorMessage';

/**
 * Reusable Table Component - Compact, Crisp Single-Line Layout
 */
export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your current filter criteria.',
  sortField,
  sortDirection = 'asc',
  onSort,
  className = '',
}) => {
  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-subtle ${className}`}>
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              {columns.map((col, colIdx) => {
                const isSortable = col.sortable && onSort;
                const isSorted = sortField === col.accessor;
                const isActionCol = col.header === 'Actions' || col.isAction || col.stickyRight;

                return (
                  <th
                    key={col.header || col.accessor || colIdx}
                    scope="col"
                    className={`px-3 py-2.5 whitespace-nowrap ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${
                      isActionCol
                        ? 'sticky right-0 z-10 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_8px_-3px_rgba(0,0,0,0.06)]'
                        : ''
                    } ${col.headerClassName || ''} ${
                      isSortable ? 'cursor-pointer select-none hover:bg-slate-100/90' : ''
                    }`}
                    onClick={() => isSortable && onSort(col.accessor)}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === 'right' ? 'justify-end w-full' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-[#0284C7]" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-[#0284C7]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-50" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRowSkeleton key={idx} columns={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="group hover:bg-[#F0F7FF]/50 transition-colors duration-100"
                >
                  {columns.map((col, colIdx) => {
                    const value = col.accessor ? row[col.accessor] : undefined;
                    const isActionCol = col.header === 'Actions' || col.isAction || col.stickyRight;

                    return (
                      <td
                        key={col.accessor || col.header || colIdx}
                        className={`px-3 py-2 text-slate-700 leading-tight ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${
                          isActionCol
                            ? 'sticky right-0 z-10 bg-white group-hover:bg-[#EBF5FE] border-l border-slate-100 shadow-[-6px_0_8px_-3px_rgba(0,0,0,0.06)]'
                            : ''
                        } ${col.nowrap ? 'whitespace-nowrap' : ''} ${col.cellClassName || ''}`}
                      >
                        {col.cell ? col.cell({ row, value, index: rowIndex }) : value ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Server-Side Pagination Bar
 */
export const TablePagination = ({
  currentPage = 1,
  pageSize = 10,
  totalRecords = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  isLoading = false,
  className = '',
}) => {
  const fromRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-white border border-t-0 border-slate-200/90 rounded-b-xl text-xs text-slate-600 ${className}`}
    >
      <div className="flex items-center gap-3">
        <span>
          Showing <span className="font-semibold text-slate-900">{fromRecord}</span> to{' '}
          <span className="font-semibold text-slate-900">{toRecord}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalRecords}</span> entries
        </span>

        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-[#0284C7] focus:outline-none"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="mr-2 text-slate-500">
          Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalPages || 1}</span>
        </span>

        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || isLoading}
          className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || isLoading}
          className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Table;
