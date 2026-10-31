import React, { useState } from 'react';
import { Search, RotateCcw, Eye, MessageSquareMore, Phone, Mail, MapPin, FileText, Plus, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/common/Button';
import EnquiryModal from './modals/EnquiryModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';
import formatDate from '../../../utils/formatDate';
import useDebounce from '../../../hooks/useDebounce';

export const RecentEnquiries = ({
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
  onCreateEnquiry,
  onDeleteEnquiry,
}) => {
  const [searchInput, setSearchInput] = useState(filters?.search || '');
  const [viewEnquiry, setViewEnquiry] = useState(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  React.useEffect(() => {
    if (filters && debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleStatusFilterChange = (status) => {
    onFiltersChange({ status });
  };

  const handleSort = (field) => {
    const isSame = filters?.sortBy === field;
    const nextDirection = isSame && filters?.sortDirection === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ sortBy: field, sortDirection: nextDirection });
  };

  const handleCreateSubmit = async (formData) => {
    if (onCreateEnquiry) {
      await onCreateEnquiry(formData);
      setIsCreateOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (onDeleteEnquiry && deletingEnquiry) {
      await onDeleteEnquiry(deletingEnquiry.id);
      setDeletingEnquiry(null);
    }
  };

  const columns = [
    {
      header: 'Enquiry ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7] whitespace-nowrap">{value}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: 'customerName',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-semibold text-slate-800 max-w-[120px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Contact, Address & Files',
      accessor: 'contactNumber',
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[340px]">
          {/* Top: Phone Number */}
          <a
            href={`tel:${row.contactNumber}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-[#0284C7] font-mono whitespace-nowrap"
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{row.contactNumber}</span>
          </a>

          {/* Under phone number: Email, Address, and Files in ONE SINGLE ROW */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate leading-tight">
            {row.email && (
              <a
                href={`mailto:${row.email}`}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0284C7] truncate shrink-0 max-w-[130px]"
                title={row.email}
              >
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{row.email}</span>
              </a>
            )}

            {row.address && (
              <span
                className="inline-flex items-center gap-1 text-slate-600 truncate max-w-[130px]"
                title={row.address}
              >
                <span className="text-slate-300">•</span>
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{row.address}</span>
              </span>
            )}

            {row.files && (
              <span
                className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded text-[10px] font-medium border border-sky-100 shrink-0 max-w-[110px]"
                title={row.files}
              >
                <FileText className="w-3 h-3 text-[#0284C7] shrink-0" />
                <span className="truncate">{row.files}</span>
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      cell: ({ value }) => (
        <span className="text-xs font-medium text-slate-800 whitespace-nowrap">{value}</span>
      ),
    },
    {
      header: 'Source',
      accessor: 'enquirySource',
      cell: ({ value }) => (
        <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'enquiryStatus',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Received',
      accessor: 'createdDate',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(value, { format: 'short' })}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          {/* Admin can ONLY see details and delete (NO edit button) */}
          <button
            onClick={() => setViewEnquiry(row)}
            className="p-1 rounded-md text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View Lead Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingEnquiry(row)}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Lead"
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
            icon={MessageSquareMore}
            title="Recent Inbound Leads & Enquiries"
            subtitle="Prospective rooftop and commercial solar enquiries awaiting qualification"
            className="mb-0"
          />

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
            className="self-start sm:self-auto shrink-0"
          >
            Add New Lead
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search enquiry ID, customer or phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters?.status || 'all'}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Lead Statuses</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Survey Scheduled">Survey Scheduled</option>
              <option value="Quoted">Quoted</option>
            </select>

            <Button
              variant="outline"
              size="xs"
              icon={RotateCcw}
              onClick={() => {
                setSearchInput('');
                onResetFilters();
              }}
              title="Reset Filters"
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
        sortField={filters?.sortBy}
        sortDirection={filters?.sortDirection}
        onSort={handleSort}
        emptyTitle="No enquiries found"
        emptyDescription="No leads matching the selected filter criteria."
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

      {/* Enquiry Details Modal (View Only - No Edit) */}
      {viewEnquiry && (
        <Modal
          isOpen={!!viewEnquiry}
          onClose={() => setViewEnquiry(null)}
          title={`Enquiry Lead: ${viewEnquiry.id}`}
          subtitle={`Submitted by ${viewEnquiry.customerName}`}
          footer={
            <Button variant="primary" size="sm" onClick={() => setViewEnquiry(null)}>
              Close Lead
            </Button>
          }
        >
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Contact Number</span>
              <span className="font-mono font-semibold text-slate-800">{viewEnquiry.contactNumber}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Email Address</span>
              <span className="font-medium text-slate-800">{viewEnquiry.email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Site / Lead Address</span>
              <span className="text-slate-800 font-medium">{viewEnquiry.address || 'Jaipur, Rajasthan'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Attached Documents</span>
              <span className="inline-flex items-center gap-1.5 text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 font-medium">
                <FileText className="w-3.5 h-3.5 text-[#0284C7]" />
                {viewEnquiry.files || 'Electricity_Bill.pdf'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Acquisition Source</span>
              <span className="font-semibold text-slate-800">{viewEnquiry.enquirySource}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Requested Capacity</span>
              <span className="font-bold text-[#0284C7]">{viewEnquiry.capacity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Current Status</span>
              <StatusBadge status={viewEnquiry.enquiryStatus} />
            </div>
          </div>
        </Modal>
      )}

      {/* Create Inbound Lead Modal */}
      {isCreateOpen && (
        <EnquiryModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEnquiry && (
        <ConfirmDeleteModal
          isOpen={!!deletingEnquiry}
          onClose={() => setDeletingEnquiry(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Enquiry Lead"
          message={`Are you sure you want to remove enquiry lead ${deletingEnquiry.id} for ${deletingEnquiry.customerName}?`}
          itemIdentifier={`${deletingEnquiry.id} — ${deletingEnquiry.customerName}`}
        />
      )}
    </Card>
  );
};

export default RecentEnquiries;
