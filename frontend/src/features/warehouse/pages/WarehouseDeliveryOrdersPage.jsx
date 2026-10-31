import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/common/Input';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Eye,
  MapPin,
  Calendar,
} from 'lucide-react';

import { fetchDispatches } from '../slices/warehouseDispatchSlice';
import { DISPATCH_STATUSES } from '../utils/warehouseConstants';

export const WarehouseDeliveryOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { dispatches, loading } = useSelector((state) => state.warehouseDispatch);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewingDelivery, setViewingDelivery] = useState(null);

  useEffect(() => {
    dispatch(fetchDispatches());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchDispatches());
  };

  // Filter & Pagination
  const filteredDispatches = useMemo(() => {
    let result = Array.isArray(dispatches) ? [...dispatches] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (d) =>
          (d.dispatchNumber || d.dispatch_number || '').toLowerCase().includes(q) ||
          (d.customerName || '').toLowerCase().includes(q) ||
          (d.vehicleNumber || '').toLowerCase().includes(q) ||
          (d.remarks || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((d) => (d.status || d.dispatch_status) === statusFilter);
    }

    return result;
  }, [dispatches, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredDispatches.length / pageSize) || 1;
  const paginatedDispatches = filteredDispatches.slice(
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
              Delivery Orders & Transportation Manifests
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {dispatches.length} Total Shipments
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track logistics transport vehicles, on-road shipments, carrier assignments, and milestone delivery status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh delivery orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/warehouse/delivery-confirmations')}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Confirm Delivery (POD)</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by consignment #, customer, driver, or vehicle..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
            >
              <option value="ALL">All Transit Statuses</option>
              {Object.keys(DISPATCH_STATUSES).map((k) => (
                <option key={k} value={k}>
                  {DISPATCH_STATUSES[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Delivery Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Shipment # & Date</th>
                <th className="py-3 px-4">Customer Project</th>
                <th className="py-3 px-4">Transporter & Driver</th>
                <th className="py-3 px-4">Vehicle #</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDispatches.map((dsp, idx) => {
                const status = dsp.status || dsp.dispatch_status || 'PREPARING';

                return (
                  <tr key={dsp.id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {dsp.dispatchNumber || dsp.dispatch_number || `DSP-2026-0${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dsp.dispatchDate || dsp.created_at?.split('T')[0] || '2026-10-31'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{dsp.customerName || 'Customer Project'}</div>
                      <div className="text-[10px] text-slate-400">Order: {dsp.orderNumber || dsp.order_id?.substring(0, 8)}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{dsp.transporterName || 'SunPower Logistics'}</div>
                      <div className="text-[10px] text-slate-400">{dsp.driverName || 'Driver Lead'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {dsp.vehicleNumber || 'RJ-14-EA-4412'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : status === 'DISPATCHED'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingDelivery(dsp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                          title="View Shipment Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {status !== 'DELIVERED' && (
                          <button
                            onClick={() => navigate('/warehouse/delivery-confirmations')}
                            className="text-[11px] text-[#0284C7] font-semibold hover:underline px-2 py-1"
                          >
                            Mark Delivered →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedDispatches.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No delivery shipments matching the filter.
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
          totalRecords={filteredDispatches.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: View Shipment */}
      <Modal
        isOpen={Boolean(viewingDelivery)}
        onClose={() => setViewingDelivery(null)}
        title="Delivery Shipment Manifest"
      >
        {viewingDelivery && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">
                  {viewingDelivery.dispatchNumber || viewingDelivery.dispatch_number}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {viewingDelivery.status || viewingDelivery.dispatch_status}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{viewingDelivery.customerName || 'Customer Project'}</h3>
              <p className="text-slate-500">Destination: {viewingDelivery.destinationAddress || 'Jaipur, Rajasthan'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle & Carrier</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewingDelivery.vehicleNumber || 'RJ-14-EA-4412'}</span>
                <span className="text-slate-500 block text-xs mt-0.5">{viewingDelivery.transporterName || 'SunPower Logistics'}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Driver Details</span>
                <span className="font-bold text-slate-900 block mt-0.5">{viewingDelivery.driverName || 'Driver Lead'}</span>
                <span className="text-slate-500 block text-xs mt-0.5">{viewingDelivery.driverPhone || '+91 98290 00000'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingDelivery(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default WarehouseDeliveryOrdersPage;
