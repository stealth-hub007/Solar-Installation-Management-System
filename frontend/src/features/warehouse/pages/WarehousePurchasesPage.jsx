import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
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
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  IndianRupee,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Building2,
  Truck,
  AlertCircle,
} from 'lucide-react';

import {
  fetchPurchases,
  savePurchase,
  deletePurchase,
  fetchSuppliers,
} from '../slices/warehouseProcurementSlice';
import { PURCHASE_STATUSES, WAREHOUSES } from '../utils/warehouseConstants';

export const WarehousePurchasesPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { purchases, suppliers, loading } = useSelector((state) => state.warehouseProcurement);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPo, setEditingPo] = useState(null);
  const [poToDelete, setPoToDelete] = useState(null);
  const [viewingPo, setViewingPo] = useState(null);

  // Form State
  const initialForm = {
    supplierId: '',
    warehouseId: 'wh-main',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: '',
    status: 'APPROVED',
    productName: '',
    sku: '',
    orderedQty: 20,
    unitPrice: 14200,
    unit: 'Piece',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchPurchases());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Handle passed state from Low Stock Alerts shortcut
  useEffect(() => {
    if (location.state?.productName) {
      setFormData((prev) => ({
        ...prev,
        productName: location.state.productName,
        sku: location.state.sku || '',
        orderedQty: location.state.suggestedQty || 20,
      }));
      setIsCreateModalOpen(true);
    }
  }, [location.state]);

  const loadData = () => {
    dispatch(fetchPurchases());
    dispatch(fetchSuppliers());
  };

  // Open Edit Modal
  const handleOpenEdit = (po) => {
    setEditingPo(po);
    const item = po.items && po.items[0] ? po.items[0] : {};
    setFormData({
      supplierId: po.supplierId || '',
      warehouseId: po.warehouseId || 'wh-main',
      orderDate: po.orderDate || new Date().toISOString().split('T')[0],
      expectedDeliveryDate: po.expectedDeliveryDate || '',
      notes: po.notes || '',
      status: po.status || 'APPROVED',
      productName: item.productName || '',
      sku: item.sku || '',
      orderedQty: item.orderedQty || 10,
      unitPrice: item.unitPrice || 10000,
      unit: item.unit || 'Piece',
    });
  };

  // Submit Add or Edit
  const handleSubmitPo = async (e) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === formData.supplierId);
    const wh = WAREHOUSES.find((w) => w.id === formData.warehouseId);
    const subtotal = Number(formData.orderedQty) * Number(formData.unitPrice);
    const tax = Math.round(subtotal * 0.12);

    const payload = {
      id: editingPo ? editingPo.id : `po-${Date.now()}`,
      poNumber: editingPo ? editingPo.poNumber : `PO-2026-${String(purchases.length + 881).padStart(4, '0')}`,
      supplierId: formData.supplierId,
      supplierName: sup ? sup.name : (editingPo?.supplierName || 'Waaree Energies Ltd.'),
      warehouseId: formData.warehouseId,
      warehouseName: wh ? wh.name : 'Jaipur Central Solar Logistics Hub',
      orderDate: formData.orderDate,
      expectedDeliveryDate: formData.expectedDeliveryDate || '2026-11-20',
      status: formData.status,
      totalAmount: subtotal + tax,
      taxAmount: tax,
      items: [
        {
          id: `poi-${Date.now()}`,
          productName: formData.productName || 'Solar PV Hardware',
          sku: formData.sku || 'SOL-SKU-01',
          orderedQty: Number(formData.orderedQty),
          receivedQty: editingPo?.items?.[0]?.receivedQty || 0,
          unitPrice: Number(formData.unitPrice),
          unit: formData.unit,
        },
      ],
      notes: formData.notes || 'Procurement order for warehouse inventory',
    };

    await dispatch(savePurchase(payload));
    setIsCreateModalOpen(false);
    setEditingPo(null);
    setFormData(initialForm);
    loadData();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!poToDelete) return;
    await dispatch(deletePurchase(poToDelete.id));
    setPoToDelete(null);
    loadData();
  };

  // Filtered and Paginated Purchases
  const filteredPurchases = useMemo(() => {
    let result = Array.isArray(purchases) ? [...purchases] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.poNumber?.toLowerCase().includes(q) ||
          p.supplierName?.toLowerCase().includes(q) ||
          p.items?.some((i) => i.productName?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }

    return result;
  }, [purchases, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredPurchases.length / pageSize) || 1;
  const paginatedPurchases = filteredPurchases.slice(
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
              Purchase Orders & Inbound Procurement
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {purchases.length} Purchase Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supplier purchase orders, delivery commitments, procurement line items, and status reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh POs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData(initialForm);
              setEditingPo(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create Purchase Order</span>
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
              placeholder="Search by PO number, vendor name, or product SKU..."
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
              <option value="ALL">All PO Statuses</option>
              {Object.keys(PURCHASE_STATUSES).map((k) => (
                <option key={k} value={k}>
                  {PURCHASE_STATUSES[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* PO Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">PO Number & Date</th>
                <th className="py-3 px-4">Vendor / Supplier</th>
                <th className="py-3 px-4">Line Items Summary</th>
                <th className="py-3 px-4">Total Amount (₹)</th>
                <th className="py-3 px-4">Expected Delivery</th>
                <th className="py-3 px-4">PO Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPurchases.map((po) => {
                const item = po.items && po.items[0] ? po.items[0] : null;

                return (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{po.poNumber}</div>
                      <div className="text-[10px] text-slate-400">{po.orderDate}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{po.supplierName}</div>
                      <div className="text-[10px] text-slate-400">{po.warehouseName}</div>
                    </td>

                    <td className="py-3 px-4">
                      {item ? (
                        <div>
                          <span className="font-semibold text-slate-900">{item.productName}</span>
                          <div className="text-[10px] text-slate-400">
                            Ordered: <span className="font-bold text-slate-700">{item.orderedQty} {item.unit}</span> • Recv: {item.receivedQty || 0}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No line items</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        ₹{Number(po.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Incl. 12% GST
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {po.expectedDeliveryDate || '2026-11-20'}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          po.status === 'RECEIVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : po.status === 'PARTIALLY_RECEIVED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : po.status === 'APPROVED'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : po.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {po.status || 'APPROVED'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingPo(po)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                          title="View PO Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(po)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                          title="Edit PO"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPoToDelete(po)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete / Cancel PO"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedPurchases.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No purchase orders match your criteria.
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
          totalRecords={filteredPurchases.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Create / Edit Purchase Order */}
      <Modal
        isOpen={isCreateModalOpen || Boolean(editingPo)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPo(null);
        }}
        title={editingPo ? `Edit Purchase Order: ${editingPo.poNumber}` : 'Issue New Equipment Purchase Order'}
      >
        <form onSubmit={handleSubmitPo} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Approved Supplier *
              </label>
              <select
                required
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="">-- Choose Vendor --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Warehouse Depot *
              </label>
              <select
                required
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                {WAREHOUSES.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Equipment Line Item Specification
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Product / SKU Description *
                </label>
                <Input
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g. Waaree 550W Bifacial Solar PV Panel"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  SKU Code
                </label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. SP-WAR-550B"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ordered Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={formData.orderedQty}
                  onChange={(e) => setFormData({ ...formData, orderedQty: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Unit Price (₹) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Unit of Measure
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
                >
                  <option value="Piece">Piece</option>
                  <option value="Pack">Pack</option>
                  <option value="Drum">Drum</option>
                </select>
              </div>
            </div>

            <div className="text-right text-xs font-semibold text-slate-700 pt-1">
              Estimated Total: ₹
              {(Number(formData.orderedQty) * Number(formData.unitPrice) * 1.12).toLocaleString('en-IN')}{' '}
              <span className="text-[10px] text-slate-400 font-normal">(Incl. 12% GST)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Delivery Date
              </label>
              <Input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PO Status Pipeline
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Approved & Issued</option>
                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                <option value="RECEIVED">Fully Received</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Delivery Terms & Instructions
            </label>
            <Input
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Unloading bay #2, notify warehouse manager 2 hours before arrival"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingPo(null);
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
              {editingPo ? 'Update Purchase Order' : 'Authorize & Issue PO'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View PO Details */}
      <Modal
        isOpen={Boolean(viewingPo)}
        onClose={() => setViewingPo(null)}
        title="Purchase Order Statement"
      >
        {viewingPo && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">{viewingPo.poNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {viewingPo.status}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{viewingPo.supplierName}</h3>
              <p className="text-slate-500">Destination: {viewingPo.warehouseName}</p>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">Qty</th>
                    <th className="py-2 px-3">Rate (₹)</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingPo.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{it.productName}</td>
                      <td className="py-2 px-3">{it.orderedQty} {it.unit}</td>
                      <td className="py-2 px-3">₹{Number(it.unitPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{(Number(it.orderedQty) * Number(it.unitPrice)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500">Total Purchase Value (with 12% GST):</span>
              <span className="font-black text-sm text-slate-900">
                ₹{Number(viewingPo.totalAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingPo(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete PO */}
      <ConfirmDialog
        isOpen={Boolean(poToDelete)}
        onClose={() => setPoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Cancel & Void Purchase Order"
        message={`Are you sure you want to void ${poToDelete?.poNumber}? This will remove the procurement record from active tracking.`}
        confirmText="Yes, Void PO"
        type="danger"
      />
    </PageContainer>
  );
};

export default WarehousePurchasesPage;
