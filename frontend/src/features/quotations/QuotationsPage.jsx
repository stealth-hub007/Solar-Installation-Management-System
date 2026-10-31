import React, { useState, useEffect } from 'react';
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
import { quotationAPI } from '../sales/services/quotationAPI';

const initialQuotations = [
  { id: 'QUO-701', customerName: 'Sunita Agarwal', capacity: 8.0, systemCapacity: 8.0, dailyGen: '36 kWh', dailyGeneration: '36 kWh', totalCost: 368000, subtotal: 368000, subsidy: 78000, netPayable: 324000, finalAmount: 324000, status: 'Sent', date: '2026-10-28T10:00:00Z', createdDate: '2026-10-28T10:00:00Z' },
  { id: 'QUO-702', customerName: 'Mukesh Choudhary', capacity: 30.0, systemCapacity: 30.0, dailyGen: '135 kWh', dailyGeneration: '135 kWh', totalCost: 1250000, subtotal: 1250000, subsidy: 0, netPayable: 1350000, finalAmount: 1350000, status: 'Draft', date: '2026-10-26T14:30:00Z', createdDate: '2026-10-26T14:30:00Z' },
  { id: 'QUO-703', customerName: 'Rajesh Sharma', capacity: 10.5, systemCapacity: 10.5, dailyGen: '48 kWh', dailyGeneration: '48 kWh', totalCost: 470000, subtotal: 470000, subsidy: 78000, netPayable: 432000, finalAmount: 432000, status: 'Accepted', date: '2026-10-24T16:00:00Z', createdDate: '2026-10-24T16:00:00Z' },
  { id: 'QUO-704', customerName: 'Modern Public School', capacity: 40.0, systemCapacity: 40.0, dailyGen: '180 kWh', dailyGeneration: '180 kWh', totalCost: 1689000, subtotal: 1689000, subsidy: 0, netPayable: 1824000, finalAmount: 1824000, status: 'Accepted', date: '2026-10-22T08:50:00Z', createdDate: '2026-10-22T08:50:00Z' },
  { id: 'QUO-705', customerName: 'Priya Meena', capacity: 5.0, systemCapacity: 5.0, dailyGen: '22 kWh', dailyGeneration: '22 kWh', totalCost: 244000, subtotal: 244000, subsidy: 78000, netPayable: 182000, finalAmount: 182000, status: 'Sent', date: '2026-10-20T12:00:00Z', createdDate: '2026-10-20T12:00:00Z' },
];

const normalizeQuote = (q) => {
  const cap = Number(q.capacity ?? q.systemCapacity) || 10.0;
  const sub = Number(q.totalCost) > 0 ? Number(q.totalCost) : (Number(q.subtotal) > 0 ? Number(q.subtotal) : (Number(q.finalAmount) > 0 ? Number(q.finalAmount) : Math.round(cap * 45000)));
  const subBenefit = q.subsidy !== undefined ? Number(q.subsidy) : (cap <= 10 ? 78000 : 0);
  const net = Number(q.netPayable) > 0 ? Number(q.netPayable) : (Number(q.finalAmount) > 0 ? Number(q.finalAmount) : Math.max(0, sub - subBenefit));
  const gen = q.dailyGen ?? q.dailyGeneration ?? `${Math.round(cap * 4.5)} kWh`;
  const dt = q.date ?? q.createdDate ?? '2026-10-28T10:00:00Z';
  return {
    ...q,
    capacity: cap,
    systemCapacity: cap,
    dailyGen: gen,
    dailyGeneration: gen,
    totalCost: sub,
    subtotal: sub,
    netPayable: net,
    finalAmount: net,
    subsidy: subBenefit,
    date: dt,
    createdDate: dt,
  };
};

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState(() => {
    try {
      const stored = storageService.getQuotations();
      if (Array.isArray(stored) && stored.length > 0) {
        return stored.map(normalizeQuote);
      }
      return initialQuotations;
    } catch {
      return initialQuotations;
    }
  });

  useEffect(() => {
    quotationAPI.getQuotations()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuotations(data.map(normalizeQuote));
        }
      })
      .catch(() => {});
  }, []);

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
      cell: ({ value }) => <span className="font-semibold text-slate-800 max-w-[150px] truncate block" title={value}>{value}</span>,
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      cell: ({ value, row }) => {
        const cap = row.capacity ?? row.systemCapacity ?? value;
        const gen = row.dailyGen ?? row.dailyGeneration;
        return (
          <div>
            <span className="font-bold text-slate-900">{cap ? `${cap} kW` : '—'}</span>
            <span className="block text-[11px] text-sky-700">{gen ? `~${gen}/d` : '—'}</span>
          </div>
        );
      },
    },
    {
      header: 'Total Cost',
      accessor: 'totalCost',
      align: 'right',
      cell: ({ value, row }) => {
        const total = row.totalCost ?? row.subtotal ?? row.finalAmount ?? value ?? 0;
        return (
          <span className="font-bold text-slate-900">{formatCurrency(total)}</span>
        );
      },
    },
    {
      header: 'Net Payable',
      accessor: 'netPayable',
      align: 'right',
      cell: ({ value, row }) => {
        const net = row.netPayable ?? row.finalAmount ?? row.totalCost ?? value ?? 0;
        const sub = Number(row.subsidy);
        return (
          <div>
            <span className="font-bold text-[#0284C7]">{formatCurrency(net)}</span>
            {sub > 0 && (
              <span className="block text-[11px] text-amber-600">Sub: -{formatCurrency(sub, { compact: true })}</span>
            )}
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
      header: 'Created Date',
      accessor: 'date',
      cell: ({ value, row }) => {
        const dt = row.date ?? row.createdDate ?? value;
        return (
          <span className="text-xs text-slate-500">
            {dt ? formatDate(dt, { format: 'short' }) : '—'}
          </span>
        );
      },
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
