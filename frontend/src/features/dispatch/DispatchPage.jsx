import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import { Truck, CheckCircle2, Search, Filter } from 'lucide-react';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

const initialDispatches = [
  { id: 'DSP-701', projectRef: 'SIMS-PRJ-1082', customer: 'Rajesh Sharma', items: '24x 550W Panels, 1x 10kW Inverter', vehicle: 'RJ-14-GA-9021', driver: 'Surender Singh', status: 'Dispatched', eta: 'Today, 4:00 PM' },
  { id: 'DSP-702', projectRef: 'SIMS-PRJ-1081', customer: 'Apex Textiles Ltd.', items: '96x 540W Panels, Mounting Rails', vehicle: 'RJ-02-TC-4412', driver: 'Mahesh Gujjar', status: 'Delivered', eta: 'Delivered' },
  { id: 'DSP-703', projectRef: 'SIMS-PRJ-1078', customer: 'Mukesh Choudhary', items: '60x 500W Panels, 1x 25kW Inverter', vehicle: 'RJ-14-GB-1122', driver: 'Kailash Meena', status: 'In Transit', eta: 'Tomorrow, 11:00 AM' },
  { id: 'DSP-704', projectRef: 'SIMS-PRJ-1080', customer: 'Priya Meena', items: '10x 550W Panels, 1x 5kW Hybrid Inv', vehicle: 'RJ-14-GA-4501', driver: 'Raju Saini', status: 'Delivered', eta: 'Delivered' },
  { id: 'DSP-705', projectRef: 'SIMS-PRJ-1079', customer: 'Golden Hospitality', items: '50x 540W Panels, LiFePO4 48V Batt', vehicle: 'RJ-01-EA-8812', driver: 'Balram Yadav', status: 'In Transit', eta: 'Today, 6:30 PM' },
  { id: 'DSP-706', projectRef: 'SIMS-PRJ-1076', customer: 'Modern Public School', items: '80x 550W Mono PERC Panels', vehicle: 'RJ-14-TC-7721', driver: 'Vikram Gurjar', status: 'Delivered', eta: 'Delivered' },
  { id: 'DSP-707', projectRef: 'SIMS-PRJ-1074', customer: 'Shree Cement Infra', items: '150x 550W Panels, 2x 30kW Inverters', vehicle: 'RJ-05-GA-3329', driver: 'Mohan Lal', status: 'Delivered', eta: 'Delivered' },
  { id: 'DSP-708', projectRef: 'SIMS-PRJ-1072', customer: 'Sanjay Jain', items: '6x 540W Panels, 1x 3.3kW Inverter', vehicle: 'RJ-14-EA-6612', driver: 'Prakash Bairwa', status: 'Delivered', eta: 'Delivered' },
  { id: 'DSP-709', projectRef: 'SIMS-PRJ-1071', customer: 'Kailash Yadav', items: '30x 500W Panels, HDG Strut Rails', vehicle: 'RJ-14-GB-5544', driver: 'Surender Singh', status: 'In Transit', eta: 'Tomorrow, 2:00 PM' },
  { id: 'DSP-710', projectRef: 'SIMS-PRJ-1077', customer: 'Gaurav Rathore', items: '16x 500W Mono Panels, 1x 8kW Inv', vehicle: 'RJ-27-TC-9910', driver: 'Fateh Singh', status: 'Dispatched', eta: 'Nov 02, 10:00 AM' },
  { id: 'DSP-711', projectRef: 'SIMS-PRJ-1075', customer: 'Dr. Anand Saxena', items: '24x 540W Panels, AC/DC DB Boxes', vehicle: 'RJ-14-GA-9021', driver: 'Surender Singh', status: 'Pending', eta: 'Nov 03, 11:30 AM' },
  { id: 'DSP-712', projectRef: 'SIMS-PRJ-1073', customer: 'Bhanwar Lal & Sons', items: '70x 500W Panels, Earthing Sets', vehicle: 'RJ-21-GB-4421', driver: 'Devendra Kumar', status: 'Pending', eta: 'Nov 04, 03:00 PM' },
  { id: 'DSP-713', projectRef: 'SIMS-PRJ-1083', customer: 'Sunita Agarwal', items: '16x 550W Panels, 1x 8kW Grid Inverter', vehicle: 'RJ-14-TC-8833', driver: 'Raju Saini', status: 'Dispatched', eta: 'Today, 5:30 PM' },
];

export const DispatchPage = () => {
  const [dispatches, setDispatches] = useState(initialDispatches);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const debouncedSearch = useDebounce(search, 300);

  const handleMarkDelivered = (id) => {
    const updated = dispatches.map((d) => (d.id === id ? { ...d, status: 'Delivered', eta: 'Delivered' } : d));
    setDispatches(updated);
    storageService.logActivity(`Marked delivery challan ${id} as Delivered to site`, 'Dispatch', 'Completed');
  };

  const paginated = paginateCollection(dispatches, {
    page,
    pageSize,
    search: debouncedSearch,
    filterKey: 'status',
    filterVal: statusFilter,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Dispatch & Logistics Management"
        subtitle="Manage warehouse delivery challans, transport vehicles, gate passes, and on-site material delivery"
      />

      <Card padding={false} className="overflow-hidden">
        {/* Search & Filter Controls */}
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
              placeholder="Search challan ID, customer or vehicle..."
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
              <option value="all">All Dispatch Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="In Transit">In Transit</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <Table
          columns={[
            {
              header: 'Challan ID',
              accessor: 'id',
              cell: ({ value }) => (
                <span className="font-mono text-xs font-semibold text-[#0284C7] whitespace-nowrap">{value}</span>
              ),
            },
            {
              header: 'Project / Customer',
              accessor: 'customer',
              cell: ({ row }) => (
                <div className="max-w-[150px] truncate" title={`${row.customer} (${row.projectRef})`}>
                  <span className="font-semibold text-slate-800">{row.customer}</span>
                  <span className="text-[11px] text-slate-400 font-mono ml-1.5">({row.projectRef})</span>
                </div>
              ),
            },
            {
              header: 'Equipment Items',
              accessor: 'items',
              cell: ({ value }) => (
                <span className="text-xs text-slate-700 max-w-[180px] truncate block" title={value}>
                  {value}
                </span>
              ),
            },
            {
              header: 'Vehicle & Driver',
              accessor: 'vehicle',
              cell: ({ row }) => (
                <div className="whitespace-nowrap">
                  <span className="font-mono text-xs font-semibold text-slate-800">{row.vehicle}</span>
                  <span className="text-[11px] text-slate-500 ml-1.5">({row.driver})</span>
                </div>
              ),
            },
            {
              header: 'ETA / Status',
              accessor: 'eta',
              cell: ({ row }) => (
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <StatusBadge status={row.status} />
                  <span className="text-[11px] text-slate-400 font-normal">({row.eta})</span>
                </div>
              ),
            },
            {
              header: 'Actions',
              align: 'center',
              cell: ({ row }) =>
                row.status !== 'Delivered' ? (
                  <Button
                    variant="outline"
                    size="xs"
                    icon={CheckCircle2}
                    onClick={() => handleMarkDelivered(row.id)}
                    className="whitespace-nowrap"
                  >
                    Mark Delivered
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium whitespace-nowrap">✓ Received</span>
                ),
            },
          ]}
          data={paginated.data}
          emptyTitle="No dispatch challans found"
          emptyDescription="No logistics challans match your search criteria."
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

export default DispatchPage;
