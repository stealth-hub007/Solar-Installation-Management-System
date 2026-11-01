import React, { useState, useEffect, useMemo } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import {
  ShoppingCart,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Search,
  XCircle,
} from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import useDebounce from '../../hooks/useDebounce';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [closingOrder, setClosingOrder] = useState(null);
  const [closureNotes, setClosureNotes] = useState('');
  const [closing, setClosing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/v1/orders');
      const raw = res.data?.data?.items || res.data?.data || res.data || [];
      setOrders(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCloseProject = async () => {
    if (!closingOrder) return;
    setClosing(true);
    try {
      await axiosInstance.post(`/v1/orders/${closingOrder.id}/close`, {
        closure_notes: closureNotes || undefined,
      });
      setSuccessMsg(`Order ${closingOrder.order_number} closed successfully. Project marked as COMPLETED.`);
      setClosingOrder(null);
      setClosureNotes('');
      await loadOrders();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Project closure failed');
    } finally {
      setClosing(false);
    }
  };

  // Filter & paginate
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        (o.order_status || '').toUpperCase() === statusFilter.toUpperCase();
      return matchSearch && matchStatus;
    });
  }, [orders, debouncedSearch, statusFilter]);

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'order_number',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7]">
          {row.order_number || String(row.id).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      cell: ({ row }) => (
        <div className="max-w-[160px]">
          <span className="font-semibold text-slate-800 block truncate text-xs">
            {row.customer_name || row.customer?.full_name || '—'}
          </span>
          <span className="text-[11px] text-slate-400 font-mono block truncate">
            {row.order_number || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Contract Value',
      accessor: 'total_amount',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-bold text-slate-900 text-xs">
          {value != null ? formatCurrency(Number(value)) : '—'}
        </span>
      ),
    },
    {
      header: 'Paid',
      accessor: 'paid_amount',
      align: 'right',
      cell: ({ row }) => (
        <div className="text-right">
          <span className="text-xs font-semibold text-emerald-700">
            {row.paid_amount != null ? formatCurrency(Number(row.paid_amount)) : '—'}
          </span>
          {row.outstanding_amount > 0 && (
            <span className="block text-[10px] text-red-500 font-medium">
              Due: {formatCurrency(Number(row.outstanding_amount))}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Order Status',
      accessor: 'order_status',
      cell: ({ row }) => <StatusBadge status={row.order_status || 'CONFIRMED'} />,
    },
    {
      header: 'Payment',
      accessor: 'payment_status',
      cell: ({ row }) => <StatusBadge status={row.payment_status || 'PENDING'} />,
    },
    {
      header: 'Actions',
      align: 'center',
      headerClassName: 'w-40 text-center',
      cell: ({ row }) => {
        const orderStatus = (row.order_status || '').toUpperCase();
        const canClose = orderStatus === 'INSTALLED' || orderStatus === 'IN_PROGRESS';
        return (
          <div className="flex items-center justify-center gap-1">
            <Button variant="outline" size="xs" icon={Eye} onClick={() => setViewingOrder(row)}>
              View
            </Button>
            {canClose && (
              <Button
                variant="primary"
                size="xs"
                icon={CheckCircle2}
                onClick={() => { setClosingOrder(row); setClosureNotes(''); }}
              >
                Close
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
        title="Order Management"
        subtitle="Manage confirmed solar project orders, track payments, and close completed projects"
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadOrders} loading={loading}>
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
              placeholder="Search order number or customer..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
          >
            <option value="all">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="INSTALLED">Installed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <Table
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No orders found"
          emptyDescription="Orders are created when an accepted quotation is converted to an order."
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

      {/* Order Detail Modal */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title={`Order: ${viewingOrder.order_number || String(viewingOrder.id).slice(0, 8).toUpperCase()}`}
          subtitle={`Customer: ${viewingOrder.customer_name || viewingOrder.customer?.full_name || '—'}`}
          footer={
            <div className="flex justify-between gap-2 w-full">
              {['INSTALLED', 'IN_PROGRESS'].includes((viewingOrder.order_status || '').toUpperCase()) && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => { setViewingOrder(null); setClosingOrder(viewingOrder); setClosureNotes(''); }}
                >
                  Close Project
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewingOrder(null)} className="ml-auto">
                Close
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-xl space-y-3 text-xs sm:text-sm">
            {[
              ['Order Number', viewingOrder.order_number || '—'],
              ['Order Date', viewingOrder.order_date ? formatDate(viewingOrder.order_date) : '—'],
              ['Customer', viewingOrder.customer_name || viewingOrder.customer?.full_name || '—'],
              ['Total Amount', viewingOrder.total_amount != null ? formatCurrency(Number(viewingOrder.total_amount)) : '—'],
              ['Paid Amount', viewingOrder.paid_amount != null ? formatCurrency(Number(viewingOrder.paid_amount)) : '—'],
              ['Outstanding', viewingOrder.outstanding_amount != null ? formatCurrency(Number(viewingOrder.outstanding_amount)) : '—'],
              ['Order Status', viewingOrder.order_status || '—'],
              ['Payment Status', viewingOrder.payment_status || '—'],
              ['Expected Install Date', viewingOrder.expected_installation_date ? formatDate(viewingOrder.expected_installation_date) : '—'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800 text-right">{val}</span>
              </div>
            ))}

            {viewingOrder.items?.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-slate-500 mb-2 text-xs font-medium flex items-center gap-1">
                  <ShoppingCart className="w-3.5 h-3.5" /> Order Items
                </p>
                <div className="space-y-1.5">
                  {viewingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-700">{item.product_name_snapshot || `Item ${idx + 1}`}</span>
                      <span className="font-medium text-slate-800">
                        Qty: {item.quantity} × {formatCurrency(Number(item.unit_price_snapshot))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Close Project Modal */}
      {closingOrder && (
        <Modal
          isOpen={!!closingOrder}
          onClose={() => { setClosingOrder(null); setClosureNotes(''); }}
          title="Close Project"
          subtitle={`Order: ${closingOrder.order_number || String(closingOrder.id).slice(0, 8).toUpperCase()}`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" icon={XCircle} onClick={() => { setClosingOrder(null); setClosureNotes(''); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                loading={closing}
                onClick={handleCloseProject}
              >
                Confirm Project Closure
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <strong>⚠ Final step:</strong> Closing this project marks the order as COMPLETED. Ensure that:
              <ul className="mt-1.5 list-disc list-inside space-y-0.5">
                <li>Installation has been completed and tested</li>
                <li>Customer handover sign-off is recorded</li>
                <li>Final payment has been received</li>
                <li>Warranty has been activated (auto-done on delivery)</li>
              </ul>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Closure Notes (Optional)</label>
              <textarea
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder="Any final remarks about project completion..."
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

export default OrdersPage;
