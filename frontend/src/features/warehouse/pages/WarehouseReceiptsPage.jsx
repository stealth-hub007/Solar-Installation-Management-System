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
  ArrowDownToLine,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Boxes,
  ShieldCheck,
} from 'lucide-react';

import {
  fetchReceipts,
  saveReceipt,
  deleteReceipt,
  fetchPurchases,
} from '../slices/warehouseProcurementSlice';
import { addStock } from '../slices/warehouseInventorySlice';

export const WarehouseReceiptsPage = () => {
  const dispatch = useDispatch();
  const { receipts, purchases, loading } = useSelector((state) => state.warehouseProcurement);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isNewReceiptOpen, setIsNewReceiptOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  // Form State
  const initialForm = {
    poNumber: '',
    supplierName: '',
    warehouseName: 'Jaipur Central Solar Logistics Hub',
    receiptDate: new Date().toISOString().split('T')[0],
    productName: '',
    sku: '',
    orderedQty: 50,
    receivedQty: 50,
    acceptedQty: 48,
    rejectedQty: 2,
    unit: 'Piece',
    inspector: 'Devendra Rathore (QA Lead)',
    inspectionNotes: 'EL luminescence and visual frame checks completed',
  };
  const [receiptForm, setReceiptForm] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchReceipts());
    dispatch(fetchPurchases());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchReceipts());
    dispatch(fetchPurchases());
  };

  const handleSelectPo = (e) => {
    const poNum = e.target.value;
    const po = purchases.find((p) => p.poNumber === poNum);
    if (po) {
      setReceiptForm({
        ...receiptForm,
        poNumber: po.poNumber,
        supplierName: po.supplierName,
        productName: po.items?.[0]?.productName || '',
        sku: po.items?.[0]?.sku || '',
        orderedQty: po.items?.[0]?.orderedQty || 50,
        receivedQty: po.items?.[0]?.orderedQty || 50,
        acceptedQty: po.items?.[0]?.orderedQty || 50,
        rejectedQty: 0,
        unit: po.items?.[0]?.unit || 'Piece',
      });
    } else {
      setReceiptForm({ ...receiptForm, poNumber: poNum });
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (rc) => {
    setEditingReceipt(rc);
    const it = rc.items?.[0] || {};
    setReceiptForm({
      poNumber: rc.poNumber || '',
      supplierName: rc.supplierName || '',
      warehouseName: rc.warehouseName || 'Jaipur Central Solar Logistics Hub',
      receiptDate: rc.receiptDate || new Date().toISOString().split('T')[0],
      productName: it.productName || rc.productName || '',
      sku: it.sku || rc.sku || '',
      orderedQty: it.orderedQty || 50,
      receivedQty: it.receivedQty || 50,
      acceptedQty: it.acceptedQty || 48,
      rejectedQty: it.rejectedQty || 2,
      unit: it.unit || 'Piece',
      inspector: rc.inspector || 'Devendra Rathore (QA Lead)',
      inspectionNotes: rc.inspectionNotes || '',
    });
  };

  // Submit Add or Edit
  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    const accepted = Number(receiptForm.acceptedQty);
    const rejected = Number(receiptForm.rejectedQty);

    const payload = {
      id: editingReceipt ? editingReceipt.id : `grn-${Date.now()}`,
      receiptNumber: editingReceipt ? editingReceipt.receiptNumber : `GRN-2026-${String(receipts.length + 81).padStart(3, '0')}`,
      poNumber: receiptForm.poNumber || 'PO-2026-DIRECT',
      supplierName: receiptForm.supplierName || 'Approved Solar Vendor',
      warehouseName: receiptForm.warehouseName,
      receiptDate: receiptForm.receiptDate,
      inspector: receiptForm.inspector,
      inspectionNotes: receiptForm.inspectionNotes,
      status: rejected > 0 ? 'PARTIAL_ACCEPTANCE' : 'ACCEPTED',
      items: [
        {
          productName: receiptForm.productName || 'Solar PV Hardware',
          sku: receiptForm.sku || 'SOL-SKU-01',
          orderedQty: Number(receiptForm.orderedQty),
          receivedQty: Number(receiptForm.receivedQty),
          acceptedQty: accepted,
          rejectedQty: rejected,
          unit: receiptForm.unit,
        },
      ],
    };

    await dispatch(saveReceipt(payload));
    setIsNewReceiptOpen(false);
    setEditingReceipt(null);
    setReceiptForm(initialForm);
    loadData();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return;
    await dispatch(deleteReceipt(receiptToDelete.id));
    setReceiptToDelete(null);
    loadData();
  };

  // Filter & Pagination
  const filteredReceipts = useMemo(() => {
    let result = Array.isArray(receipts) ? [...receipts] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.receiptNumber?.toLowerCase().includes(q) ||
          r.poNumber?.toLowerCase().includes(q) ||
          r.supplierName?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [receipts, debouncedSearch]);

  const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
  const paginatedReceipts = filteredReceipts.slice(
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
              Goods Receipt Notes (GRN) & Inward QA
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {receipts.length} Recorded Receipts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quality assurance inspection, batch verification, physical counts against Purchase Orders, and accepted stock balance incrementing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh GRNs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setReceiptForm(initialForm);
              setEditingReceipt(null);
              setIsNewReceiptOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Generate Goods Receipt (GRN)</span>
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
            placeholder="Search by GRN number, PO number, or supplier..."
            className="pl-9 text-xs"
          />
        </div>
      </Card>

      {/* Receipts Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">GRN Number & Date</th>
                <th className="py-3 px-4">Referenced PO</th>
                <th className="py-3 px-4">Supplier & Hub</th>
                <th className="py-3 px-4">Items Received</th>
                <th className="py-3 px-4 text-center">Accepted Qty</th>
                <th className="py-3 px-4 text-center">Rejected Qty</th>
                <th className="py-3 px-4">QA Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReceipts.map((rc) => {
                const item = rc.items?.[0] || {};
                const rejected = Number(item.rejectedQty || 0);

                return (
                  <tr key={rc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{rc.receiptNumber}</div>
                      <div className="text-[10px] text-slate-400">{rc.receiptDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded text-[11px]">
                        {rc.poNumber}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rc.supplierName}</div>
                      <div className="text-[10px] text-slate-400">{rc.warehouseName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.productName || 'Solar Equipment'}</div>
                      <div className="text-[10px] text-slate-400">
                        Total Received: <span className="font-bold text-slate-700">{item.receivedQty || 0} {item.unit || 'Piece'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.acceptedQty || item.receivedQty || 0}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          rejected > 0
                            ? 'text-rose-600 bg-rose-50 border border-rose-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {rejected}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rejected === 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rejected === 0 ? 'Full Pass' : 'Partial Rejection'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingReceipt(rc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                          title="View GRN Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(rc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="Edit GRN"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReceiptToDelete(rc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete GRN"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedReceipts.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <ArrowDownToLine className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No goods receipt notes recorded matching the filter.
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
          totalRecords={filteredReceipts.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Add / Edit GRN */}
      <Modal
        isOpen={isNewReceiptOpen || Boolean(editingReceipt)}
        onClose={() => {
          setIsNewReceiptOpen(false);
          setEditingReceipt(null);
        }}
        title={editingReceipt ? `Edit Goods Receipt Note: ${editingReceipt.receiptNumber}` : 'Record Incoming Shipment (GRN)'}
      >
        <form onSubmit={handleSubmitReceipt} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Purchase Order (Optional)
              </label>
              <select
                value={receiptForm.poNumber}
                onChange={handleSelectPo}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="">-- Direct Consignment / Unlinked --</option>
                {purchases.map((p) => (
                  <option key={p.id} value={p.poNumber}>
                    {p.poNumber} - {p.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receiving Warehouse Depot *
              </label>
              <Input
                required
                value={receiptForm.warehouseName}
                onChange={(e) => setReceiptForm({ ...receiptForm, warehouseName: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Inspection Line Items
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Product Description *
                </label>
                <Input
                  required
                  value={receiptForm.productName}
                  onChange={(e) => setReceiptForm({ ...receiptForm, productName: e.target.value })}
                  placeholder="e.g. Tata Power 540W Mono PERC Panel"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Supplier Name *
                </label>
                <Input
                  required
                  value={receiptForm.supplierName}
                  onChange={(e) => setReceiptForm({ ...receiptForm, supplierName: e.target.value })}
                  placeholder="e.g. Tata Power Solar"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Total Received *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={receiptForm.receivedQty}
                  onChange={(e) => {
                    const val = e.target.value;
                    setReceiptForm({
                      ...receiptForm,
                      receivedQty: val,
                      acceptedQty: val,
                      rejectedQty: 0,
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 mb-1">
                  Accepted (QA Pass) *
                </label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={receiptForm.acceptedQty}
                  onChange={(e) => setReceiptForm({ ...receiptForm, acceptedQty: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                  Rejected (Damaged) *
                </label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={receiptForm.rejectedQty}
                  onChange={(e) => setReceiptForm({ ...receiptForm, rejectedQty: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                QA Inspector In-Charge *
              </label>
              <Input
                required
                value={receiptForm.inspector}
                onChange={(e) => setReceiptForm({ ...receiptForm, inspector: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt / Unloading Date *
              </label>
              <Input
                type="date"
                required
                value={receiptForm.receiptDate}
                onChange={(e) => setReceiptForm({ ...receiptForm, receiptDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quality Inspection Notes & Seal Verification
            </label>
            <textarea
              rows="2"
              value={receiptForm.inspectionNotes}
              onChange={(e) => setReceiptForm({ ...receiptForm, inspectionNotes: e.target.value })}
              placeholder="e.g. Visual inspection passed, glass intact, junction boxes tested..."
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsNewReceiptOpen(false);
                setEditingReceipt(null);
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
              {editingReceipt ? 'Update GRN' : 'Authorize & Inward Stock'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View GRN Details */}
      <Modal
        isOpen={Boolean(viewingReceipt)}
        onClose={() => setViewingReceipt(null)}
        title="Goods Receipt Verification Note"
      >
        {viewingReceipt && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">{viewingReceipt.receiptNumber}</span>
                <span className="font-mono font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                  PO: {viewingReceipt.poNumber}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{viewingReceipt.supplierName}</h3>
              <p className="text-slate-500">Unloaded at: {viewingReceipt.warehouseName}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Received</span>
                <span className="text-sm font-bold text-slate-800">
                  {viewingReceipt.items?.[0]?.receivedQty || 0}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-emerald-600 block text-[10px] uppercase font-bold">Accepted QA</span>
                <span className="text-sm font-bold text-emerald-700">
                  {viewingReceipt.items?.[0]?.acceptedQty || 0}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded border border-rose-200">
                <span className="text-rose-600 block text-[10px] uppercase font-bold">Rejected QA</span>
                <span className="text-sm font-bold text-rose-700">
                  {viewingReceipt.items?.[0]?.rejectedQty || 0}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Inspector & Audit Remarks</span>
              <div className="font-semibold text-slate-800 mt-0.5">{viewingReceipt.inspector}</div>
              <p className="text-slate-600 mt-1 italic">{viewingReceipt.inspectionNotes || 'Standard receipt validation.'}</p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete GRN */}
      <ConfirmDialog
        isOpen={Boolean(receiptToDelete)}
        onClose={() => setReceiptToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Void Goods Receipt (GRN)"
        message={`Are you sure you want to void ${receiptToDelete?.receiptNumber}? This will reverse the recorded consignment receipt.`}
        confirmText="Yes, Void GRN"
        type="danger"
      />
    </PageContainer>
  );
};

export default WarehouseReceiptsPage;
