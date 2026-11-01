import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/common/Button';
import { ShieldCheck, Search, RefreshCw, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import useDebounce from '../../hooks/useDebounce';
import formatDate from '../../utils/formatDate';

export const WarrantyPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingWarranty, setViewingWarranty] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch all warranties by pulling dispatches with delivery confirmations
  // The backend registers warranties on delivery; we query /warranties via customer list or direct order list
  const loadWarranties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dispatches that are DELIVERED — each confirmed delivery activates warranties
      const dispatchRes = await axiosInstance.get('/v1/dispatches');
      const dispatches = dispatchRes.data?.data?.items || dispatchRes.data?.data || dispatchRes.data || [];
      const deliveredDispatches = Array.isArray(dispatches)
        ? dispatches.filter((d) => (d.dispatch_status || '').toUpperCase() === 'DELIVERED')
        : [];

      // For each delivered dispatch, try to get warranty info via customer
      const warrantyRows = [];
      const seen = new Set();

      for (const d of deliveredDispatches) {
        if (d.customer_id && !seen.has(d.customer_id)) {
          seen.add(d.customer_id);
          try {
            const wRes = await axiosInstance.get(`/v1/warranties/customer/${d.customer_id}`);
            const wList = wRes.data?.data || [];
            if (Array.isArray(wList)) {
              wList.forEach((w) => warrantyRows.push({ ...w, customer_name: d.customer_name }));
            }
          } catch {
            // non-critical — warranty may not exist yet
          }
        }
      }

      setWarranties(warrantyRows);
    } catch (err) {
      setError(err.message || 'Failed to load warranty records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWarranties();
  }, [loadWarranties]);

  // Client-side filter & paginate
  const filtered = warranties.filter((w) => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch =
      !q ||
      w.serial_number?.toLowerCase().includes(q) ||
      w.customer_name?.toLowerCase().includes(q) ||
      w.product_name?.toLowerCase().includes(q) ||
      w.warranty_number?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' || (w.warranty_status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      header: 'Warranty Ref',
      accessor: 'warranty_number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">
          {row.warranty_number || String(row.id || '').slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      cell: ({ row }) => (
        <div className="max-w-[180px]">
          <span className="font-semibold text-slate-800 block truncate text-xs">
            {row.customer_name || '—'}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            {row.product_name || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Serial Number',
      accessor: 'serial_number',
      cell: ({ value }) => (
        <span className="font-mono text-xs text-slate-700">{value || '—'}</span>
      ),
    },
    {
      header: 'Warranty Start',
      accessor: 'warranty_start_date',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600">
          {value ? formatDate(value) : '—'}
        </span>
      ),
    },
    {
      header: 'Warranty End',
      accessor: 'warranty_end_date',
      cell: ({ value }) => (
        <span className="text-xs text-slate-600">
          {value ? formatDate(value) : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'warranty_status',
      cell: ({ row }) => <StatusBadge status={row.warranty_status || 'ACTIVE'} />,
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-24 text-center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button variant="outline" size="xs" icon={Eye} onClick={() => setViewingWarranty(row)}>
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Warranty Management"
        subtitle="Manage 25-year solar PV module guarantees, inverter RMA claims, and workmanship records activated on delivery confirmation"
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadWarranties} loading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && warranties.length === 0 && !error && (
        <div className="mb-4 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-700 flex items-start gap-2">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            <strong>No warranties activated yet.</strong> Warranties are automatically registered when Warehouse confirms equipment delivery to the customer site.
          </span>
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
              placeholder="Search serial number, customer or product..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          >
            <option value="all">All Warranty Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="CLAIMED">Claimed</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No warranty certificates found"
          emptyDescription="Warranties are activated automatically when equipment delivery is confirmed by the Warehouse team."
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

      {/* Warranty Detail Modal */}
      {viewingWarranty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0284C7]" />
                  Warranty Certificate
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {viewingWarranty.warranty_number || String(viewingWarranty.id || '').slice(0, 8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setViewingWarranty(null)}
                className="text-slate-400 hover:text-slate-700 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs sm:text-sm">
                {[
                  ['Customer', viewingWarranty.customer_name || '—'],
                  ['Product', viewingWarranty.product_name || '—'],
                  ['Serial Number', viewingWarranty.serial_number || '—'],
                  ['Warranty Period', viewingWarranty.warranty_period_months ? `${viewingWarranty.warranty_period_months} months` : '—'],
                  ['Start Date', viewingWarranty.warranty_start_date ? formatDate(viewingWarranty.warranty_start_date) : '—'],
                  ['End Date', viewingWarranty.warranty_end_date ? formatDate(viewingWarranty.warranty_end_date) : '—'],
                  ['Status', viewingWarranty.warranty_status || '—'],
                  ['Notes', viewingWarranty.notes || '—'],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800 text-right max-w-[55%] truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setViewingWarranty(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default WarrantyPage;
