import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../dashboard/components/modals/ConfirmDeleteModal';
import {
  Shield,
  UserCheck,
  Check,
  X,
  Trash2,
  Clock,
  Search,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';
import storageService from '../../services/storageService';
import formatDate from '../../utils/formatDate';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

export const RolesPermissionsPage = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingReq, setDeletingReq] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);

  const [simulateForm, setSimulateForm] = useState({
    name: '',
    email: '',
    role: 'Operations Manager',
    department: 'Supply Chain & Field Execution',
    reason: 'Requires access to manage warehouse stock and dispatching',
  });

  const debouncedSearch = useDebounce(search, 300);

  const loadRequests = () => {
    setRequests(storageService.getAccessRequests());
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = (id) => {
    storageService.updateAccessRequestStatus(id, 'Approved');
    loadRequests();
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq((prev) => ({ ...prev, status: 'Approved' }));
    }
  };

  const handleReject = (id) => {
    storageService.updateAccessRequestStatus(id, 'Rejected');
    loadRequests();
    if (selectedReq && selectedReq.id === id) {
      setSelectedReq((prev) => ({ ...prev, status: 'Rejected' }));
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingReq) return;
    storageService.deleteAccessRequest(deletingReq.id);
    loadRequests();
    setDeletingReq(null);
    if (selectedReq && selectedReq.id === deletingReq.id) {
      setSelectedReq(null);
    }
  };

  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    if (!simulateForm.name || !simulateForm.email) {
      alert('Please fill in name and email');
      return;
    }
    storageService.createAccessRequest(simulateForm);
    loadRequests();
    setIsSimulateOpen(false);
    setSimulateForm({
      name: '',
      email: '',
      role: 'Operations Manager',
      department: 'Supply Chain & Field Execution',
      reason: 'Requires panel access',
    });
  };

  const paginated = paginateCollection(requests, {
    page,
    pageSize,
    search: debouncedSearch,
    filterKey: 'status',
    filterVal: statusFilter,
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;

  const columns = [
    {
      header: 'Request Ref',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7] whitespace-nowrap">{value}</span>
      ),
    },
    {
      header: 'Applicant Name',
      accessor: 'name',
      cell: ({ row }) => (
        <div className="max-w-[150px] truncate" title={`${row.name} (${row.email})`}>
          <span className="font-semibold text-slate-800 block truncate">{row.name}</span>
          <span className="text-[11px] text-slate-400 block truncate">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Requested Role',
      accessor: 'role',
      cell: ({ value }) => (
        <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600 max-w-[140px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Requested At',
      accessor: 'requestedAt',
      cell: ({ value }) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDate(value, { format: 'short' })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      align: 'center',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Actions',
      align: 'center',
      stickyRight: true,
      headerClassName: 'w-28 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          {row.status === 'Pending' ? (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                title="Verify & Grant Panel Access"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                title="Reject Access"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5">
              Verified
            </span>
          )}
          <button
            onClick={() => setDeletingReq(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Record"
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
        title="Roles & Permissions Management"
        subtitle="Verify panel access requests submitted by managers, technicians, and staff from login portal"
      >
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsSimulateOpen(true)}>
          New Access Request
        </Button>
      </PageHeader>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pending Admin Verification</span>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{pendingCount} Requests</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Authorized Staff</span>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{approvedCount} Verified</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Portal Requests</span>
            <div className="text-2xl font-bold text-[#0284C7] mt-0.5">{requests.length} Total</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284C7] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Access Requests Table Card */}
      <Card padding={false} className="overflow-hidden mb-6">
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
              placeholder="Search applicant name, email or role..."
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
              <option value="all">All Request Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={paginated.data}
          emptyTitle="No access requests found"
          emptyDescription="No portal access requests match your criteria."
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

      {/* Role & Permissions Hierarchy Card */}
      <Card>
        <CardHeader
          icon={Key}
          title="Role Permissions & Access Matrix"
          subtitle="Pre-configured functional authorization for verified accounts"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Super Administrator</span>
              <span className="px-2 py-0.5 rounded bg-sky-200 text-sky-800 text-[10px] font-bold">MASTER</span>
            </div>
            <p className="text-slate-600">
              Full authority: Verify user requests, CRUD across Customers, Products, Inventory, Payments, and Enquiries.
            </p>
            <div className="pt-2 border-t border-sky-200/60 text-[11px] text-slate-500">
              Assigned to: <strong className="text-slate-800">Admin User (admin@solar-sims.com)</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Operations Manager</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">MANAGER</span>
            </div>
            <p className="text-slate-600">
              Authorized for: Inventory stock adjustments, Equipment dispatching, Purchase orders, and Site surveyor scheduling.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              Requires Admin Verification from login page.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Field Service Staff</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">STAFF</span>
            </div>
            <p className="text-slate-600">
              Authorized for: Site surveys, Rooftop mounting checklists, breakdown service tickets, and warranty certificates.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              Requires Admin Verification from login page.
            </div>
          </div>
        </div>
      </Card>

      {/* New Request Modal */}
      {isSimulateOpen && (
        <Modal
          isOpen={isSimulateOpen}
          onClose={() => setIsSimulateOpen(false)}
          title="Create New Panel Access Request"
          subtitle="Submit user access for admin verification"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsSimulateOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSimulateSubmit}>
                Submit Request
              </Button>
            </>
          }
        >
          <form onSubmit={handleSimulateSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Applicant Name *</label>
              <input
                type="text"
                required
                value={simulateForm.name}
                onChange={(e) => setSimulateForm({ ...simulateForm, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={simulateForm.email}
                  onChange={(e) => setSimulateForm({ ...simulateForm, email: e.target.value })}
                  placeholder="rahul@solar-sims.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Requested Role</label>
                <select
                  value={simulateForm.role}
                  onChange={(e) => setSimulateForm({ ...simulateForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Field Service Staff">Field Service Staff</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="Field Service Engineer">Field Service Engineer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Department</label>
              <input
                type="text"
                value={simulateForm.department}
                onChange={(e) => setSimulateForm({ ...simulateForm, department: e.target.value })}
                placeholder="e.g. Operations & Field Execution"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Reason / Scope of Access</label>
              <textarea
                rows={2}
                value={simulateForm.reason}
                onChange={(e) => setSimulateForm({ ...simulateForm, reason: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingReq && (
        <ConfirmDeleteModal
          isOpen={!!deletingReq}
          onClose={() => setDeletingReq(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Access Request Record"
          message={`Are you sure you want to remove the access request record for "${deletingReq.name}"?`}
          itemIdentifier={`${deletingReq.id} — ${deletingReq.name}`}
        />
      )}
    </PageContainer>
  );
};

export default RolesPermissionsPage;

