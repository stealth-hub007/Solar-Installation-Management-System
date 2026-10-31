import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import { FileText, Plus, Download, Eye, Check } from 'lucide-react';
import storageService from '../../services/storageService';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { paginateCollection } from '../../services/mockData';

const initialQuotations = [
  { id: 'QUO-501', customerName: 'Rajesh Sharma', capacity: 10.5, dailyGen: '45 kWh', totalCost: 520000, subsidy: 78000, netPayable: 442000, status: 'Approved', date: '2026-10-28T10:00:00Z' },
  { id: 'QUO-502', customerName: 'Apex Textiles Ltd.', capacity: 50.0, dailyGen: '220 kWh', totalCost: 2200000, subsidy: 0, netPayable: 2200000, status: 'Sent', date: '2026-10-27T14:30:00Z' },
  { id: 'QUO-503', customerName: 'Mukesh Choudhary', capacity: 30.0, dailyGen: '135 kWh', totalCost: 1350000, subsidy: 0, netPayable: 1350000, status: 'Draft', date: '2026-10-26T09:15:00Z' },
  { id: 'QUO-504', customerName: 'Sunita Agarwal', capacity: 8.0, dailyGen: '36 kWh', totalCost: 410000, subsidy: 78000, netPayable: 332000, status: 'Sent', date: '2026-10-25T11:45:00Z' },
  { id: 'QUO-505', customerName: 'Priya Meena', capacity: 5.0, dailyGen: '22 kWh', totalCost: 260000, subsidy: 78000, netPayable: 182000, status: 'Approved', date: '2026-10-24T16:00:00Z' },
  { id: 'QUO-506', customerName: 'Golden Hospitality', capacity: 25.0, dailyGen: '110 kWh', totalCost: 1150000, subsidy: 0, netPayable: 1150000, status: 'Draft', date: '2026-10-23T13:20:00Z' },
  { id: 'QUO-507', customerName: 'Modern Public School', capacity: 40.0, dailyGen: '180 kWh', totalCost: 1800000, subsidy: 0, netPayable: 1800000, status: 'Approved', date: '2026-10-22T08:50:00Z' },
  { id: 'QUO-508', customerName: 'Kailash Yadav', capacity: 15.0, dailyGen: '68 kWh', totalCost: 710000, subsidy: 0, netPayable: 710000, status: 'Sent', date: '2026-10-21T10:15:00Z' },
  { id: 'QUO-509', customerName: 'Gaurav Rathore', capacity: 8.0, dailyGen: '36 kWh', totalCost: 420000, subsidy: 78000, netPayable: 342000, status: 'Draft', date: '2026-10-20T12:00:00Z' },
  { id: 'QUO-510', customerName: 'Shree Cement Infra', capacity: 75.0, dailyGen: '340 kWh', totalCost: 3350000, subsidy: 0, netPayable: 3350000, status: 'Approved', date: '2026-10-19T14:45:00Z' },
  { id: 'QUO-511', customerName: 'Ravi Teja Logistics', capacity: 100.0, dailyGen: '450 kWh', totalCost: 4500000, subsidy: 0, netPayable: 4500000, status: 'Sent', date: '2026-10-18T09:30:00Z' },
  { id: 'QUO-512', customerName: 'Hotel Royal Palace', capacity: 45.0, dailyGen: '200 kWh', totalCost: 2050000, subsidy: 0, netPayable: 2050000, status: 'Draft', date: '2026-10-17T11:15:00Z' },
];

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem('sims_quotations_data');
      return saved ? JSON.parse(saved) : initialQuotations;
    } catch {
      return initialQuotations;
    }
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedQuo, setSelectedQuo] = useState(null);

  const saveQuotations = (updated) => {
    setQuotations(updated);
    localStorage.setItem('sims_quotations_data', JSON.stringify(updated));
  };

  const handleStatusUpdate = (id, newStatus) => {
    const updated = quotations.map((q) => (q.id === id ? { ...q, status: newStatus } : q));
    saveQuotations(updated);
    storageService.logActivity(`Updated quotation ${id} status to ${newStatus}`, 'Quotations', 'Updated');
    if (selectedQuo) setSelectedQuo((prev) => ({ ...prev, status: newStatus }));
  };

  const paginated = paginateCollection(quotations, { page, pageSize });

  const columns = [
    {
      header: 'Quote Ref',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: 'customerName',
      cell: ({ value }) => <span className="font-semibold text-slate-800 max-w-[130px] truncate block" title={value}>{value}</span>,
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      cell: ({ value, row }) => (
        <div>
          <span className="font-bold text-slate-900">{value} kW</span>
          <span className="block text-[11px] text-sky-700">~{row.dailyGen}/d</span>
        </div>
      ),
    },
    {
      header: 'Total Cost',
      accessor: 'totalCost',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-bold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      header: 'Net Payable',
      accessor: 'netPayable',
      align: 'right',
      cell: ({ value, row }) => (
        <div>
          <span className="font-bold text-[#0284C7]">{formatCurrency(value)}</span>
          {row.subsidy > 0 && (
            <span className="block text-[11px] text-amber-600">Sub: -{formatCurrency(row.subsidy, { compact: true })}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      header: 'Created Date',
      accessor: 'date',
      cell: ({ value }) => <span className="text-xs text-slate-500">{formatDate(value, { format: 'short' })}</span>,
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="outline" size="xs" icon={Eye} onClick={() => setSelectedQuo(row)}>
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Quotation Management"
        subtitle="Generate and track solar project cost estimates, MNRE subsidy deductions, and customer contract proposals"
      />

      <Card padding={false} className="overflow-hidden">
        <Table columns={columns} data={paginated.data} />
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

      {/* Quotation Detail Modal */}
      {selectedQuo && (
        <Modal
          isOpen={!!selectedQuo}
          onClose={() => setSelectedQuo(null)}
          title={`Solar Proposal: ${selectedQuo.id}`}
          subtitle={`Prepared for ${selectedQuo.customerName}`}
          footer={
            <div className="flex justify-between w-full">
              {selectedQuo.status !== 'Approved' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={() => handleStatusUpdate(selectedQuo.id, 'Approved')}
                >
                  Mark as Customer Approved
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedQuo(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl text-xs sm:text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Proposed Solar Plant Size</span>
              <span className="font-bold text-slate-900">{selectedQuo.capacity} kW Grid-Tied</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Estimated Clean Generation</span>
              <span className="font-semibold text-sky-700">{selectedQuo.dailyGen} (1,350 kWh / month)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Gross Turnkey Project Cost</span>
              <span className="font-semibold text-slate-900">{formatCurrency(selectedQuo.totalCost)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">PM Surya Ghar Subsidy Benefit</span>
              <span className="font-semibold text-rose-600">-{formatCurrency(selectedQuo.subsidy)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-700 font-bold">Net Customer Investment</span>
              <span className="font-extrabold text-base text-[#0284C7]">{formatCurrency(selectedQuo.netPayable)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Proposal Lifecycle</span>
              <StatusBadge status={selectedQuo.status} />
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default QuotationsPage;
