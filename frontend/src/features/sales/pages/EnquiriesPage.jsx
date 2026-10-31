import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import {
  MessageSquareMore,
  Plus,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  ClipboardCheck,
  FileText,
  Calendar,
} from 'lucide-react';

import {
  fetchEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
} from '../slices/enquirySlice';
import useSalesFilters from '../hooks/useSalesFilters';
import { ENQUIRY_SOURCES, ENQUIRY_STATUSES } from '../utils/salesConstants';
import { validateEnquiryForm } from '../utils/salesValidators';
import formatDate from '../../../utils/formatDate';

export const EnquiriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: enquiries, loading, error } = useSelector((state) => state.salesEnquiries);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingEnquiry, setDeletingEnquiry] = useState(null);
  const [statusChangeEnquiry, setStatusChangeEnquiry] = useState(null);
  const [newSelectedStatus, setNewSelectedStatus] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '+91 ',
    email: '',
    source: 'Website Form',
    capacity: 5.0,
    location: 'Jaipur, Rajasthan',
    propertyType: 'Residential',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchEnquiries());
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
      if (searchParams.get('customer')) {
        setFormData((prev) => ({ ...prev, customerName: searchParams.get('customer') }));
      }
    }
  }, [dispatch, searchParams]);

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
    initialData: enquiries,
    initialPageSize: 10,
  });

  const handleOpenCreate = () => {
    setFormData({
      customerName: '',
      contactNumber: '+91 ',
      email: '',
      source: 'Website Form',
      capacity: 5.0,
      location: 'Jaipur, Rajasthan',
      propertyType: 'Residential',
      notes: '',
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleSaveEnquiry = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateEnquiryForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    await dispatch(
      createEnquiry({
        customerName: formData.customerName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.location,
        enquirySource: formData.source,
        capacity: `${formData.capacity} kW Rooftop`,
        enquiryStatus: 'New',
        notes: formData.notes,
      })
    );
    setIsCreateOpen(false);
  };

  const handleStatusChangeSubmit = async () => {
    if (!statusChangeEnquiry || !newSelectedStatus) return;
    await dispatch(
      updateEnquiryStatus({
        id: statusChangeEnquiry.id,
        status: newSelectedStatus,
      })
    );
    setStatusChangeEnquiry(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEnquiry) return;
    await dispatch(deleteEnquiry(deletingEnquiry.id));
    setDeletingEnquiry(null);
  };

  const columns = [
    {
      header: 'Enquiry Ref',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-bold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer Details',
      accessor: 'customerName',
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-[200px]">
          <span className="font-semibold text-slate-900 block truncate">{row.customerName}</span>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#0284C7]" />
              {row.contactNumber || row.phone}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Lead Source',
      accessor: 'enquirySource',
      sortable: true,
      cell: ({ value, row }) => (
        <span className="text-slate-700 text-xs font-medium">
          {value || row.source || 'Website Form'}
        </span>
      ),
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-bold text-slate-800 text-xs bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
          {value}
        </span>
      ),
    },
    {
      header: 'Site Location',
      accessor: 'address',
      cell: ({ value, row }) => (
        <div className="flex items-center gap-1 text-slate-600 text-xs max-w-[160px] truncate" title={value || row.location}>
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{value || row.location || 'Jaipur, Rajasthan'}</span>
        </div>
      ),
    },
    {
      header: 'Date Logged',
      accessor: 'createdDate',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-slate-500 text-xs">{formatDate(value)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'enquiryStatus',
      cell: ({ value, row }) => {
        const current = value || row.status || 'New';
        return (
          <button
            onClick={() => {
              setStatusChangeEnquiry(row);
              setNewSelectedStatus(current);
            }}
            className="text-left group"
            title="Click to update status"
          >
            <StatusBadge status={current} />
          </button>
        );
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/sales/enquiries/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition"
            title="View enquiry details & timeline"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              navigate(
                `/sales/surveys?schedule=true&enquiryId=${row.id}&customer=${encodeURIComponent(
                  row.customerName
                )}`
              )
            }
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            title="Schedule Site Survey"
          >
            <ClipboardCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              navigate(
                `/sales/quotations?create=true&enquiryId=${row.id}&customer=${encodeURIComponent(
                  row.customerName
                )}`
              )
            }
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            title="Create Solar Quotation"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingEnquiry(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Remove lead"
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
        title="Enquiry Pipeline Management"
        subtitle="Track inbound consumer solar inquiries from website, direct leads, campaigns, and referrals"
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={loading}
        error={error}
        emptyTitle="No solar enquiries found"
        emptyMessage="Create a new lead enquiry to begin the sales qualification process."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by customer, phone, location..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0284C7]"
            >
              <option value="all">All Stages</option>
              {ENQUIRY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        }
        headerActions={
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Enquiry
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

      {/* MODAL: Create Enquiry */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Solar Inbound Lead"
        size="md"
      >
        <form onSubmit={handleSaveEnquiry} className="space-y-4">
          <Input
            label="Customer / Company Name"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="e.g. Ramesh Chandra / Apex Tech"
            error={formErrors.customerName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              required
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="+91 98290 12345"
              error={formErrors.contactNumber}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="client@gmail.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Solar System Capacity (kW)"
              type="number"
              required
              suffix="kW"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              error={formErrors.capacity}
            />
            <Select
              label="Lead Generation Source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              options={ENQUIRY_SOURCES}
            />
          </div>

          <Input
            label="Site Address / City"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Malviya Nagar, Jaipur, Rajasthan"
            error={formErrors.location}
          />

          <Input
            label="Consumption / Technical Notes"
            type="textarea"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Average bi-monthly bill ₹15,000. Customer wants rooftop subsidy."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Enquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Update Status */}
      <Modal
        isOpen={!!statusChangeEnquiry}
        onClose={() => setStatusChangeEnquiry(null)}
        title={`Update Stage: ${statusChangeEnquiry?.id}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Select the new pipeline stage for customer{' '}
            <span className="font-bold text-slate-900">{statusChangeEnquiry?.customerName}</span>:
          </p>

          <Select
            label="Pipeline Status"
            value={newSelectedStatus}
            onChange={(e) => setNewSelectedStatus(e.target.value)}
            options={ENQUIRY_STATUSES}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setStatusChangeEnquiry(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleStatusChangeSubmit}>
              Update Stage
            </Button>
          </div>
        </div>
      </Modal>

      {/* DIALOG: Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingEnquiry}
        onClose={() => setDeletingEnquiry(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Enquiry Record"
        message={`Are you sure you want to delete lead enquiry ${deletingEnquiry?.id} for ${deletingEnquiry?.customerName}?`}
        type="danger"
        confirmText="Delete Enquiry"
      />
    </PageContainer>
  );
};

export default EnquiriesPage;

