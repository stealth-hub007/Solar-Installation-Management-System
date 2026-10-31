import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

export const WarrantyPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  const projects = storageService.getProjects();
  const warranties = projects.map((p, idx) => ({
    id: `WAR-${600 + idx + 1}`,
    projectId: p.id,
    customer: p.customerName,
    capacity: `${p.capacity} kW`,
    moduleWarranty: '25-Year Linear Output Guarantee (84.8% at Y25)',
    inverterWarranty: '10-Year Replacement Guarantee',
    startDate: p.createdDate,
    status: p.status === 'Completed' ? 'Active' : 'Pending Commissioning',
  }));

  const paginated = paginateCollection(warranties, {
    page,
    pageSize,
    search: debouncedSearch,
    filterKey: 'status',
    filterVal: statusFilter,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Warranty Management"
        subtitle="Manage 25-year solar PV module generation guarantees, inverter manufacturer RMA claims, and workmanship records"
      />

      <Card padding={false} className="overflow-hidden">
        {/* Search & Filter Bar */}
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
              placeholder="Search warranty cert, customer or project..."
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
              <option value="all">All Warranty Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Commissioning">Pending Commissioning</option>
            </select>
          </div>
        </div>

        <Table
          columns={[
            {
              header: 'Certificate ID',
              accessor: 'id',
              cell: ({ value }) => (
                <span className="font-mono text-xs font-semibold text-[#0284C7] whitespace-nowrap">{value}</span>
              ),
            },
            {
              header: 'Customer',
              accessor: 'customer',
              cell: ({ row }) => (
                <div className="max-w-[170px] truncate" title={`${row.customer} (${row.projectId} - ${row.capacity})`}>
                  <span className="font-semibold text-slate-800">{row.customer}</span>
                  <span className="text-[11px] text-slate-400 font-mono ml-1.5">({row.capacity})</span>
                </div>
              ),
            },
            {
              header: 'PV Modules',
              accessor: 'moduleWarranty',
              cell: ({ value }) => (
                <span className="text-xs text-slate-700 max-w-[200px] truncate block" title={value}>
                  {value}
                </span>
              ),
            },
            {
              header: 'Inverters',
              accessor: 'inverterWarranty',
              cell: ({ value }) => (
                <span className="text-xs text-slate-700 max-w-[170px] truncate block" title={value}>
                  {value}
                </span>
              ),
            },
            {
              header: 'Status',
              accessor: 'status',
              cell: ({ value }) => <StatusBadge status={value} />,
            },
          ]}
          data={paginated.data}
          emptyTitle="No warranty certificates found"
          emptyDescription="No certificates match your search query."
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
    </PageContainer>
  );
};

export default WarrantyPage;
