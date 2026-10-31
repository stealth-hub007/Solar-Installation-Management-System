import React, { useState } from 'react';
import { Search, RotateCcw, Eye, Headphones, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import { Badge, StatusBadge } from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/common/Button';
import ServiceTicketModal from './modals/ServiceTicketModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import formatDate from '../../../utils/formatDate';
import useDebounce from '../../../hooks/useDebounce';

export const RecentServiceTickets = ({
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
  onCreateTicket,
  onDeleteTicket,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [viewTicket, setViewTicket] = useState(null);
  const [deletingTicket, setDeletingTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handlePriorityFilterChange = (priority) => {
    onFiltersChange({ priority });
  };

  const handleSort = (field) => {
    const isSame = filters.sortBy === field;
    const nextDirection = isSame && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ sortBy: field, sortDirection: nextDirection });
  };

  const handleCreateSubmit = async (formData) => {
    if (onCreateTicket) {
      await onCreateTicket(formData);
      setIsCreateOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDeleteTicket && deletingTicket) {
      await onDeleteTicket(deletingTicket.id);
      setDeletingTicket(null);
    }
  };

  const priorityVariantMap = {
    critical: 'critical',
    high: 'danger',
    medium: 'warning',
    low: 'neutral',
  };

  const columns = [
    {
      header: 'Ticket ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-slate-800">{value}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-semibold text-slate-800 max-w-[130px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Issue Diagnostic',
      accessor: 'issueType',
      cell: ({ value }) => (
        <span className="text-xs text-slate-700 font-medium max-w-[160px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: ({ value }) => {
        const val = String(value || '').toLowerCase();
        return (
          <Badge variant={priorityVariantMap[val] || 'neutral'} dot size="sm">
            {value}
          </Badge>
        );
      },
    },
    {
      header: 'Engineer',
      accessor: 'assignedTechnician',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600 font-medium max-w-[110px] truncate block" title={value || 'Unassigned'}>
          {value || 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'ticketStatus',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Logged',
      accessor: 'createdDate',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-xs text-slate-500">
          {formatDate(value, { format: 'short' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setViewTicket(row)}
            className="p-1 rounded-md text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="Inspect Service Ticket"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingTicket(row)}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Ticket"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card padding={false} className="overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <CardHeader
            icon={Headphones}
            title="Recent Service & Maintenance Tickets"
            subtitle="O&M warranty support, inverter diagnostics, and customer breakdown calls"
            className="mb-0"
          />

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="self-start sm:self-auto shrink-0"
          >
            Log New Ticket
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search ticket ID, customer or issue..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.priority}
              onChange={(e) => handlePriorityFilterChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
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
        emptyTitle="No service tickets found"
        emptyDescription="All maintenance and support cases are resolved."
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

      {/* Ticket Modal */}
      {viewTicket && (
        <Modal
          isOpen={!!viewTicket}
          onClose={() => setViewTicket(null)}
          title={`Ticket: ${viewTicket.id}`}
          subtitle={`Reported by ${viewTicket.customerName}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditingTicket(viewTicket);
                  setViewTicket(null);
                }}
              >
                Edit Ticket
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewTicket(null)}>
                Close Ticket
              </Button>
            </div>
          }
        >
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Issue Classification</span>
              <span className="font-semibold text-slate-800">{viewTicket.issueType}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Ticket Priority</span>
              <Badge variant={priorityVariantMap[String(viewTicket.priority).toLowerCase()] || 'neutral'} dot>
                {viewTicket.priority}
              </Badge>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Assigned Engineer</span>
              <span className="font-semibold text-slate-800">{viewTicket.assignedTechnician}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Status</span>
              <StatusBadge status={viewTicket.ticketStatus} />
            </div>
          </div>
        </Modal>
      )}

      {/* Log Ticket Modal */}
      {isCreateOpen && (
        <ServiceTicketModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTicket && (
        <ConfirmDeleteModal
          isOpen={!!deletingTicket}
          onClose={() => setDeletingTicket(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Service Ticket"
          message={`Are you sure you want to remove service ticket ${deletingTicket.id} for ${deletingTicket.customerName}?`}
          itemIdentifier={`${deletingTicket.id} — ${deletingTicket.issueType}`}
        />
      )}
    </Card>
  );
};

export default RecentServiceTickets;
