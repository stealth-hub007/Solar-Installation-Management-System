import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../dashboard/components/modals/ConfirmDeleteModal';
import { Search, Phone, MapPin, Mail, Eye, Trash2 } from 'lucide-react';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Load customers directly from persistent storageService
  const loadCustomers = () => {
    const list = storageService.getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDeleteConfirm = () => {
    if (!deletingCustomer) return;
    storageService.deleteCustomer(deletingCustomer.id);
    loadCustomers();
    setDeletingCustomer(null);
    if (viewCustomer && viewCustomer.id === deletingCustomer.id) {
      setViewCustomer(null);
    }
  };

  const paginated = paginateCollection(customers, {
    page,
    pageSize,
    search: debouncedSearch,
    filterKey: 'status',
    filterVal: statusFilter,
  });

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      nowrap: true,
      headerClassName: 'w-20',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'name',
      headerClassName: 'min-w-[130px]',
      cell: ({ row }) => (
        <div className="max-w-[160px]">
          <span className="font-semibold text-slate-800 block truncate" title={row.name}>{row.name}</span>
          <span className="text-[11px] text-slate-400 font-normal block truncate">{row.type}</span>
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: 'phone',
      headerClassName: 'min-w-[130px]',
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-[140px]">
          <a
            href={`tel:${row.phone}`}
            className="flex items-center gap-1 text-xs text-slate-700 hover:text-[#0284C7] font-mono whitespace-nowrap"
          >
            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{row.phone}</span>
          </a>
          {row.email && (
            <span
              className="text-[11px] text-slate-400 block truncate"
              title={row.email}
            >
              {row.email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'city',
      headerClassName: 'min-w-[120px]',
      cell: ({ row }) => (
        <div className="max-w-[140px]">
          <span className="flex items-center gap-1 text-xs text-slate-700 font-medium truncate" title={row.city}>
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.city}</span>
          </span>
          {row.address && row.address !== row.city && (
            <span className="text-[11px] text-slate-400 block truncate pl-4" title={row.address}>
              {row.address}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Sites',
      accessor: 'projectCount',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ value, row }) => (
        <div className="text-center">
          <span className="text-xs font-semibold text-slate-800 block whitespace-nowrap">
            {value || 0} site
          </span>
          <span className="text-[10px] text-slate-400 font-medium block whitespace-nowrap">({row.totalCapacity} kW)</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setViewCustomer(row)}
            className="p-1 rounded-md text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View Customer Profile"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingCustomer(row)}
            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Customer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Customer Management"
        subtitle="Maintain KYC documentation, registered solar consumer accounts, and installed rooftop sites"
      />

      <Card padding={false} className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search customer name, phone or city..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Consumer Statuses</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={paginated.data}
          emptyTitle="No customers found"
          emptyDescription="No customer records match your filter criteria."
        />

        <TablePagination
          currentPage={paginated.pagination.page}
          pageSize={paginated.pagination.pageSize}
          totalRecords={paginated.pagination.totalRecords}
          totalPages={paginated.pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPage(1);
          }}
        />
      </Card>

      {/* Customer Detail Modal */}
      {viewCustomer && (
        <Modal
          isOpen={!!viewCustomer}
          onClose={() => setViewCustomer(null)}
          title={`Customer Record: ${viewCustomer.id}`}
          subtitle={viewCustomer.name}
          footer={
            <div className="flex items-center justify-end w-full">
              <Button variant="primary" size="sm" onClick={() => setViewCustomer(null)}>
                Close Profile
              </Button>
            </div>
          }
        >
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Consumer Category</span>
              <span className="font-semibold text-slate-800">{viewCustomer.type}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Contact Number</span>
              <span className="font-mono text-slate-800">{viewCustomer.phone}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Email Address</span>
              <span className="text-slate-800">{viewCustomer.email || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">City / Region</span>
              <span className="text-slate-800">{viewCustomer.city}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Site Address</span>
              <span className="text-slate-800">{viewCustomer.address || viewCustomer.city}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Installed Solar Capacity</span>
              <span className="font-bold text-[#0284C7]">{viewCustomer.totalCapacity} kW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Account Status</span>
              <StatusBadge status={viewCustomer.status} />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Customer Confirmation */}
      {deletingCustomer && (
        <ConfirmDeleteModal
          isOpen={!!deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Customer Record"
          message={`Are you sure you want to remove customer "${deletingCustomer.name}"? This action will remove the record from SIMS directory.`}
          itemIdentifier={deletingCustomer.name}
        />
      )}
    </PageContainer>
  );
};

export default CustomersPage;
