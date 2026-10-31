import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import { Users, Plus, Phone, Mail, MapPin, Eye, Edit2, Trash2 } from 'lucide-react';

import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../slices/customerSlice';
import useSalesFilters from '../hooks/useSalesFilters';
import { CUSTOMER_TYPES, CUSTOMER_STATUSES } from '../utils/salesConstants';
import { validateCustomerForm } from '../utils/salesValidators';
import openLeadEnquiry from '../utils/salesNavigation';

export const CustomersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: customers, loading, error } = useSelector((state) => state.salesCustomers);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '+91 ',
    email: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: '',
    type: 'Residential',
    status: 'Active',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortColumn,
    sortDirection,
    handleSort,
    paginatedData,
    totalRecords,
    totalPages,
  } = useSalesFilters({
    initialData: customers,
    initialPageSize: 10,
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '+91 ',
      email: '',
      city: 'Jaipur',
      state: 'Rajasthan',
      address: '',
      type: 'Residential',
      status: 'Active',
      notes: '',
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      city: customer.city || '',
      state: customer.state || 'Rajasthan',
      address: customer.address || '',
      type: customer.type || 'Residential',
      status: customer.status || 'Active',
      notes: customer.notes || '',
    });
    setFormErrors({});
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateCustomerForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    if (editingCustomer) {
      await dispatch(updateCustomer({ id: editingCustomer.id, patch: formData }));
      setEditingCustomer(null);
    } else {
      await dispatch(createCustomer(formData));
      setIsCreateOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    await dispatch(deleteCustomer(deletingCustomer.id));
    setDeletingCustomer(null);
  };

  const columns = [
    {
      header: 'Customer ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value, row }) => (
        <span
          onClick={() => navigate(`/sales/customers/${row.id}`)}
          className="font-mono text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
          title={`View customer profile for ${row.name}`}
        >
          {value}
        </span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: 'name',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <span
            onClick={() => openLeadEnquiry(navigate, { ...row, customerId: row.id, customerName: row.name })}
            className="font-bold text-slate-900 hover:text-[#0284C7] hover:underline cursor-pointer block truncate transition-colors"
            title={`Click to open enquiry/timeline for ${row.name}`}
          >
            {row.name}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Managed Client</span>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'phone',
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{row.phone}</span>
          </div>
          {row.email && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[150px]">{row.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'City / Location',
      accessor: 'city',
      sortable: true,
      cell: ({ value, row }) => (
        <div className="flex items-center gap-1 text-slate-700 text-xs truncate">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{value || row.address || 'Rajasthan'}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      sortable: true,
      cell: ({ value }) => (
        <span className="h-6 px-3 rounded-full text-xs font-semibold bg-sky-50 text-[#0284C7] border border-sky-100 min-w-[100px] inline-flex items-center justify-center whitespace-nowrap">
          {value || 'Residential'}
        </span>
      ),
    },
    {
      header: 'Solar Capacity',
      accessor: 'totalCapacity',
      sortable: true,
      cell: ({ value, row }) => {
        const cap = value ?? row.totalCapacity ?? row.capacity;
        const displayCap = cap ? `${String(cap).replace(/\.0$/, '')} kW` : '—';
        return <span className="font-semibold text-slate-800 text-xs">{displayCap}</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value || 'Active'} />,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/sales/customers/${row.id}`)}
            className="p-1 rounded-md text-slate-400 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View 360 customer profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
            title="Edit customer details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingCustomer(row)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete customer record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Customer Management"
        subtitle="Maintain client accounts, KYC details, installed systems, and sales lead history"
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={loading}
        error={error}
        emptyTitle="No customers registered yet"
        emptyMessage="Add your first customer account to begin generating solar quotations."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, phone, city..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0284C7]"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="In Progress">In Progress</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        }
        headerActions={
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Customer
          </Button>
        }
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* MODAL: Create / Edit Customer */}
      <Modal
        isOpen={isCreateOpen || !!editingCustomer}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.id}` : 'Create New Customer'}
        size="md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <Input
            label="Customer / Company Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Rajesh Kumar Sharma"
            error={formErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98290 12345"
              error={formErrors.phone}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="client@example.com"
              error={formErrors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Customer Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={CUSTOMER_TYPES}
            />
            <Select
              label="Account Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={CUSTOMER_STATUSES}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Jaipur"
              error={formErrors.city}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Rajasthan"
            />
          </div>

          <Input
            label="Site Address"
            type="textarea"
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Complete address with landmark"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DIALOG: Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer Account"
        message={`Are you sure you want to remove ${deletingCustomer?.name} (${deletingCustomer?.id})? This will permanently erase the customer record from local storage.`}
        type="danger"
        confirmText="Delete Record"
      />
    </PageContainer>
  );
};

export default CustomersPage;

