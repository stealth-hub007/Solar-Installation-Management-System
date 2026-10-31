import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/common/Button';
import { Search, MapPin, Eye, Wrench, CheckSquare, PenTool, ArrowRight } from 'lucide-react';
import { fetchAssignedInstallations } from '../slices/assignedInstallationSlice';
import useTechnicianFilters from '../hooks/useTechnicianFilters';
import { INSTALLATION_STATUSES } from '../utils/technicianConstants';

export const AssignedInstallationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: installations, loading } = useSelector((state) => state.assignedInstallations);

  useEffect(() => {
    dispatch(fetchAssignedInstallations());
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
    paginatedData,
    totalRecords,
    totalPages,
  } = useTechnicianFilters({
    initialData: installations,
    initialPageSize: 10,
    searchFields: ['id', 'jobNumber', 'customerName', 'installationAddress', 'projectRef', 'orderNumber'],
  });

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams, setStatusFilter]);

  const columns = [
    {
      header: 'Job Ref',
      accessor: 'id',
      cell: ({ value, row }) => (
        <div>
          <span className="font-mono text-xs font-semibold text-[#0284C7] block">{value}</span>
          <span className="text-[10px] text-slate-400 font-mono">{row.projectRef}</span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      cell: ({ row }) => (
        <div className="max-w-[170px] truncate">
          <span className="font-bold text-slate-800 block truncate" title={row.customerName}>
            {row.customerName}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">{row.contact}</span>
        </div>
      ),
    },
    {
      header: 'Installation Site',
      accessor: 'installationAddress',
      cell: ({ value }) => (
        <div className="flex items-center gap-1 text-slate-600 max-w-[200px] truncate" title={value}>
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-xs">{value}</span>
        </div>
      ),
    },
    {
      header: 'System Capacity',
      accessor: 'capacity',
      cell: ({ value }) => <span className="font-bold text-slate-900">{value}</span>,
    },
    {
      header: 'Warehouse Dispatch',
      accessor: 'dispatchStatus',
      cell: ({ value }) => (
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 block truncate max-w-[160px]">
          {value}
        </span>
      ),
    },
    {
      header: 'Checklist Progress',
      accessor: 'checklistCompleted',
      cell: ({ value, row }) => {
        const total = row.checklistTotal || 9;
        const pct = Math.round(((value || 0) / total) * 100);
        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>{value || 0} / {total}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-[#0284C7]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Action',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="xs"
            variant="outline"
            icon={Eye}
            onClick={() => navigate(`/technician/installations/${row.id}`)}
          >
            Manage
          </Button>
          <Button
            size="xs"
            variant="primary"
            icon={CheckSquare}
            onClick={() => navigate(`/technician/installations/${row.id}/checklist`)}
          >
            Checklist
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Assigned Installation Jobs"
        subtitle="Manage rooftop solar mounting, cabling, equipment serial verification, commissioning, and customer sign-off"
      />

      <Card padding={false} className="overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job ID, customer, project ref..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              {INSTALLATION_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        <Table columns={columns} data={paginatedData} isLoading={loading} />

        {/* Pagination */}
        <TablePagination
          currentPage={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPage(1);
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default AssignedInstallationsPage;

