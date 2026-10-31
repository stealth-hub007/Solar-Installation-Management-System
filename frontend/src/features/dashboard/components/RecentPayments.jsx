import React, { useState } from 'react';
import { Search, RotateCcw, CreditCard, Receipt, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/common/Button';
import PaymentModal from './modals/PaymentModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import formatCurrency from '../../../utils/formatCurrency';
import formatDate from '../../../utils/formatDate';
import useDebounce from '../../../hooks/useDebounce';

export const RecentPayments = ({
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
  onCreatePayment,
  onDeletePayment,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [viewPayment, setViewPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleStatusFilterChange = (status) => {
    onFiltersChange({ status });
  };

  const handleSort = (field) => {
    const isSame = filters.sortBy === field;
    const nextDirection = isSame && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ sortBy: field, sortDirection: nextDirection });
  };

  const handleCreateSubmit = async (formData) => {
    if (onCreatePayment) {
      await onCreatePayment(formData);
      setIsCreateOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDeletePayment && deletingPayment) {
      await onDeletePayment(deletingPayment.id);
      setDeletingPayment(null);
    }
  };

  const columns = [
    {
      header: 'Payment ID',
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
        <span className="font-medium text-slate-800 max-w-[130px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Project Ref',
      accessor: 'projectId',
      cell: ({ value }) => (
        <span className="font-mono text-[11px] text-[#0284C7] bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
          {value}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      align: 'right',
      cell: ({ value }) => (
        <span className="font-bold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      cell: ({ value }) => (
        <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
          {value}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Date',
      accessor: 'paymentDate',
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
            onClick={() => setViewPayment(row)}
            className="p-1 rounded-md text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View Voucher"
          >
            <Receipt className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingPayment(row)}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Payment"
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
            icon={CreditCard}
            title="Recent Payment Transactions"
            subtitle="Customer milestone collections, subsidy transfers, and receipts"
            className="mb-0"
          />

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="self-start sm:self-auto shrink-0"
          >
            Record Payment
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search payment ID, customer or project..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={() => {
                setSearchInput('');
                onResetFilters();
              }}
              title="Reset Search and Filters"
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
        emptyTitle="No payments found"
        emptyDescription="No transactions match the selected filter parameters."
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

      {/* Payment Receipt Modal */}
      {viewPayment && (
        <Modal
          isOpen={!!viewPayment}
          onClose={() => setViewPayment(null)}
          title={`Payment Voucher: ${viewPayment.id}`}
          subtitle={`Received from ${viewPayment.customerName}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditingPayment(viewPayment);
                  setViewPayment(null);
                }}
              >
                Edit Payment
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewPayment(null)}>
                Close Voucher
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
              <span className="text-slate-500">Transaction Status</span>
              <StatusBadge status={viewPayment.paymentStatus} />
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
              <span className="text-slate-500">Total Collected</span>
              <span className="text-lg font-bold text-[#0284C7]">
                {formatCurrency(viewPayment.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Linked Project</span>
              <span className="font-mono font-medium text-slate-800">{viewPayment.projectId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Instrument / Channel</span>
              <span className="font-medium text-slate-800">{viewPayment.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Timestamp</span>
              <span className="text-slate-800">{formatDate(viewPayment.paymentDate, { includeTime: true })}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {isCreateOpen && (
        <PaymentModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPayment && (
        <ConfirmDeleteModal
          isOpen={!!deletingPayment}
          onClose={() => setDeletingPayment(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Payment Transaction"
          message={`Are you sure you want to delete payment ${deletingPayment.id} for ₹${deletingPayment.amount.toLocaleString('en-IN')}? This will reduce the recorded collections accordingly.`}
          itemIdentifier={`${deletingPayment.id} — ${deletingPayment.customerName}`}
        />
      )}
    </Card>
  );
};

export default RecentPayments;
