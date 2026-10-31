import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import {
  ShoppingCart,
  Eye,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  Truck,
  Wrench,
  Check,
} from 'lucide-react';

import { fetchOrders, updateOrderStatus } from '../slices/orderSlice';
import useSalesFilters from '../hooks/useSalesFilters';
import formatCurrency from '../../../utils/formatCurrency';
import formatDate from '../../../utils/formatDate';
import openLeadEnquiry from '../utils/salesNavigation';

export const isOrderFullyExecuted = (order) => {
  if (!order) return false;
  if (String(order.orderStatus).toLowerCase() === 'done') return true;
  const milestones = order.milestones || [];
  if (milestones.length === 0) return false;
  return milestones.every((m) => m.status === 'Completed');
};

export const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: orders, loading, error } = useSelector((state) => state.salesOrders);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Confirmed' | 'Processing' | 'Dispatched' | 'Installed' | 'Done'
  const [tracingOrder, setTracingOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Tab filtering
  const tabFilteredData = orders.filter((o) => {
    if (activeTab === 'all') return true;
    const fullyDone = isOrderFullyExecuted(o);
    if (activeTab.toLowerCase() === 'done') {
      return fullyDone || String(o.orderStatus).toLowerCase() === 'done';
    }
    if (fullyDone) {
      return activeTab === 'Installed' || String(o.orderStatus).toLowerCase() === activeTab.toLowerCase();
    }
    return String(o.orderStatus).toLowerCase() === String(activeTab).toLowerCase();
  });

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortColumn,
    sortDirection,
    handleSort,
    paginatedData,
    totalRecords,
    totalPages,
  } = useSalesFilters({
    initialData: tabFilteredData,
    initialPageSize: 10,
  });

  const handleUpdateMilestone = async (milestoneIdx) => {
    if (!tracingOrder) return;
    
    // Dispatch Redux async action
    const action = await dispatch(
      updateOrderStatus({
        id: tracingOrder.id,
        status: tracingOrder.orderStatus,
        milestoneIndex: milestoneIdx,
      })
    );

    // Trigger immediate refresh of orders table
    dispatch(fetchOrders());

    // Update modal tracking order state in real time
    if (action.payload && action.payload.milestones) {
      setTracingOrder(action.payload);
    } else {
      const updated = JSON.parse(JSON.stringify(tracingOrder));
      if (updated.milestones && updated.milestones[milestoneIdx]) {
        updated.milestones[milestoneIdx].status = 'Completed';
        updated.milestones[milestoneIdx].date = new Date().toISOString().split('T')[0];
      }
      const completedCount = (updated.milestones || []).filter((m) => m.status === 'Completed').length;
      if (completedCount === (updated.milestones || []).length) {
        updated.orderStatus = 'Done';
        updated.paymentStatus = 'Full payment received';
      }
      setTracingOrder(updated);
    }
  };

  const columns = [
    {
      header: 'Order Ref',
      accessor: 'id',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-mono text-xs font-bold text-[#0284C7]">{value}</span>
      ),
    },
    {
      header: 'Customer Details',
      accessor: 'customerName',
      sortable: true,
      cell: ({ row }) => (
        <div>
          <span
            onClick={() => setTracingOrder(row)}
            className="font-bold text-slate-900 hover:text-[#0284C7] hover:underline cursor-pointer block truncate transition-colors"
            title={`Click to view lifecycle tracking for ${row.customerName}`}
          >
            {row.customerName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {row.quotationId ? `Quo: ${row.quotationId}` : 'Direct Contract'}
          </span>
        </div>
      ),
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-bold text-slate-800 text-xs bg-sky-50 px-3 py-1 rounded-full border border-sky-100 min-w-[115px] inline-flex items-center justify-center whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      header: 'Order Value',
      accessor: 'amount',
      sortable: true,
      cell: ({ value }) => (
        <span className="font-extrabold text-slate-900 text-xs">{formatCurrency(value)}</span>
      ),
    },
    {
      header: 'Payment Status',
      accessor: 'paymentStatus',
      cell: ({ value, row }) => {
        const isDone = isOrderFullyExecuted(row);
        const text = isDone ? 'Full payment received' : value;
        const isFull = isDone || text?.toLowerCase().includes('full');
        return (
          <span
            className={`min-w-[155px] h-6.5 inline-flex items-center justify-center px-3 rounded-full text-[11px] font-bold border whitespace-nowrap ${
              isFull
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {text}
          </span>
        );
      },
    },
    {
      header: 'Order Status',
      accessor: 'orderStatus',
      cell: ({ value, row }) => {
        const isDone = isOrderFullyExecuted(row);
        return <StatusBadge status={isDone ? 'Done' : value} />;
      },
    },
    {
      header: 'Trace Execution',
      cell: ({ row }) => {
        const milestones = row.milestones || [];
        const completedCount = milestones.filter((m) => m.status === 'Completed').length;
        const total = milestones.length || 5;
        const percent = Math.min(100, Math.round((completedCount / total) * 100));
        const is100 = percent === 100;

        return (
          <div className="w-28 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>Progress</span>
              <span className={`font-bold ${is100 ? 'text-emerald-600' : 'text-[#0284C7]'}`}>{percent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  is100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#0284C7] to-emerald-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => setTracingOrder(row)}
          className="h-7.5 px-3 min-w-[105px] inline-flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] text-xs font-semibold rounded-lg transition shadow-2xs whitespace-nowrap cursor-pointer"
          title="Trace order workflow milestones"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Trace Order</span>
        </button>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Order Tracking & Contract Conversion"
        subtitle="Monitor customer purchase orders, DISCOM liaison filings, warehouse dispatch stages, and commissioning"
      />

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'Confirmed', label: 'Confirmed' },
          { key: 'Processing', label: 'Processing' },
          { key: 'Dispatched', label: 'Dispatched' },
          { key: 'Installed', label: 'Installed' },
          { key: 'Done', label: 'Done' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#0284C7] text-white shadow-card'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={loading}
        error={error}
        emptyTitle="No orders tracked"
        emptyMessage="Convert accepted customer quotations into confirmed installation orders."
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search order ref, customer, capacity..."
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {/* MODAL: Trace Order Milestones */}
      <Modal
        isOpen={!!tracingOrder}
        onClose={() => setTracingOrder(null)}
        title={`Order Lifecycle Tracker: ${tracingOrder?.id}`}
        size="md"
      >
        {tracingOrder && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F0F7FF] to-white border border-[#BAE6FD] flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {tracingOrder.customerName}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  System: {tracingOrder.capacity} • Value: {formatCurrency(tracingOrder.amount)}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Payment: {isOrderFullyExecuted(tracingOrder) ? 'Full payment received' : tracingOrder.paymentStatus}
                </p>
              </div>
              <StatusBadge status={isOrderFullyExecuted(tracingOrder) ? 'Done' : tracingOrder.orderStatus} />
            </div>

            {/* Stepper Milestones */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Execution Workflow Milestones:
              </h4>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {(tracingOrder.milestones || []).map((m, idx) => {
                  const isDone = m.status === 'Completed';
                  const isInProgress = m.status === 'In Progress';

                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-300 ${
                          isDone
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                            : isInProgress
                            ? 'bg-[#0284C7] text-white ring-4 ring-sky-50 animate-pulse'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${isDone ? 'text-slate-900' : 'text-slate-700'}`}>
                            {m.step}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {m.date ? `Completed on ${m.date}` : isInProgress ? 'Currently Active Stage' : 'Pending Preceding Stage'}
                          </span>
                        </div>

                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-xs animate-fade-in">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span>Done</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpdateMilestone(idx)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            <span>Mark Done</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setTracingOrder(null)}>
                Close Tracker
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrdersPage;
