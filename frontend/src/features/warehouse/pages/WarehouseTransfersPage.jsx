import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/common/Input';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Warehouse,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';

import {
  fetchTransfers,
  saveTransfer,
  deleteTransfer,
} from '../slices/warehouseProcurementSlice';
import { WAREHOUSES, TRANSFER_STATUSES } from '../utils/warehouseConstants';

export const WarehouseTransfersPage = () => {
  const dispatch = useDispatch();
  const { transfers, loading } = useSelector((state) => state.warehouseProcurement);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [transferToDelete, setTransferToDelete] = useState(null);
  const [viewingTransfer, setViewingTransfer] = useState(null);

  // Form State
  const initialForm = {
    fromWarehouse: 'Jaipur Central Solar Logistics Hub',
    toWarehouse: 'Udaipur Regional Depot',
    productName: 'Tata Power 540W Mono PERC Panel',
    sku: 'SP-TAT-540M',
    quantity: 20,
    vehicleNumber: 'RJ-14-GA-9021',
    driverName: 'Surender Singh',
    status: 'IN_TRANSIT',
    notes: 'Buffer replenishment for scheduled regional rooftop installations',
  };
  const [transferForm, setTransferForm] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchTransfers());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchTransfers());
  };

  // Open Edit
  const handleOpenEdit = (tr) => {
    setEditingTransfer(tr);
    const item = tr.items?.[0] || {};
    setTransferForm({
      fromWarehouse: tr.fromWarehouse || 'Jaipur Central Solar Logistics Hub',
      toWarehouse: tr.toWarehouse || 'Udaipur Regional Depot',
      productName: item.productName || tr.productName || '',
      sku: item.sku || tr.sku || '',
      quantity: item.quantity || tr.quantity || 20,
      vehicleNumber: tr.vehicleNumber || '',
      driverName: tr.driverName || '',
      status: tr.status || 'IN_TRANSIT',
      notes: tr.notes || '',
    });
  };

  // Submit Add or Edit
  const handleSubmitTransfer = async (e) => {
    e.preventDefault();
    if (transferForm.fromWarehouse === transferForm.toWarehouse) {
      alert('Source and destination warehouse must be different.');
      return;
    }

    const payload = {
      id: editingTransfer ? editingTransfer.id : `tr-${Date.now()}`,
      transferNumber: editingTransfer ? editingTransfer.transferNumber : `TR-2026-${String(transfers.length + 41).padStart(4, '0')}`,
      fromWarehouse: transferForm.fromWarehouse,
      toWarehouse: transferForm.toWarehouse,
      requestDate: editingTransfer?.requestDate || new Date().toISOString().split('T')[0],
      status: transferForm.status,
      vehicleNumber: transferForm.vehicleNumber,
      driverName: transferForm.driverName,
      notes: transferForm.notes,
      items: [
        {
          productName: transferForm.productName,
          sku: transferForm.sku,
          quantity: Number(transferForm.quantity),
          unit: 'Piece',
        },
      ],
    };

    await dispatch(saveTransfer(payload));
    setIsNewTransferOpen(false);
    setEditingTransfer(null);
    setTransferForm(initialForm);
    loadData();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!transferToDelete) return;
    await dispatch(deleteTransfer(transferToDelete.id));
    setTransferToDelete(null);
    loadData();
  };

  // Filtering & Pagination
  const filteredTransfers = useMemo(() => {
    let result = Array.isArray(transfers) ? [...transfers] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.transferNumber?.toLowerCase().includes(q) ||
          t.fromWarehouse?.toLowerCase().includes(q) ||
          t.toWarehouse?.toLowerCase().includes(q) ||
          t.vehicleNumber?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [transfers, debouncedSearch]);

  const totalPages = Math.ceil(filteredTransfers.length / pageSize) || 1;
  const paginatedTransfers = filteredTransfers.slice(
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
              Inter-Warehouse Transfers & Depots
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {transfers.length} Transfer Manifests
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Internal inventory rebalancing between Central Regional Logistics Hub and field depot stations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh transfers"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTransferForm(initialForm);
              setEditingTransfer(null);
              setIsNewTransferOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Initiate Stock Transfer</span>
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
            placeholder="Search by transfer manifest #, depot, or vehicle..."
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Transfers Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Transfer # & Date</th>
                <th className="py-3 px-4">Route (Origin → Destination)</th>
                <th className="py-3 px-4">Solar Hardware Transfer</th>
                <th className="py-3 px-4">Logistics Vehicle</th>
                <th className="py-3 px-4">Transit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTransfers.map((tr) => {
                const item = tr.items?.[0] || {};

                return (
                  <tr key={tr.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{tr.transferNumber}</div>
                      <div className="text-[10px] text-slate-400">{tr.requestDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{tr.fromWarehouse}</div>
                      <div className="flex items-center gap-1 text-[10px] text-[#0284C7] font-bold">
                        <span>→ {tr.toWarehouse}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.productName || 'Solar Hardware'}</div>
                      <div className="text-[10px] text-slate-400">
                        Qty: <span className="font-bold text-slate-700">{item.quantity || tr.quantity || 0} {item.unit || 'units'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-700">{tr.vehicleNumber || 'RJ-14-GA-9021'}</div>
                      <div className="text-[10px] text-slate-400">Driver: {tr.driverName || 'Depot Carrier'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          tr.status === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : tr.status === 'IN_TRANSIT'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tr.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingTransfer(tr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                          title="View Manifest"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(tr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="Edit Transfer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTransferToDelete(tr)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Transfer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedTransfers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No warehouse transfer manifests found.
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
          totalRecords={filteredTransfers.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Add / Edit Transfer */}
      <Modal
        isOpen={isNewTransferOpen || Boolean(editingTransfer)}
        onClose={() => {
          setIsNewTransferOpen(false);
          setEditingTransfer(null);
        }}
        title={editingTransfer ? `Edit Transfer: ${editingTransfer.transferNumber}` : 'Initiate Inter-Warehouse Transfer'}
      >
        <form onSubmit={handleSubmitTransfer} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Warehouse (Origin) *
              </label>
              <select
                required
                value={transferForm.fromWarehouse}
                onChange={(e) => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Depot (Target) *
              </label>
              <select
                required
                value={transferForm.toWarehouse}
                onChange={(e) => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <Input
                required
                value={transferForm.productName}
                onChange={(e) => setTransferForm({ ...transferForm, productName: e.target.value })}
                placeholder="e.g. Tata Power 540W Mono PERC Panel"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transfer Quantity (Units) *
              </label>
              <Input
                type="number"
                min="1"
                required
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transport Vehicle Number *
              </label>
              <Input
                required
                value={transferForm.vehicleNumber}
                onChange={(e) => setTransferForm({ ...transferForm, vehicleNumber: e.target.value })}
                placeholder="e.g. RJ-14-GA-9021"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transfer Status
              </label>
              <select
                value={transferForm.status}
                onChange={(e) => setTransferForm({ ...transferForm, status: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="REQUESTED">Requested</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="RECEIVED">Received & Verified</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dispatch Purpose & Notes
            </label>
            <Input
              value={transferForm.notes}
              onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
              placeholder="e.g. Buffer replenishment for customer rooftop orders"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsNewTransferOpen(false);
                setEditingTransfer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white"
            >
              {editingTransfer ? 'Update Transfer' : 'Authorize & Dispatch Transfer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Transfer Details */}
      <Modal
        isOpen={Boolean(viewingTransfer)}
        onClose={() => setViewingTransfer(null)}
        title="Transfer Manifest Dossier"
      >
        {viewingTransfer && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">{viewingTransfer.transferNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {viewingTransfer.status}
                </span>
              </div>
              <div className="mt-2 text-slate-700 font-semibold">
                From: {viewingTransfer.fromWarehouse}
              </div>
              <div className="text-[#0284C7] font-bold">
                To: {viewingTransfer.toWarehouse}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Equipment Transferred</span>
                <span className="font-bold text-slate-900 block text-sm mt-0.5">
                  {viewingTransfer.items?.[0]?.productName || viewingTransfer.productName}
                </span>
                <span className="text-slate-500 block text-xs mt-0.5">
                  Quantity: {viewingTransfer.items?.[0]?.quantity || viewingTransfer.quantity} Units
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle & Driver</span>
                <span className="font-mono font-bold text-slate-900 block text-sm mt-0.5">
                  {viewingTransfer.vehicleNumber || 'RJ-14-GA-9021'}
                </span>
                <span className="text-slate-500 block text-xs mt-0.5">
                  Driver: {viewingTransfer.driverName || 'Depot Carrier'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingTransfer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete Transfer */}
      <ConfirmDialog
        isOpen={Boolean(transferToDelete)}
        onClose={() => setTransferToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Void Transfer Manifest"
        message={`Are you sure you want to void ${transferToDelete?.transferNumber}?`}
        confirmText="Yes, Void Transfer"
        type="danger"
      />
    </PageContainer>
  );
};

export default WarehouseTransfersPage;
