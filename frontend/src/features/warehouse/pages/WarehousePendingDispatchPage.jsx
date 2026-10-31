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
  Plus,
  Search,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertTriangle,
  FileText,
  Boxes,
  RefreshCw,
  Eye,
  MapPin,
} from 'lucide-react';

import {
  fetchDispatches,
  createDispatch,
  fetchConfirmedOrders,
} from '../slices/warehouseDispatchSlice';
import { fetchInventory } from '../slices/warehouseInventorySlice';

export const WarehousePendingDispatchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { dispatches, confirmedOrders, loading, mutating } = useSelector(
    (state) => state.warehouseDispatch
  );
  const { items: inventory } = useSelector((state) => state.warehouseInventory);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isNewDispatchOpen, setIsNewDispatchOpen] = useState(false);
  const [viewingDispatch, setViewingDispatch] = useState(null);

  // New dispatch form
  const [dispatchForm, setDispatchForm] = useState({
    order_id: '',
    warehouse_id: 'wh-main',
    vehicleNumber: 'RJ-14-EA-4412',
    transporterName: 'SunPower Express Logistics',
    driverName: 'Ramesh Kumawat',
    driverPhone: '+91 98291 55678',
    remarks: 'Installation kit staged and secured for transport',
  });

  const loadData = () => {
    dispatch(fetchDispatches());
    dispatch(fetchConfirmedOrders());
    dispatch(fetchInventory());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchForm.order_id) return;

    try {
      await dispatch(
        createDispatch({
          order_id: dispatchForm.order_id,
          warehouse_id: dispatchForm.warehouse_id,
          vehicle_number: dispatchForm.vehicleNumber,
          transporter_name: dispatchForm.transporterName,
          driver_name: dispatchForm.driverName,
          driver_phone: dispatchForm.driverPhone,
          remarks: dispatchForm.remarks,
        })
      ).unwrap();
      setIsNewDispatchOpen(false);
      loadData();
    } catch (err) {
      alert(err || 'Failed to stage dispatch package');
    }
  };

  // Pending queue: orders in PREPARING or PENDING stage
  const pendingDispatches = useMemo(() => {
    let list = dispatches.filter(
      (d) => d.status === 'PREPARING' || d.status === 'PENDING' || !d.status
    );

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (d) =>
          d.dispatchNumber?.toLowerCase().includes(q) ||
          d.orderNumber?.toLowerCase().includes(q) ||
          d.customerName?.toLowerCase().includes(q) ||
          d.vehicleNumber?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [dispatches, debouncedSearch]);

  const totalPages = Math.ceil(pendingDispatches.length / pageSize) || 1;
  const paginatedDispatches = pendingDispatches.slice(
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
              Order Staging & Pending Dispatch Queue
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {pendingDispatches.length} Staged Packages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick-and-pack fulfillment, solar hardware staging, carrier vehicle assignment, and dispatch gate clearance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh dispatch queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewDispatchOpen(true)}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Dispatch Package</span>
          </Button>
        </div>
      </div>

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
            placeholder="Search dispatch by customer, consignment #, or vehicle..."
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Dispatches Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Consignment # & Date</th>
                <th className="py-3 px-4">Order & Customer</th>
                <th className="py-3 px-4">Destination Site</th>
                <th className="py-3 px-4">Carrier & Vehicle</th>
                <th className="py-3 px-4">Staging Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDispatches.map((dsp, idx) => (
                <tr key={dsp.id || idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{dsp.dispatchNumber || `DSP-2026-0${idx + 1}`}</div>
                    <div className="text-[10px] text-slate-400">{dsp.dispatchDate || '2026-10-31'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{dsp.customerName || 'Customer Project'}</div>
                    <div className="text-[10px] text-[#0284C7] font-semibold">{dsp.orderNumber || 'ORD-1082'}</div>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{dsp.destinationAddress || 'Jaipur, Rajasthan'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-700">{dsp.vehicleNumber || 'RJ-14-EA-4412'}</div>
                    <div className="text-[10px] text-slate-400">{dsp.transporterName || 'SunPower Logistics'}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      {dsp.status || 'PREPARING'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingDispatch(dsp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                        title="View Consignment"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate('/warehouse/delivery-orders')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0284C7] hover:bg-[#0369A1] text-white transition flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Gate Out</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedDispatches.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No orders currently in the staging queue.
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
          totalRecords={pendingDispatches.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Create Dispatch */}
      <Modal
        isOpen={isNewDispatchOpen}
        onClose={() => setIsNewDispatchOpen(false)}
        title="Package Staging & Gate Pass Generation"
      >
        <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Approved Customer Order *
            </label>
            <select
              required
              value={dispatchForm.order_id}
              onChange={(e) => setDispatchForm({ ...dispatchForm, order_id: e.target.value })}
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
            >
              <option value="">-- Choose Order to Dispatch --</option>
              {confirmedOrders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.order_number || ord.id.substring(0, 8)} - {ord.customer_name} ({ord.capacity || '5kW System'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transport Carrier / Logistics Partner *
              </label>
              <Input
                required
                value={dispatchForm.transporterName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, transporterName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Registration # *
              </label>
              <Input
                required
                value={dispatchForm.vehicleNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Name *
              </label>
              <Input
                required
                value={dispatchForm.driverName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, driverName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Contact Phone *
              </label>
              <Input
                required
                value={dispatchForm.driverPhone}
                onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Staging & Handling Instructions
            </label>
            <Input
              value={dispatchForm.remarks}
              onChange={(e) => setDispatchForm({ ...dispatchForm, remarks: e.target.value })}
              placeholder="e.g. Fragile PV modules tied with ratchet straps"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsNewDispatchOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={mutating}
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white"
            >
              {mutating ? 'Creating...' : 'Stage & Create Gate Pass'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Dispatch Dossier */}
      <Modal
        isOpen={Boolean(viewingDispatch)}
        onClose={() => setViewingDispatch(null)}
        title="Dispatch Consignment Pass"
      >
        {viewingDispatch && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">{viewingDispatch.dispatchNumber || 'DSP-709'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {viewingDispatch.status || 'PREPARING'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{viewingDispatch.customerName || 'Customer Project'}</h3>
              <p className="text-slate-500">Order: {viewingDispatch.orderNumber || 'ORD-1082'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle & Carrier</span>
                <span className="font-mono font-bold text-slate-900 block mt-0.5">{viewingDispatch.vehicleNumber || 'RJ-14-EA-4412'}</span>
                <span className="text-slate-500 block text-xs mt-0.5">{viewingDispatch.transporterName || 'SunPower Logistics'}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Driver Details</span>
                <span className="font-bold text-slate-900 block mt-0.5">{viewingDispatch.driverName || 'Ramesh Kumawat'}</span>
                <span className="text-slate-500 block text-xs mt-0.5">{viewingDispatch.driverPhone || '+91 98291 55678'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingDispatch(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default WarehousePendingDispatchPage;
