import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/common/Input';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  CheckCircle2,
  Plus,
  Search,
  ShieldCheck,
  FileCheck,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Truck,
} from 'lucide-react';

import {
  fetchDispatches,
  confirmDelivery,
  clearDispatchStatus,
} from '../slices/warehouseDispatchSlice';

export const WarehouseDeliveryConfirmationsPage = () => {
  const dispatch = useDispatch();
  const { dispatches, loading, mutating, successMessage, error } = useSelector(
    (state) => state.warehouseDispatch
  );

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const [confirmForm, setConfirmForm] = useState({
    dispatch_id: '',
    received_by_name: '',
    delivery_date: new Date().toISOString().split('T')[0],
    proofNotes: 'Customer on-site equipment handover signed with zero transit damages',
  });

  useEffect(() => {
    dispatch(fetchDispatches());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchDispatches());
  };

  const openConfirmModal = (d) => {
    setSelectedDispatch(d);
    setConfirmForm({
      dispatch_id: d.id,
      received_by_name: '',
      delivery_date: new Date().toISOString().split('T')[0],
      proofNotes: 'Customer on-site equipment handover signed with zero transit damages',
    });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    if (!confirmForm.dispatch_id || !confirmForm.received_by_name) return;

    try {
      await dispatch(
        confirmDelivery({
          dispatchId: confirmForm.dispatch_id,
          payload: {
            delivery_date: confirmForm.delivery_date,
            received_by: confirmForm.received_by_name,
            notes: confirmForm.proofNotes,
          },
        })
      ).unwrap();
      setIsConfirmModalOpen(false);
      loadData();
    } catch (err) {
      alert(err || 'Failed to confirm delivery');
    }
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
          (d.vehicleNumber || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [dispatches, debouncedSearch]);

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
              On-Site Delivery Confirmations (POD)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Warranty Trigger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proof of delivery (POD) capture, customer material receipt sign-off, and automated solar installation warranty activation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh confirmations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
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
            placeholder="Search by consignment #, customer, or vehicle..."
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Consignment #</th>
                <th className="py-3 px-4">Customer Project</th>
                <th className="py-3 px-4">Installation Site</th>
                <th className="py-3 px-4">Vehicle & Carrier</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4 text-right">POD Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDispatches.map((dsp, idx) => {
                const isDelivered = (dsp.status || dsp.dispatch_status) === 'DELIVERED';

                return (
                  <tr key={dsp.id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {dsp.dispatchNumber || dsp.dispatch_number || `DSP-2026-0${idx + 1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dsp.dispatchDate || '2026-10-31'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{dsp.customerName || 'Customer Project'}</div>
                      <div className="text-[10px] text-slate-400">Order: {dsp.orderNumber || dsp.order_id?.substring(0, 8)}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {dsp.destinationAddress || 'Jaipur, Rajasthan'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-700">{dsp.vehicleNumber || 'RJ-14-EA-4412'}</div>
                      <div className="text-[10px] text-slate-400">{dsp.transporterName || 'SunPower Logistics'}</div>
                    </td>

                    <td className="py-3 px-4">
                      {isDelivered ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed (POD)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          <Truck className="w-3 h-3 text-amber-600" /> In Transit
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isDelivered ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Warranty Active</span>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openConfirmModal(dsp)}
                          className="text-xs bg-[#0284C7] hover:bg-[#0369A1] text-white flex items-center gap-1 ml-auto"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Sign POD</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedDispatches.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No consignments matching your search.
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

      {/* Modal: Confirm Delivery */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Execute On-Site Delivery Confirmation (POD)"
      >
        {selectedDispatch && (
          <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">
                Consignment: {selectedDispatch.dispatchNumber || selectedDispatch.dispatch_number}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Customer: {selectedDispatch.customerName} • Destination: {selectedDispatch.destinationAddress || 'Installation Site'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Recipient / Client Name *
              </label>
              <Input
                required
                value={confirmForm.received_by_name}
                onChange={(e) => setConfirmForm({ ...confirmForm, received_by_name: e.target.value })}
                placeholder="e.g. Rajesh Sharma (Customer)"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Handover Date *
              </label>
              <Input
                type="date"
                required
                value={confirmForm.delivery_date}
                onChange={(e) => setConfirmForm({ ...confirmForm, delivery_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proof of Delivery Remarks & Physical Verification
              </label>
              <textarea
                rows="2"
                value={confirmForm.proofNotes}
                onChange={(e) => setConfirmForm({ ...confirmForm, proofNotes: e.target.value })}
                placeholder="e.g. Unloaded safely, module serials scanned, handover accepted without discrepancy."
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border"
              />
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Confirming this delivery will automatically activate standard equipment warranties.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
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
                {mutating ? 'Confirming...' : 'Validate & Complete Delivery'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default WarehouseDeliveryConfirmationsPage;
