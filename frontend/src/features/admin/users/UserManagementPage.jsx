import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Search,
  Filter,
  RefreshCw,
  Shield,
  TrendingUp,
  Boxes,
  Wrench,
  ShieldAlert,
} from 'lucide-react';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Button from '../../../components/common/Button';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import ApprovalModal from './ApprovalModal';
import StatusChangeModal from './StatusChangeModal';
import userAPI from './userAPI';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

  // Modals
  const [selectedUserForApproval, setSelectedUserForApproval] = useState(null);
  const [statusModalConfig, setStatusModalConfig] = useState({
    isOpen: false,
    user: null,
    actionType: 'reject',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userAPI.getUsers({
        search: search.trim() || undefined,
        account_status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      const list = Array.isArray(data) ? data : data.items || [];
      setUsers(list);
    } catch (err) {
      setError(err.message || 'Failed to load registered users.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Status counts for filter pills
  const pendingCount = users.filter((u) => u.account_status === 'PENDING').length;

  const renderStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertOctagon className="w-3.5 h-3.5" />
            Suspended
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const renderRoleBadge = (role, status) => {
    if (status === 'PENDING' && !role) {
      return (
        <span className="text-xs italic text-slate-400">
          Awaiting Role Assignment
        </span>
      );
    }
    const r = (role || '').toUpperCase();
    switch (r) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Administrator (4 Portals)
          </span>
        );
      case 'SALES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Sales Officer
          </span>
        );
      case 'WAREHOUSE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Boxes className="w-3.5 h-3.5 text-amber-600" />
            Warehouse Manager
          </span>
        );
      case 'TECHNICIAN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            Field Technician
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{role || 'Unassigned'}</span>;
    }
  };

  const tableColumns = [
    {
      header: 'User / Applicant',
      accessor: 'full_name',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-xs text-slate-900">
            {row.full_name || 'Staff Member'}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            ID: #{row.id}
          </div>
        </div>
      ),
    },
    {
      header: 'Corporate Email',
      accessor: 'email',
      cell: ({ row }) => <span className="text-xs text-slate-700">{row.email}</span>,
    },
    {
      header: 'Registration Date',
      accessor: 'created_at',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'account_status',
      cell: ({ row }) => renderStatusBadge(row.account_status),
    },
    {
      header: 'Assigned Role',
      accessor: 'role',
      cell: ({ row }) => renderRoleBadge(row.role, row.account_status),
    },
    {
      header: 'Administrative Actions',
      align: 'right',
      cell: ({ row: u }) => (
        <div className="inline-flex items-center gap-1.5">
          {/* Approve / Assign Role */}
          {(u.account_status === 'PENDING' || u.account_status === 'REJECTED') && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setSelectedUserForApproval(u)}
              icon={UserCheck}
            >
              Approve & Assign Role
            </Button>
          )}

          {/* Role Change for already approved */}
          {u.account_status === 'APPROVED' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-xs border-slate-200"
              onClick={() => setSelectedUserForApproval(u)}
            >
              Change Role
            </Button>
          )}

          {/* Reject Option */}
          {u.account_status === 'PENDING' && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              className="text-xs"
              onClick={() =>
                setStatusModalConfig({
                  isOpen: true,
                  user: u,
                  actionType: 'reject',
                })
              }
            >
              Reject
            </Button>
          )}

          {/* Suspend Option */}
          {u.account_status === 'APPROVED' && u.role !== 'ADMIN' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-xs text-amber-700 hover:bg-amber-50 border-amber-200"
              onClick={() =>
                setStatusModalConfig({
                  isOpen: true,
                  user: u,
                  actionType: 'suspend',
                })
              }
            >
              Suspend
            </Button>
          )}

          {/* Reactivate Option */}
          {u.account_status === 'SUSPENDED' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
              onClick={() =>
                setStatusModalConfig({
                  isOpen: true,
                  user: u,
                  actionType: 'reactivate',
                })
              }
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="User Management & Role Approvals"
        description="Review pending staff registrations, approve accounts, assign operational roles, and manage authorization policies."
        actions={
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={fetchUsers}
            disabled={loading}
            icon={RefreshCw}
          >
            {loading ? 'Refreshing...' : 'Refresh List'}
          </Button>
        }
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
            <div className="text-xs font-medium text-slate-500">Pending Admin Review</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.account_status === 'APPROVED').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Active Approved Users</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.role === 'ADMIN').length}
            </div>
            <div className="text-xs font-medium text-slate-500">Super Administrators</div>
          </div>
        </Card>

        <Card className="p-4 border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{users.length}</div>
            <div className="text-xs font-medium text-slate-500">Total Registered Users</div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Users' },
              { id: 'PENDING', label: 'Pending Approval', count: pendingCount },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'SUSPENDED', label: 'Suspended' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#0284C7] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-[#0284C7] transition"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border border-slate-200/90 shadow-xs overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-xs text-rose-600">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <div className="font-bold">{error}</div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={fetchUsers}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Table
            columns={tableColumns}
            data={users}
            isLoading={loading}
            emptyTitle="No users found"
            emptyDescription="No registered users match the selected status filter or search query."
          />
        )}
      </Card>

      {/* Role Approval Modal */}
      <ApprovalModal
        isOpen={Boolean(selectedUserForApproval)}
        onClose={() => setSelectedUserForApproval(null)}
        user={selectedUserForApproval}
        onSuccess={() => {
          setSelectedUserForApproval(null);
          fetchUsers();
        }}
      />

      {/* Status Change (Reject / Suspend / Reactivate) Modal */}
      <StatusChangeModal
        isOpen={statusModalConfig.isOpen}
        onClose={() => setStatusModalConfig({ isOpen: false, user: null, actionType: 'reject' })}
        user={statusModalConfig.user}
        actionType={statusModalConfig.actionType}
        onSuccess={() => {
          setStatusModalConfig({ isOpen: false, user: null, actionType: 'reject' });
          fetchUsers();
        }}
      />
    </PageContainer>
  );
};

export default UserManagementPage;
