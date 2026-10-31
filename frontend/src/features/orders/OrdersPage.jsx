import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import storageService from '../../services/storageService';
import formatCurrency from '../../utils/formatCurrency';
import { paginateCollection } from '../../services/mockData';

export const OrdersPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const projects = storageService.getProjects();
  const orders = projects.map((p, idx) => ({
    id: `ORD-${8000 + idx + 1}`,
    projectId: p.id,
    customerName: p.customerName,
    capacity: `${p.capacity} kW`,
    orderValue: p.capacity * 45000,
    status: p.status === 'Completed' ? 'Delivered' : p.status === 'Cancelled' ? 'Cancelled' : 'In Execution',
    progress: p.status === 'Completed' ? 100 : p.status === 'In Progress' ? 65 : 25,
  }));

  const paginated = paginateCollection(orders, { page, pageSize });

  return (
    <PageContainer>
      <PageHeader
        title="Order Management"
        subtitle="Manage confirmed customer solar purchase orders, contract executions, and DISCOM application filings"
      />

      <Card padding={false} className="overflow-hidden">
        <Table
          columns={[
            {
              header: 'Order Ref',
              accessor: 'id',
              cell: ({ value }) => <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>,
            },
            {
              header: 'Customer',
              accessor: 'customerName',
              cell: ({ row }) => (
                <div className="max-w-[150px] truncate" title={row.customerName}>
                  <span className="font-semibold text-slate-800 block truncate">{row.customerName}</span>
                  <span className="text-[11px] text-slate-400 font-mono block truncate">{row.projectId}</span>
                </div>
              ),
            },
            {
              header: 'Capacity',
              accessor: 'capacity',
              cell: ({ value }) => <span className="font-bold text-slate-800">{value}</span>,
            },
            {
              header: 'Contract Value',
              accessor: 'orderValue',
              align: 'right',
              cell: ({ value }) => <span className="font-bold text-slate-900">{formatCurrency(value)}</span>,
            },
            {
              header: 'Fulfillment Stage',
              accessor: 'progress',
              cell: ({ value }) => (
                <div className="w-28 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Progress</span>
                    <span>{value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#0284C7] h-full rounded-full transition-all" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ),
            },
            {
              header: 'Status',
              accessor: 'status',
              cell: ({ value }) => <StatusBadge status={value} />,
            },
          ]}
          data={paginated.data}
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

export default OrdersPage;
