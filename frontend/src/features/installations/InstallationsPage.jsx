import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import {
  Wrench,
  RefreshCw,
  Eye,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import useDebounce from '../../hooks/useDebounce';
import formatDate from '../../utils/formatDate';

export const InstallationsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingJob, setViewingJob] = useState(null);
  const [assigningJob, setAssigningJob] = useState(null);
  const [assignForm, setAssignForm] = useState({ technician_id: '', scheduled_date: '', notes: '' });
  const [assigning, setAssigning] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/v1/installations');
      const raw = res.data?.data?.items || res.data?.data || res.data || [];
      setJobs(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message || 'Failed to load installation jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const res = await axiosInstance.get('/v1/auth/users?role=TECHNICIAN&status=ACTIVE');
      const raw = res.data?.data?.items || res.data?.data || res.data || [];
      setTechnicians(Array.isArray(raw) ? raw : []);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    loadJobs();
    loadTechnicians();
  }, []);

  const handleAssign = async () => {
    if (!assigningJob || !assignForm.technician_id) return;
    setAssigning(true);
    try {
      await axiosInstance.post(`/v1/installations/${assigningJob.id}/assign`, {
        technician_id: assignForm.technician_id,
        scheduled_date: assignForm.scheduled_date || undefined,
        notes: assignForm.notes || undefined,
      });
      setSuccessMsg(`Technician assigned to installation job successfully.`);
      setAssigningJob(null);
      setAssignForm({ technician_id: '', scheduled_date: '', notes: '' });
      await loadJobs();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  // Filter & paginate
  const filtered = jobs.filter((j) => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch =
      !q ||
      j.job_number?.toLowerCase().includes(q) ||
      j.order_number?.toLowerCase().includes(q) ||
      j.customer_name?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' ||
      (j.installation_status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      header: 'Job Number',
      accessor: 'job_number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">
          {row.job_number || String(row.id).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer / Order',
      accessor: 'customer_name',
      cell: ({ row }) => (
        <div className="max-w-[170px]">
          <span className="font-semibold text-slate-800 block truncate text-xs">
            {row.customer_name || '—'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono block truncate">
            {row.order_number || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Technician',
      accessor: 'technician_name',
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium">
          {row.technician_name || row.technician?.full_name || (
            <span className="text-amber-600 font-semibold">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      header: 'Scheduled Date',
      accessor: 'scheduled_date',
      cell: ({ row }) => (
        <span className="text-xs text-slate-600">
          {row.scheduled_date ? formatDate(row.scheduled_date) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'installation_status',
      cell: ({ row }) => (
        <StatusBadge status={row.installation_status || 'PENDING_ASSIGNMENT'} />
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-40 text-center',
      cell: ({ row }) => {
        const status = (row.installation_status || '').toUpperCase();
        const needsAssignment = status === 'PENDING_ASSIGNMENT' || !row.technician_name;
        return (
          <div className="flex items-center justify-center gap-1">
            <Button variant="outline" size="xs" icon={Eye} onClick={() => setViewingJob(row)}>
              View
            </Button>
            {needsAssignment && (
              <Button
                variant="primary"
                size="xs"
                icon={UserCheck}
                onClick={() => {
                  setAssigningJob(row);
                  setAssignForm({ technician_id: '', scheduled_date: '', notes: '' });
                }}
              >
                Assign
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Installation & Field Execution"
        subtitle="Assign technicians to installation jobs, track progress, and manage on-site work orders"
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadJobs} loading={loading}>
            Refresh
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Card padding={false} className="overflow-hidden">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search job number, order or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING_ASSIGNMENT">Pending Assignment</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="TESTING">Testing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No installation jobs found"
          emptyDescription="Installation jobs are created automatically when an order is dispatched."
        />
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(ps) => { setPageSize(ps); setPage(1); }}
        />
      </Card>

      {/* View Job Modal */}
      {viewingJob && (
        <Modal
          isOpen={!!viewingJob}
          onClose={() => setViewingJob(null)}
          title={`Installation Job: ${viewingJob.job_number || String(viewingJob.id).slice(0, 8).toUpperCase()}`}
          subtitle={`Customer: ${viewingJob.customer_name || '—'}`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              {(viewingJob.installation_status === 'PENDING_ASSIGNMENT' || !viewingJob.technician_name) && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserCheck}
                  onClick={() => { setViewingJob(null); setAssigningJob(viewingJob); setAssignForm({ technician_id: '', scheduled_date: '', notes: '' }); }}
                >
                  Assign Technician
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewingJob(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs sm:text-sm">
            {[
              ['Job Number', viewingJob.job_number || '—'],
              ['Order Number', viewingJob.order_number || '—'],
              ['Customer', viewingJob.customer_name || '—'],
              ['Technician', viewingJob.technician_name || viewingJob.technician?.full_name || 'Unassigned'],
              ['Scheduled Date', viewingJob.scheduled_date ? formatDate(viewingJob.scheduled_date) : '—'],
              ['Status', viewingJob.installation_status || '—'],
              ['Address', viewingJob.installation_address || '—'],
              ['System Capacity', viewingJob.system_capacity_kw ? `${viewingJob.system_capacity_kw} kW` : '—'],
              ['Notes', viewingJob.notes || '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800 text-right max-w-[55%] truncate">{val}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Assign Technician Modal */}
      {assigningJob && (
        <Modal
          isOpen={!!assigningJob}
          onClose={() => { setAssigningJob(null); setAssignForm({ technician_id: '', scheduled_date: '', notes: '' }); }}
          title="Assign Field Technician"
          subtitle={`Installation job for ${assigningJob.customer_name || '—'}`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => { setAssigningJob(null); setAssignForm({ technician_id: '', scheduled_date: '', notes: '' }); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={UserCheck}
                loading={assigning}
                disabled={!assignForm.technician_id}
                onClick={handleAssign}
              >
                Assign & Schedule
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Assign a field technician to this installation job. The technician will be notified and the job will be scheduled.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Technician <span className="text-red-500">*</span>
              </label>
              {technicians.length > 0 ? (
                <select
                  value={assignForm.technician_id}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, technician_id: e.target.value }))}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0284C7] bg-white"
                >
                  <option value="">-- Select technician --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name} — {t.email}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={assignForm.technician_id}
                  onChange={(e) => setAssignForm((prev) => ({ ...prev, technician_id: e.target.value }))}
                  placeholder="Enter technician User ID"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                value={assignForm.scheduled_date}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, scheduled_date: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
              <textarea
                value={assignForm.notes}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Special instructions for the technician..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0284C7] resize-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default InstallationsPage;
