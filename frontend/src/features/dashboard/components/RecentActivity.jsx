import React, { useState } from 'react';
import { Search, RotateCcw, Activity as ActivityIcon } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/Badge';
import Button from '../../../components/common/Button';
import formatDate from '../../../utils/formatDate';
import useDebounce from '../../../hooks/useDebounce';

export const RecentActivity = ({
  data = [],
  pagination,
  filters,
  isLoading = false,
  error = null,
  onPageChange,
  onPageSizeChange,
  onFiltersChange,
  onResetFilters,
  onRetry,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleModuleFilterChange = (module) => {
    onFiltersChange({ module });
  };

  const handleSort = (field) => {
    const isSame = filters.sortBy === field;
    const nextDirection = isSame && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ sortBy: field, sortDirection: nextDirection });
  };

  const columns = [
    {
      header: 'Actor',
      accessor: 'user',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-semibold text-xs text-slate-800 max-w-[120px] truncate block" title={value}>{value}</span>
      ),
    },
    {
      header: 'Operational Event',
      accessor: 'activity',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600 max-w-[280px] truncate block" title={value}>{value}</span>
      ),
    },
    {
      header: 'Module',
      accessor: 'module',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded border border-[#BAE6FD]">
          {value}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(value, { includeTime: true, format: 'short' })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
  ];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <CardHeader
          icon={ActivityIcon}
          title="Operational Audit Trail"
          subtitle="System event logs, technician milestones, and user actions"
          className="mb-3"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search user, action or keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.module}
              onChange={(e) => handleModuleFilterChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Modules</option>
              <option value="Installations">Installations</option>
              <option value="Payments">Payments</option>
              <option value="Surveys">Surveys</option>
              <option value="Quotations">Quotations</option>
              <option value="Dispatch">Dispatch</option>
              <option value="Enquiries">Enquiries</option>
            </select>

            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={() => {
                setSearchInput('');
                onResetFilters();
              }}
              title="Reset Search"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        sortField={filters.sortBy}
        sortDirection={filters.sortDirection}
        onSort={handleSort}
        emptyTitle="No activity records found"
        emptyDescription="Audit log stream is currently empty."
      />

      <TablePagination
        currentPage={pagination?.page || 1}
        pageSize={pagination?.pageSize || 10}
        totalRecords={pagination?.totalRecords || 0}
        totalPages={pagination?.totalPages || 1}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
      />
    </Card>
  );
};

export default RecentActivity;
