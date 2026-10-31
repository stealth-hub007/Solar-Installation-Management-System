import React from 'react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Enterprise Reusable DataTable
 * Supports server-side pagination, sorting, search, custom actions, skeleton loading, and empty states.
 */
export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  error = null,
  emptyTitle = 'No records found',
  emptyMessage = 'No matching data matches your current criteria.',
  // Search
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  // Header Actions / Filters
  headerActions,
  filters,
  // Sorting
  sortColumn,
  sortDirection, // 'asc' | 'desc'
  onSort,
  // Pagination
  page = 1,
  pageSize = 10,
  totalRecords = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  // Styling
  bordered = true,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${bordered ? 'border border-slate-200/90' : ''} ${className}`}>
      {/* Top Toolbar: Search, Filters, Custom Header Actions */}
      {(onSearchChange || filters || headerActions) && (
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-slate-50/50">
          <div className="flex flex-1 flex-wrap items-center gap-2.5 sm:gap-3">
            {onSearchChange && (
              <div className="w-full md:w-72">
                <SearchBar
                  value={search}
                  onChange={onSearchChange}
                  placeholder={searchPlaceholder}
                  size="sm"
                />
              </div>
            )}
            {filters}
          </div>

          {headerActions && (
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => {
                const isSortable = col.sortable && onSort;
                const isSorted = sortColumn === col.accessor;

                return (
                  <th
                    key={col.accessor || idx}
                    className={`px-4 sm:px-5 py-3.5 select-none ${col.headerClassName || ''} ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100 transition' : ''
                    }`}
                    onClick={() => isSortable && onSort(col.accessor)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-[#0284C7]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-[#0284C7]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: pageSize > 5 ? 5 : pageSize }).map((_, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/40">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 sm:px-5 py-4">
                      <Skeleton className="h-4 w-full max-w-[120px] rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={columns.length} className="px-4 sm:px-5 py-12 text-center">
                  <div className="text-rose-500 font-semibold text-sm mb-1">Failed to load data</div>
                  <div className="text-slate-400 text-xs">{error}</div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-4 sm:px-5 py-12 text-center">
                  <EmptyState title={emptyTitle} message={emptyMessage} />
                </td>
              </tr>
            ) : (
              // Render Data Rows
              data.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  className="hover:bg-sky-50/30 transition-colors duration-150"
                >
                  {columns.map((col, cIdx) => {
                    const value = col.accessor ? row[col.accessor] : undefined;
                    return (
                      <td
                        key={col.accessor || cIdx}
                        className={`px-4 sm:px-5 py-3.5 sm:py-4 align-middle ${col.className || ''}`}
                      >
                        {col.cell ? col.cell({ value, row, index: rIdx }) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
};

export default DataTable;
