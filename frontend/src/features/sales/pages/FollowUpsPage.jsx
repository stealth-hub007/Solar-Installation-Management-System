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
  PhoneCall,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarClock,
  Trash2,
  User,
  Phone,
} from 'lucide-react';

import {
  fetchFollowUps,
  createFollowUp,
  completeFollowUp,
  rescheduleFollowUp,
  deleteFollowUp,
} from '../slices/followUpSlice';
import useSalesFilters from '../hooks/useSalesFilters';
import { FOLLOWUP_TYPES, FOLLOWUP_PRIORITIES } from '../utils/salesConstants';
import { validateFollowUpForm } from '../utils/salesValidators';
import openLeadEnquiry from '../utils/salesNavigation';

export const FollowUpsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: followUps, loading, error } = useSelector((state) => state.salesFollowUps);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [viewingFollowUp, setViewingFollowUp] = useState(null);
  const [completingItem, setCompletingItem] = useState(null);
  const [reschedulingItem, setReschedulingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    enquiryId: '',
    contact: '+91 ',
    followUpDate: new Date().toISOString().split('T')[0],
    followUpTime: '11:00 AM',
    type: 'Phone Call',
    purpose: '',
    priority: 'Medium',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchFollowUps());
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

  // Tab filtering
  const todayStr = new Date().toISOString().split('T')[0];
  const tabFilteredData = followUps.filter((f) => {
    if (activeTab === 'today') return f.followUpDate === todayStr && f.status !== 'Completed';
    if (activeTab === 'overdue') return f.status === 'Overdue';
    if (activeTab === 'completed') return f.status === 'Completed';
    if (activeTab === 'upcoming') return f.followUpDate > todayStr && f.status !== 'Completed';
    return true;
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

  const handleOpenSchedule = () => {
    setFormData({
      customerName: '',
      enquiryId: '',
      contact: '+91 ',
      followUpDate: new Date().toISOString().split('T')[0],
      followUpTime: '11:00 AM',
      type: 'Phone Call',
      purpose: '',
      priority: 'Medium',
      notes: '',
    });
    setFormErrors({});
    setIsScheduleOpen(true);
  };

  const handleSaveFollowUp = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateFollowUpForm(formData);
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    await dispatch(createFollowUp(formData));
    setIsScheduleOpen(false);
  };

  const handleCompleteSubmit = async () => {
    if (!completingItem) return;
    await dispatch(
      completeFollowUp({
        id: completingItem.id,
        outcomeNotes,
      })
    );
    setCompletingItem(null);
    setOutcomeNotes('');
  };

  const handleRescheduleSubmit = async () => {
    if (!reschedulingItem || !rescheduleDate) return;
    await dispatch(
      rescheduleFollowUp({
        id: reschedulingItem.id,
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        notes: rescheduleNotes,
      })
    );
    setReschedulingItem(null);
    setRescheduleDate('');
    setRescheduleNotes('');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    await dispatch(deleteFollowUp(deletingItem.id));
    setDeletingItem(null);
  };

  const columns = [
    {
      header: 'Follow-up ID',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-bold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <span
            onClick={() => setViewingFollowUp(row)}
            className="font-bold text-slate-900 hover:text-[#0284C7] hover:underline cursor-pointer block truncate transition-colors"
            title={`Click to view follow-up task details for ${row.customerName}`}
          >
            {row.customerName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {row.enquiryId ? `Enq: ${row.enquiryId}` : 'Direct Client'}
          </span>
        </div>
      ),
    },
    {
      header: 'Scheduled Date & Time',
      accessor: 'followUpDate',
      sortable: true,
      cell: ({ row }) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{row.followUpDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{row.followUpTime}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Channel Type',
      accessor: 'type',
      sortable: true,
      cell: ({ value }) => (
        <span className="h-6 px-3 rounded-full text-xs font-semibold bg-sky-50 text-[#0284C7] border border-sky-100 min-w-[90px] inline-flex items-center justify-center whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      header: 'Purpose / Discussion Agenda',
      accessor: 'purpose',
      cell: ({ value, row }) => (
        <div className="max-w-[240px]">
          <p className="text-xs text-slate-800 font-medium line-clamp-1">{value}</p>
          {row.notes && <p className="text-[11px] text-slate-400 line-clamp-1">{row.notes}</p>}
        </div>
      ),
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      cell: ({ value }) => (
        <span
          className={`min-w-[70px] h-6 inline-flex items-center justify-center px-2.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${
            value === 'High'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : value === 'Low'
              ? 'bg-slate-50 text-slate-600 border-slate-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {value}
        </span>
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
          {row.status !== 'Completed' && (
            <button
              onClick={() => {
                setCompletingItem(row);
                setOutcomeNotes('');
              }}
              className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
              title="Mark as completed"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {row.status !== 'Completed' && (
            <button
              onClick={() => {
                setReschedulingItem(row);
                setRescheduleDate(row.followUpDate);
                setRescheduleTime(row.followUpTime);
              }}
              className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 rounded-lg transition"
              title="Reschedule follow-up"
            >
              <CalendarClock className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setDeletingItem(row)}
            className="w-7.5 h-7.5 inline-flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Cancel / delete follow-up"
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
        title="Follow-up Management"
        subtitle="Coordinate prospective buyer meetings, call schedules, proposal negotiations, and closure reminders"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'today', label: "Today's Schedule" },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'completed', label: 'Completed' },
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
        emptyTitle="No follow-up records"
        emptyMessage="Schedule a customer call or meeting to keep the sales pipeline moving forward."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search customer, purpose, type..."
        headerActions={
          <Button variant="primary" size="sm" onClick={handleOpenSchedule}>
            <Plus className="w-4 h-4 mr-1.5" />
            Schedule Follow-up
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

      {/* MODAL: Schedule Follow-up */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Customer Follow-up"
        size="md"
      >
        <form onSubmit={handleSaveFollowUp} className="space-y-4">
          <Input
            label="Customer Name"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Customer / Company Name"
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
              label="Linked Enquiry Reference"
              value={formData.enquiryId}
              onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
              placeholder="e.g. ENQ-4401"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Follow-up Date"
              type="date"
              required
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              error={formErrors.followUpDate}
            />
            <Input
              label="Time Slot"
              value={formData.followUpTime}
              onChange={(e) => setFormData({ ...formData, followUpTime: e.target.value })}
              placeholder="e.g. 11:30 AM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Channel Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={FOLLOWUP_TYPES}
            />
            <Select
              label="Priority Level"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={FOLLOWUP_PRIORITIES}
            />
          </div>

          <Input
            label="Follow-up Objective / Agenda"
            required
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            placeholder="e.g. Walkthrough quotation with business owner"
            error={formErrors.purpose}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsScheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Follow-up
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Follow-up Details (Stay on same tab) */}
      <Modal
        isOpen={!!viewingFollowUp}
        onClose={() => setViewingFollowUp(null)}
        title={`Follow-up Task Details: ${viewingFollowUp?.id}`}
        size="md"
      >
        {viewingFollowUp && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F0F7FF] to-white border border-[#BAE6FD] flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">{viewingFollowUp.customerName}</p>
                <p className="text-slate-500 font-mono text-[11px]">
                  Enquiry Ref: {viewingFollowUp.enquiryId || 'Direct Client'} • Contact: {viewingFollowUp.contact}
                </p>
              </div>
              <StatusBadge status={viewingFollowUp.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium block">Scheduled Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                  {viewingFollowUp.followUpDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Scheduled Time</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {viewingFollowUp.followUpTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Channel Type</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{viewingFollowUp.type}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Task Priority</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold mt-0.5 ${
                  viewingFollowUp.priority === 'High'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {viewingFollowUp.priority}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                Discussion Agenda / Objective
              </span>
              <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200 font-medium">
                {viewingFollowUp.purpose}
              </p>
            </div>

            {viewingFollowUp.notes && (
              <div>
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Historical Outcome / Notes
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {viewingFollowUp.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              {viewingFollowUp.status !== 'Completed' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReschedulingItem(viewingFollowUp);
                      setRescheduleDate(viewingFollowUp.followUpDate);
                      setRescheduleTime(viewingFollowUp.followUpTime);
                      setViewingFollowUp(null);
                    }}
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setCompletingItem(viewingFollowUp);
                      setViewingFollowUp(null);
                    }}
                  >
                    Mark Done
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewingFollowUp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Mark Completed */}
      <Modal
        isOpen={!!completingItem}
        onClose={() => setCompletingItem(null)}
        title="Mark Follow-up Completed"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Completing follow-up for{' '}
            <span className="font-bold text-slate-800">{completingItem?.customerName}</span>.
          </p>

          <Input
            label="Outcome Notes / Meeting Notes"
            type="textarea"
            rows={3}
            value={outcomeNotes}
            onChange={(e) => setOutcomeNotes(e.target.value)}
            placeholder="e.g. Client agreed to schedule site survey on Friday."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setCompletingItem(null)}>
              Cancel
            </Button>
            <Button variant="success" size="sm" onClick={handleCompleteSubmit}>
              Complete Task
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Reschedule */}
      <Modal
        isOpen={!!reschedulingItem}
        onClose={() => setReschedulingItem(null)}
        title="Reschedule Follow-up"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Rescheduling for{' '}
            <span className="font-bold text-slate-800">{reschedulingItem?.customerName}</span>.
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

          <Input
            label="Reschedule Reason"
            type="textarea"
            rows={2}
            value={rescheduleNotes}
            onChange={(e) => setRescheduleNotes(e.target.value)}
            placeholder="e.g. Customer in meeting; requested afternoon callback."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReschedulingItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRescheduleSubmit}>
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* DIALOG: Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Cancel Follow-up"
        message={`Are you sure you want to remove the follow-up task ${deletingItem?.id}?`}
        type="danger"
        confirmText="Remove Follow-up"
      />
    </PageContainer>
  );
};

export default FollowUpsPage;

