import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import { Truck, CheckCircle2, Search, RefreshCw, Eye, AlertTriangle, Package } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import useDebounce from '../../hooks/useDebounce';

export const DispatchPage = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingDispatch, setViewingDispatch] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(null);
  const [confirmForm, setConfirmForm] = useState({ received_by_name: '', remarks: '' });
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const loadDispatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/v1/dispatches');
      const raw = res.data?.data?.items || res.data?.data || res.data || [];
      setDispatches(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message || 'Failed to load dispatches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDispatches();
  }, []);

  const handleConfirmDelivery = async () => {
    if (!confirmingDelivery || !confirmForm.received_by_name.trim()) return;
    setConfirming(true);
    try {
      await axiosInstance.post(`/v1/dispatches/${confirmingDelivery.id}/confirm-delivery`, {
        received_by_name: confirmForm.received_by_name,
        remarks: confirmForm.remarks,
        delivery_date: new Date().toISOString(),
      });
      setSuccessMsg(`Delivery confirmed for dispatch ${confirmingDelivery.dispatch_number || confirmingDelivery.id.slice(0, 8).toUpperCase()}.`);
      setConfirmingDelivery(null);
      setConfirmForm({ received_by_name: '', remarks: '' });
      await loadDispatches();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Delivery confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  // Client-side filter & paginate
  const filtered = dispatches.filter((d) => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch =
      !q ||
      d.dispatch_number?.toLowerCase().includes(q) ||
      d.order_number?.toLowerCase().includes(q) ||
      d.customer_name?.toLowerCase().includes(q) ||
      d.vehicle_number?.toLowerCase().includes(q);
    const matchStatus =
      statusFilter === 'all' || (d.dispatch_status || '').toUpperCase() === statusFilter.toUpperCase();
    return matchSearch && matchStatus;
  });

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      header: 'Dispatch Ref',
      accessor: 'dispatch_number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">
          {row.dispatch_number || String(row.id).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Order',
      accessor: 'order_number',
      cell: ({ row }) => (
        <div className="max-w-[150px]">
          <span className="font-semibold text-slate-800 block truncate text-xs">
            {row.order_number || '—'}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            {row.customer_name || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Vehicle / Driver',
      accessor: 'vehicle_number',
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium text-slate-800 block">{row.vehicle_number || '—'}</span>
          <span className="text-[11px] text-slate-400">{row.driver_name || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Items',
      accessor: 'items',
      cell: ({ row }) => {
        const count = row.items?.length || row.dispatch_items?.length || 0;
        return <span className="text-xs text-slate-700">{count} item{count !== 1 ? 's' : ''}</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'dispatch_status',
      cell: ({ row }) => <StatusBadge status={row.dispatch_status || row.status || 'PREPARING'} />,
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-36 text-center',
      cell: ({ row }) => {
        const status = (row.dispatch_status || row.status || '').toUpperCase();
        return (
          <div className="flex items-center justify-center gap-1">
            <Button variant="outline" size="xs" icon={Eye} onClick={() => setViewingDispatch(row)}>
              View
            </Button>
            {status === 'DISPATCHED' && (
              <Button
                variant="primary"
                size="xs"
                icon={CheckCircle2}
                onClick={() => setConfirmingDelivery(row)}
              >
                Confirm
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Dispatch & Delivery Management"
        subtitle="Track warehouse delivery challans, vehicle transport, and confirm on-site equipment delivery"
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadDispatches} loading={loading}>
            Refresh
          </Button>
        }
      />

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
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
              placeholder="Search dispatch, order, customer or vehicle..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Statuses</option>
              <option value="PREPARING">Preparing</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No dispatches found"
          emptyDescription="No dispatch records have been created yet."
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

      {/* View Modal */}
      {viewingDispatch && (
        <Modal
          isOpen={!!viewingDispatch}
          onClose={() => setViewingDispatch(null)}
          title={`Dispatch: ${viewingDispatch.dispatch_number || String(viewingDispatch.id).slice(0, 8).toUpperCase()}`}
          subtitle={`Order: ${viewingDispatch.order_number || '—'} — ${viewingDispatch.customer_name || '—'}`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              {(viewingDispatch.dispatch_status || '').toUpperCase() === 'DISPATCHED' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => { setViewingDispatch(null); setConfirmingDelivery(viewingDispatch); }}
                >
                  Confirm Delivery
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewingDispatch(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs sm:text-sm">
            {[
              ['Dispatch Number', viewingDispatch.dispatch_number || '—'],
              ['Order Number', viewingDispatch.order_number || '—'],
              ['Customer', viewingDispatch.customer_name || '—'],
              ['Vehicle Number', viewingDispatch.vehicle_number || '—'],
              ['Driver Name', viewingDispatch.driver_name || '—'],
              ['Driver Phone', viewingDispatch.driver_phone || '—'],
              ['Transporter', viewingDispatch.transporter_name || '—'],
              ['Status', viewingDispatch.dispatch_status || '—'],
              ['Dispatch Date', viewingDispatch.dispatched_at ? new Date(viewingDispatch.dispatched_at).toLocaleDateString('en-IN') : '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800 text-right">{val}</span>
              </div>
            ))}
            {viewingDispatch.items?.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-slate-500 mb-2 text-xs font-medium flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Dispatch Items
                </p>
                <div className="space-y-1.5">
                  {viewingDispatch.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-700">{item.product_name || item.product_name_snapshot || `Item ${idx + 1}`}</span>
                      <span className="font-medium text-slate-800">Qty: {item.quantity_dispatched || item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {viewingDispatch.remarks && (
              <div className="pt-2 border-t">
                <p className="text-slate-500 mb-1 text-xs font-medium">Remarks</p>
                <p className="text-slate-700 text-xs leading-relaxed">{viewingDispatch.remarks}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm Delivery Modal */}
      {confirmingDelivery && (
        <Modal
          isOpen={!!confirmingDelivery}
          onClose={() => { setConfirmingDelivery(null); setConfirmForm({ received_by_name: '', remarks: '' }); }}
          title="Confirm Equipment Delivery"
          subtitle={`Dispatch: ${confirmingDelivery.dispatch_number || String(confirmingDelivery.id).slice(0, 8).toUpperCase()}`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => { setConfirmingDelivery(null); setConfirmForm({ received_by_name: '', remarks: '' }); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                loading={confirming}
                disabled={!confirmForm.received_by_name.trim()}
                onClick={handleConfirmDelivery}
              >
                Confirm & Activate Warranty
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Confirming delivery will record the customer receipt and automatically activate product warranties.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Received By (Customer Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={confirmForm.received_by_name}
                onChange={(e) => setConfirmForm((prev) => ({ ...prev, received_by_name: e.target.value }))}
                placeholder="Enter customer or recipient name"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Notes (Optional)</label>
              <textarea
                value={confirmForm.remarks}
                onChange={(e) => setConfirmForm((prev) => ({ ...prev, remarks: e.target.value }))}
                placeholder="Any shortage, damage, or delivery notes..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0284C7] resize-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default DispatchPage;
