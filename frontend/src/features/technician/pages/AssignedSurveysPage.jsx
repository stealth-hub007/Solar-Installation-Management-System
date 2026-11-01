import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Table, { TablePagination } from '../../../components/ui/Table';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/common/Button';
import { Search, MapPin, Eye, Wrench, Calendar, AlertTriangle } from 'lucide-react';
import { fetchAssignedSurveys } from '../slices/assignedSurveySlice';
import useTechnicianFilters from '../hooks/useTechnicianFilters';
import { SURVEY_STATUSES } from '../utils/technicianConstants';

export const AssignedSurveysPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items: surveys, loading, error } = useSelector((state) => state.assignedSurveys);

  useEffect(() => {
    dispatch(fetchAssignedSurveys());
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
    initialData: surveys,
    initialPageSize: 10,
    searchFields: ['id', 'customerName', 'siteAddress', 'roofType', 'enquiryId'],
  });

  useEffect(() => {
    const urlStatus = searchParams.get('status');
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }
  }, [searchParams, setStatusFilter]);

  const columns = [
    {
      header: 'Survey Ref',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>
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
      header: 'Site Location',
      accessor: 'siteAddress',
      cell: ({ value }) => (
        <div className="flex items-center gap-1 text-slate-600 max-w-[200px] truncate" title={value}>
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate text-xs">{value}</span>
        </div>
      ),
    },
    {
      header: 'Proposed System',
      accessor: 'proposedCapacity',
      cell: ({ value, row }) => (
        <div>
          <span className="font-bold text-slate-900">{value || '8.0 kW'}</span>
          <span className="block text-[11px] text-slate-500">{row.roofType}</span>
        </div>
      ),
    },
    {
      header: 'Scheduled Date',
      accessor: 'scheduledDate',
      cell: ({ value, row }) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{value}</span>
          <span className="text-[10px] text-slate-400">{row.scheduledTime || '11:00 AM'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value, row }) => (
        <div>
          <StatusBadge status={value} />
          {row.approvalStatus && (
            <span className="block text-[10px] text-slate-400 mt-0.5">
              Appr: {row.approvalStatus}
            </span>
          )}
        </div>
      ),
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
            onClick={() => navigate(`/technician/surveys/${row.id}`)}
          >
            Review
          </Button>
          <Button
            size="xs"
            variant="primary"
            icon={Wrench}
            onClick={() => navigate(`/technician/surveys/${row.id}`)}
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Assigned Site Surveys"
        subtitle="Perform physical rooftop inspections, structural measurements, azimuth verification, and shadow analysis"
        actions={
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchAssignedSurveys())} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card padding={false} className="overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search survey ID, customer, address..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              {SURVEY_STATUSES.map((st) => (
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

export default AssignedSurveysPage;
