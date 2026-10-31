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
  ClipboardCheck,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Eye,
  Trash2,
  CalendarClock,
  ShieldAlert,
} from 'lucide-react';

import {
  fetchSurveys,
  scheduleSurvey,
  updateSurvey,
  deleteSurvey,
} from '../slices/surveySlice';
import useSalesFilters from '../hooks/useSalesFilters';
import { ROOF_TYPES, SURVEY_STATUSES } from '../utils/salesConstants';
import { validateSurveyForm } from '../utils/salesValidators';
import openLeadEnquiry from '../utils/salesNavigation';

export const SurveysPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: surveys, loading, error } = useSelector((state) => state.salesSurveys);

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [viewingSurvey, setViewingSurvey] = useState(null);
  const [reschedulingSurvey, setReschedulingSurvey] = useState(null);
  const [deletingSurvey, setDeletingSurvey] = useState(null);

  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');

  const [formData, setFormData] = useState({
    customerName: '',
    enquiryId: '',
    contact: '+91 ',
    siteLocation: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:30 AM',
    assignedSurveyor: 'Kailash Chand (Field Tech)',
    roofType: 'RCC Flat Roof',
    roofAreaSqFt: 1200,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchSurveys());
    if (searchParams.get('schedule') === 'true') {
      setIsScheduleOpen(true);
      if (searchParams.get('customer')) {
        setFormData((prev) => ({
          ...prev,
          customerName: searchParams.get('customer'),
          enquiryId: searchParams.get('enquiryId') || '',
        }));
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
    initialData: surveys,
    initialPageSize: 10,
  });

  const handleOpenSchedule = () => {
    setFormData({
      customerName: '',
      enquiryId: '',
      contact: '+91 ',
      siteLocation: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '10:30 AM',
      assignedSurveyor: 'Kailash Chand (Field Tech)',
      roofType: 'RCC Flat Roof',
      roofAreaSqFt: 1200,
      notes: '',
    });
    setFormErrors({});
    setIsScheduleOpen(true);
  };

  const handleSaveSurvey = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateSurveyForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    await dispatch(scheduleSurvey(formData));
    setIsScheduleOpen(false);
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingSurvey || !rescheduleDate) return;
    await dispatch(
      updateSurvey({
        id: reschedulingSurvey.id,
        patch: {
          scheduledDate: rescheduleDate,
          scheduledTime: rescheduleTime,
          status: 'Scheduled',
        },
      })
    );
    setReschedulingSurvey(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSurvey) return;
    await dispatch(deleteSurvey(deletingSurvey.id));
    setDeletingSurvey(null);
  };

  const columns = [
    {
      header: 'Survey ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-bold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: 'customerName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <span
            onClick={() => setViewingSurvey(row)}
            className="font-bold text-slate-900 hover:text-[#0284C7] hover:underline cursor-pointer block truncate transition-colors"
            title={`Click to view site survey brief for ${row.customerName}`}
          >
            {row.customerName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {row.enquiryId ? `Ref: ${row.enquiryId}` : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Site Location',
      accessor: 'siteLocation',
      cell: ({ value }) => (
        <div className="flex items-center gap-1 text-slate-700 text-xs max-w-[200px] truncate" title={value}>
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="truncate">{value}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled Slot',
      accessor: 'scheduledDate',
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{row.scheduledDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.scheduledTime}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Field Tech',
      accessor: 'assignedSurveyor',
      sortable: true,
      cell: ({ value }) => (
        <span className="text-slate-800 font-medium text-xs">{value}</span>
      ),
    },
    {
      header: 'Roof Structure',
      accessor: 'roofType',
      cell: ({ value, row }) => (
        <div>
          <span className="font-medium text-slate-700 text-xs block">{value}</span>
          <span className="text-[11px] text-slate-400">{row.roofAreaSqFt} sq. ft.</span>
        </div>
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
            onClick={() => setViewingSurvey(row)}
            className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition"
            title="View survey details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setReschedulingSurvey(row);
              setRescheduleDate(row.scheduledDate);
              setRescheduleTime(row.scheduledTime);
            }}
            className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
            title="Reschedule survey"
          >
            <CalendarClock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeletingSurvey(row)}
            className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Cancel survey"
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
        title="Site Survey Scheduling"
        subtitle="Dispatch field technicians for rooftop measurement, structural integrity, shadow analysis, and DISCOM feasibility"
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={loading}
        error={error}
        emptyTitle="No surveys scheduled"
        emptyMessage="Schedule a technical site survey for qualified customer leads."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer, location, surveyor..."
        filters={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0284C7]"
            >
              <option value="all">All Statuses</option>
              {SURVEY_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        }
        headerActions={
          <Button variant="primary" size="sm" onClick={handleOpenSchedule}>
            <Plus className="w-4 h-4 mr-1.5" />
            Schedule Survey
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

      {/* MODAL: Schedule Survey */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Site Feasibility Survey"
        size="lg"
      >
        <form onSubmit={handleSaveSurvey} className="space-y-4">
          <Input
            label="Customer Name"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="e.g. Mukesh Choudhary"
            error={formErrors.customerName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="+91 98290 12345"
            />
            <Input
              label="Linked Enquiry Ref"
              value={formData.enquiryId}
              onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
              placeholder="e.g. ENQ-4402"
            />
          </div>

          <Input
            label="Site Address & Location"
            required
            value={formData.siteLocation}
            onChange={(e) => setFormData({ ...formData, siteLocation: e.target.value })}
            placeholder="Full site installation address"
            error={formErrors.siteLocation}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Survey Date"
              type="date"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              error={formErrors.scheduledDate}
            />
            <Input
              label="Time Slot"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              placeholder="e.g. 11:00 AM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Roof Structure Type"
              value={formData.roofType}
              onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
              options={ROOF_TYPES}
            />
            <Input
              label="Roof Area (Sq. Ft.)"
              type="number"
              suffix="sq. ft."
              value={formData.roofAreaSqFt}
              onChange={(e) => setFormData({ ...formData, roofAreaSqFt: Number(e.target.value) })}
            />
          </div>

          <Select
            label="Assigned Field Surveyor"
            value={formData.assignedSurveyor}
            onChange={(e) => setFormData({ ...formData, assignedSurveyor: e.target.value })}
            options={[
              'Kailash Chand (Field Tech)',
              'Manoj Saini (Sr. Surveyor)',
              'Dinesh Kumar (Field Tech)',
              'Sunil Sharma (Survey Engineer)',
            ]}
          />

          <Input
            label="Survey Instructions / Shadow Hazards"
            type="textarea"
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Check for adjacent tree shadow; inspect 3-phase meter board location"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Dispatch Survey
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Survey Details */}
      <Modal
        isOpen={!!viewingSurvey}
        onClose={() => setViewingSurvey(null)}
        title={`Survey Brief: ${viewingSurvey?.id}`}
        size="md"
      >
        {viewingSurvey && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-[#F0F7FF] border border-[#BAE6FD]/80 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{viewingSurvey.customerName}</span>
                <span className="text-slate-500 font-mono text-[11px]">{viewingSurvey.enquiryId}</span>
              </div>
              <StatusBadge status={viewingSurvey.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium block">Site Address</span>
                <span className="font-semibold text-slate-800">{viewingSurvey.siteLocation}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Assigned Surveyor</span>
                <span className="font-semibold text-slate-800">{viewingSurvey.assignedSurveyor}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Scheduled Date & Time</span>
                <span className="font-semibold text-slate-800">
                  {viewingSurvey.scheduledDate} at {viewingSurvey.scheduledTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Roof Structure & Area</span>
                <span className="font-semibold text-slate-800">
                  {viewingSurvey.roofType} ({viewingSurvey.roofAreaSqFt} sq. ft.)
                </span>
              </div>
            </div>

            {viewingSurvey.shadowHazards && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-800 block flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Shadow & Safety Hazards:
                </span>
                <p className="text-amber-900 mt-0.5">{viewingSurvey.shadowHazards}</p>
              </div>
            )}

            {viewingSurvey.notes && (
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-600 block">Surveyor Field Notes:</span>
                <p className="text-slate-700 mt-0.5">{viewingSurvey.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingSurvey(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Reschedule */}
      <Modal
        isOpen={!!reschedulingSurvey}
        onClose={() => setReschedulingSurvey(null)}
        title="Reschedule Site Survey"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Reschedule site visit for{' '}
            <span className="font-bold text-slate-800">{reschedulingSurvey?.customerName}</span>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="New Date"
              type="date"
              required
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
            <Input
              label="Time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReschedulingSurvey(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRescheduleSubmit}>
              Confirm Date
            </Button>
          </div>
        </div>
      </Modal>

      {/* DIALOG: Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingSurvey}
        onClose={() => setDeletingSurvey(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Site Survey"
        message={`Are you sure you want to cancel survey ${deletingSurvey?.id} for ${deletingSurvey?.customerName}?`}
        type="danger"
        confirmText="Cancel Survey"
      />
    </PageContainer>
  );
};

export default SurveysPage;

