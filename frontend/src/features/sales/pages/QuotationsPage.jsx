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
  FileText,
  Plus,
  CheckCircle2,
  Eye,
  Trash2,
  Send,
  ShoppingCart,
  IndianRupee,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';

import {
  fetchQuotations,
  createQuotation,
  approveQuotation,
  acceptQuotation,
  deleteQuotation,
} from '../slices/quotationSlice';
import useSalesFilters from '../hooks/useSalesFilters';
import formatCurrency from '../../../utils/formatCurrency';
import formatDate from '../../../utils/formatDate';
import openLeadEnquiry from '../utils/salesNavigation';
import {
  SOLAR_PANEL_PRESETS,
  INVERTER_PRESETS,
  QUOTATION_STATUSES,
} from '../utils/salesConstants';
import { calculateEstimatedSubsidy } from '../utils/salesHelpers';
import { validateQuotationForm } from '../utils/salesValidators';

export const QuotationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: quotations, loading, error } = useSelector((state) => state.salesQuotations);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Accepted' | 'Sent' | 'Approved' | 'Draft'
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [deletingQuotation, setDeletingQuotation] = useState(null);
  const [acceptingQuotation, setAcceptingQuotation] = useState(null);

  // Dynamic quotation creation state
  const [formData, setFormData] = useState({
    customerName: '',
    enquiryId: '',
    contact: '+91 ',
    systemCapacity: 10.0,
    panelModel: SOLAR_PANEL_PRESETS[0].name,
    inverterModel: INVERTER_PRESETS[2].name,
    panelCount: 20,
    structureCost: 38000,
    bosCost: 28000,
    installationCost: 35000,
    subsidy: 78000,
    discount: 10000,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchQuotations());
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
      if (searchParams.get('customer')) {
        setFormData((prev) => ({
          ...prev,
          customerName: searchParams.get('customer'),
          enquiryId: searchParams.get('enquiryId') || '',
        }));
      }
    }
  }, [dispatch, searchParams]);

  // Tab filtering
  const tabFilteredData = quotations.filter((q) => {
    if (activeTab === 'all') return true;
    return String(q.status).toLowerCase() === String(activeTab).toLowerCase();
  });

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
    initialData: tabFilteredData,
    initialPageSize: 10,
  });

  // Calculate dynamic live quotation amounts
  const selectedPanel = SOLAR_PANEL_PRESETS.find((p) => p.name === formData.panelModel) || SOLAR_PANEL_PRESETS[0];
  const selectedInverter = INVERTER_PRESETS.find((i) => i.name === formData.inverterModel) || INVERTER_PRESETS[0];

  const panelsLineTotal = formData.panelCount * selectedPanel.unitPrice;
  const inverterLineTotal = selectedInverter.unitPrice;
  const subtotal =
    panelsLineTotal +
    inverterLineTotal +
    Number(formData.structureCost || 0) +
    Number(formData.bosCost || 0) +
    Number(formData.installationCost || 0);

  const discount = Number(formData.discount || 0);
  const subsidy = Number(formData.subsidy || 0);
  const taxAmount = Math.round((subtotal - discount) * 0.138); // 13.8% composite GST
  const finalAmount = Math.max(0, subtotal - discount - subsidy + taxAmount);

  const handleOpenCreate = () => {
    setFormData({
      customerName: '',
      enquiryId: '',
      contact: '+91 ',
      systemCapacity: 10.0,
      panelModel: SOLAR_PANEL_PRESETS[0].name,
      inverterModel: INVERTER_PRESETS[2].name,
      panelCount: 20,
      structureCost: 38000,
      bosCost: 28000,
      installationCost: 35000,
      subsidy: 78000,
      discount: 10000,
      notes: '',
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();

    const items = [
      {
        name: `${selectedPanel.name} (${formData.panelCount} Nos)`,
        quantity: formData.panelCount,
        unitPrice: selectedPanel.unitPrice,
        lineTotal: panelsLineTotal,
      },
      {
        name: selectedInverter.name,
        quantity: 1,
        unitPrice: selectedInverter.unitPrice,
        lineTotal: inverterLineTotal,
      },
      {
        name: 'Galvanized Super Structure Mounting Hardware',
        quantity: 1,
        unitPrice: formData.structureCost,
        lineTotal: formData.structureCost,
      },
      {
        name: 'Balance of System (BOS), ACDB/DCDB, Protection',
        quantity: 1,
        unitPrice: formData.bosCost,
        lineTotal: formData.bosCost,
      },
      {
        name: 'Turnkey Installation, Testing & DISCOM Net-Metering Filing',
        quantity: 1,
        unitPrice: formData.installationCost,
        lineTotal: formData.installationCost,
      },
    ];

    const { isValid, errors } = validateQuotationForm({
      customerName: formData.customerName,
      systemCapacity: formData.systemCapacity,
      items,
    });

    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    await dispatch(
      createQuotation({
        customerName: formData.customerName,
        enquiryId: formData.enquiryId,
        contact: formData.contact,
        systemCapacity: formData.systemCapacity,
        items,
        subtotal,
        subsidy,
        discount,
        taxRate: 13.8,
        taxAmount,
        finalAmount,
        status: 'Sent',
        approvalStatus: 'Approved',
        notes: formData.notes,
      })
    );

    setIsCreateOpen(false);
  };

  const handleAcceptQuotationSubmit = async () => {
    if (!acceptingQuotation) return;
    await dispatch(
      acceptQuotation({
        id: acceptingQuotation.id,
        convertToOrder: true,
      })
    );
    setAcceptingQuotation(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuotation) return;
    await dispatch(deleteQuotation(deletingQuotation.id));
    setDeletingQuotation(null);
  };

  const columns = [
    {
      header: 'Quotation ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value, row }) => (
        <span
          onClick={() => navigate(`/sales/quotations/${row.id}`)}
          className="font-mono text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
          title={`View quotation ${value}`}
        >
          {value}
        </span>
      ),
    },
    {
      header: 'Customer Details',
      accessor: 'customerName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <span
            onClick={() => setViewingQuotation(row)}
            className="font-bold text-slate-900 hover:text-[#0284C7] hover:underline cursor-pointer block truncate transition-colors"
            title={`Click to view proposal summary for ${row.customerName}`}
          >
            {row.customerName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {row.enquiryId ? `Enq: ${row.enquiryId}` : 'Direct Lead'}
          </span>
        </div>
      ),
    },
    {
      header: 'Capacity',
      accessor: 'systemCapacity',
      sortable: true,
      cell: ({ value, row }) => (
        <span className="font-bold text-slate-800 text-xs bg-sky-50 px-3 py-1 rounded-full border border-sky-100 min-w-[115px] inline-flex items-center justify-center whitespace-nowrap">
          {value || row.capacity} kW
        </span>
      ),
    },
    {
      header: 'Quotation Value',
      accessor: 'subtotal',
      sortable: true,
      cell: ({ value, row }) => (
        <span className="text-slate-600 text-xs font-medium">
          {formatCurrency(value || row.totalCost)}
        </span>
      ),
    },
    {
      header: 'Net Payable (Client)',
      accessor: 'finalAmount',
      sortable: true,
      cell: ({ value, row }) => (
        <div>
          <span className="font-extrabold text-slate-900 text-xs block">
            {formatCurrency(value || row.netPayable)}
          </span>
          {(row.subsidy > 0) && (
            <span className="text-[10px] text-emerald-600 font-bold block">
              Subsidy ₹{row.subsidy / 1000}k Applied
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Date Created',
      accessor: 'createdDate',
      sortable: true,
      cell: ({ value, row }) => (
        <span className="text-slate-500 text-xs">{formatDate(value || row.date)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/sales/quotations/${row.id}`)}
            className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition"
            title="View itemized BOQ proposal"
          >
            <Eye className="w-4 h-4" />
          </button>

          {row.status !== 'Accepted' && (
            <button
              onClick={() => setAcceptingQuotation(row)}
              className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              title="Mark Accepted & Convert into Order"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setDeletingQuotation(row)}
            className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete quotation"
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
        title="Quotation & BOQ Management"
        subtitle="Generate itemized solar engineering proposals, PM Surya Ghar subsidy estimations, and commercial contracts"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { key: 'all', label: 'All Quotations' },
          { key: 'Accepted', label: 'Accepted Quotations' },
          { key: 'Sent', label: 'Sent to Customer' },
          { key: 'Approved', label: 'Approved Proposals' },
          { key: 'Draft', label: 'Drafts' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
              activeTab === tab.key
                ? 'bg-[#0284C7] text-white shadow-card'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={loading}
        error={error}
        emptyTitle="No quotations in this category"
        emptyMessage="Generate an engineering proposal for qualified customers."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer, ID, capacity..."
        headerActions={
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Quotation
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

      {/* MODAL: Create Quotation */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Solar Proposal & BOQ"
        size="lg"
      >
        <form onSubmit={handleSaveQuotation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              required
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="e.g. Rajesh Kumar Sharma"
              error={formErrors.customerName}
            />
            <Input
              label="Linked Enquiry ID"
              value={formData.enquiryId}
              onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
              placeholder="e.g. ENQ-4401"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="System Capacity (kW)"
              type="number"
              required
              suffix="kW"
              value={formData.systemCapacity}
              onChange={(e) => {
                const cap = Number(e.target.value);
                const count = Math.ceil((cap * 1000) / 540);
                const estSubsidy = calculateEstimatedSubsidy(cap, 'Residential');
                setFormData({
                  ...formData,
                  systemCapacity: cap,
                  panelCount: count,
                  subsidy: estSubsidy,
                });
              }}
              error={formErrors.systemCapacity}
            />

            <Select
              label="Solar PV Module"
              value={formData.panelModel}
              onChange={(e) => setFormData({ ...formData, panelModel: e.target.value })}
              options={SOLAR_PANEL_PRESETS.map((p) => p.name)}
            />

            <Select
              label="Solar Inverter"
              value={formData.inverterModel}
              onChange={(e) => setFormData({ ...formData, inverterModel: e.target.value })}
              options={INVERTER_PRESETS.map((i) => i.name)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <Input
              label="Panels Count"
              type="number"
              min="1"
              value={formData.panelCount}
              onChange={(e) => setFormData({ ...formData, panelCount: Number(e.target.value) })}
            />
            <Input
              label="Structure Cost"
              type="number"
              prefix="₹"
              value={formData.structureCost}
              onChange={(e) => setFormData({ ...formData, structureCost: Number(e.target.value) })}
            />
            <Input
              label="BOS & Wiring"
              type="number"
              prefix="₹"
              value={formData.bosCost}
              onChange={(e) => setFormData({ ...formData, bosCost: Number(e.target.value) })}
            />
            <Input
              label="Installation"
              type="number"
              prefix="₹"
              value={formData.installationCost}
              onChange={(e) => setFormData({ ...formData, installationCost: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Govt PM Surya Ghar Subsidy"
              type="number"
              prefix="₹"
              value={formData.subsidy}
              onChange={(e) => setFormData({ ...formData, subsidy: Number(e.target.value) })}
              helperText="Residential: ₹78k for 3kW+"
            />
            <Input
              label="Special Discount"
              type="number"
              prefix="₹"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            />
          </div>

          {/* Live Calculation Summary */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F0F7FF] to-white border border-[#BAE6FD] text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Subtotal Components:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-emerald-600 font-semibold">Government MNRE Subsidy:</span>
              <span className="font-bold text-emerald-600">- {formatCurrency(subsidy)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">GST Tax (13.8% Composite):</span>
              <span className="font-semibold text-slate-800">+ {formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-1">
              <span className="text-sm font-bold text-slate-900">Final Net Payable:</span>
              <span className="text-base font-extrabold text-[#0284C7]">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate & Send Quotation
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Quotation Summary (Stay on same tab) */}
      <Modal
        isOpen={!!viewingQuotation}
        onClose={() => setViewingQuotation(null)}
        title={`Solar Proposal & BOQ Summary: ${viewingQuotation?.id}`}
        size="md"
      >
        {viewingQuotation && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F0F7FF] to-white border border-[#BAE6FD] flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{viewingQuotation.customerName}</p>
                <p className="text-slate-500 font-mono text-[11px]">
                  Enquiry: {viewingQuotation.enquiryId || 'Direct Lead'} • Date: {formatDate(viewingQuotation.createdAt || viewingQuotation.date || new Date().toISOString())}
                </p>
              </div>
              <StatusBadge status={viewingQuotation.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium block">System Capacity</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {viewingQuotation.systemCapacity} kW System
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Contract Status</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{viewingQuotation.status}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Solar PV Module</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {viewingQuotation.panelModel || 'Adani 540W Mono PERC'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Solar Inverter</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {viewingQuotation.inverterModel || 'Growatt 10kW 3-Phase Inverter'}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Subtotal Components:</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(viewingQuotation.subtotal || viewingQuotation.amount || 446000)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-emerald-600 font-semibold">Government MNRE Subsidy:</span>
                <span className="font-bold text-emerald-600">
                  - {formatCurrency(viewingQuotation.subsidy || 78000)}
                </span>
              </div>
              {Number(viewingQuotation.discount) > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-amber-600 font-semibold">Special Discount:</span>
                  <span className="font-bold text-amber-600">
                    - {formatCurrency(viewingQuotation.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-slate-900">Final Net Payable:</span>
                <span className="text-base font-extrabold text-[#0284C7]">
                  {formatCurrency(viewingQuotation.finalAmount || viewingQuotation.netPayable || viewingQuotation.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {viewingQuotation.status !== 'Accepted' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setAcceptingQuotation(viewingQuotation);
                    setViewingQuotation(null);
                  }}
                >
                  Accept & Convert into Order
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate(`/sales/quotations/${viewingQuotation.id}`);
                }}
              >
                Full BOQ Page
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewingQuotation(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DIALOG: Confirm Accept Quotation */}
      <ConfirmDialog
        isOpen={!!acceptingQuotation}
        onClose={() => setAcceptingQuotation(null)}
        onConfirm={handleAcceptQuotationSubmit}
        title="Accept Quotation & Convert into Order"
        message={`Mark quotation ${acceptingQuotation?.id} (${formatCurrency(
          acceptingQuotation?.finalAmount || acceptingQuotation?.netPayable
        )}) as Accepted by ${acceptingQuotation?.customerName}? This will automatically convert this deal into an active Solar Order with milestone tracking.`}
        type="success"
        confirmText="Accept & Convert into Order"
      />

      {/* DIALOG: Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingQuotation}
        onClose={() => setDeletingQuotation(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quotation"
        message={`Are you sure you want to remove quotation ${deletingQuotation?.id}?`}
        type="danger"
        confirmText="Delete Quotation"
      />
    </PageContainer>
  );
};

export default QuotationsPage;

