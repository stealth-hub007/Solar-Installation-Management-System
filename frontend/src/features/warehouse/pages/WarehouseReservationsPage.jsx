import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Search,
  ShoppingCart,
  Boxes,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

import { fetchConfirmedOrders } from '../slices/warehouseDispatchSlice';
import { reserveStockForOrder, fetchInventory } from '../slices/warehouseInventorySlice';

export const WarehouseReservationsPage = () => {
  const dispatch = useDispatch();
  const { confirmedOrders, loading } = useSelector((state) => state.warehouseDispatch);
  const { items: inventory, mutating } = useSelector((state) => state.warehouseInventory);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reserveSuccess, setReserveSuccess] = useState('');
  const [reserveError, setReserveError] = useState('');

  const loadData = () => {
    dispatch(fetchConfirmedOrders());
    dispatch(fetchInventory());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleReserveStock = async (orderId, orderNum) => {
    setReserveSuccess('');
    setReserveError('');

    const res = await dispatch(reserveStockForOrder(orderId));
    if (!res.error) {
      setReserveSuccess(`Stock successfully reserved and committed for Order ${orderNum}.`);
      loadData();
    } else {
      setReserveError(res.payload || 'Reservation failed. Check available stock.');
    }
  };

  // Filter & Pagination
  const filteredOrders = useMemo(() => {
    let result = Array.isArray(confirmedOrders) ? [...confirmedOrders] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.id?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [confirmedOrders, debouncedSearch]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Order Stock Reservations & Lock
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {confirmedOrders.length} Confirmed Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Committed bill-of-materials locking preventing double-allocation of solar modules and inverters prior to packaging and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {reserveSuccess && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{reserveSuccess}</span>
        </div>
      )}

      {reserveError && (
        <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{reserveError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 mb-6 shadow-sm">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by order number or customer name..."
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Order Ref & Date</th>
                <th className="py-3 px-4">Customer & System Capacity</th>
                <th className="py-3 px-4">Installation Site</th>
                <th className="py-3 px-4">Order Value (₹)</th>
                <th className="py-3 px-4">Reservation Status</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.map((ord) => {
                const isReserved = ord.is_reserved || ord.status === 'READY_FOR_DISPATCH' || ord.status === 'DISPATCHED';

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{ord.order_number || ord.id?.substring(0, 8)}</div>
                      <div className="text-[10px] text-slate-400">{ord.created_at?.split('T')[0] || '2026-10-31'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{ord.customer_name || 'Customer Project'}</div>
                      <div className="text-[10px] text-[#0284C7] font-semibold">{ord.capacity || '5kW On-Grid System'}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {ord.site_address || 'Jaipur, Rajasthan'}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{Number(ord.total_amount || 275000).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      {isReserved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Lock className="w-3 h-3" /> Locked & Allocated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending Allocation
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isReserved ? (
                        <span className="text-xs text-slate-400 font-medium">BOM Protected</span>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={mutating}
                          onClick={() => handleReserveStock(ord.id, ord.order_number || ord.id?.substring(0, 8))}
                          className="text-xs bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center gap-1 ml-auto"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Reserve Stock</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No confirmed orders currently awaiting material reservation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filteredOrders.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default WarehouseReservationsPage;
