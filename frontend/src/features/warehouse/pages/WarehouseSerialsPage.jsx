import React, { useState, useMemo } from 'react';
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
  QrCode,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Scan,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';

import { registerSerials, lookupSerial } from '../slices/warehouseDispatchSlice';
import { SERIAL_STATUSES } from '../utils/warehouseConstants';

export const WarehouseSerialsPage = () => {
  const dispatch = useDispatch();
  const { items: inventoryItems } = useSelector((state) => state.warehouseInventory);

  const [serialRecords, setSerialRecords] = useState([
    {
      id: 'sn-1',
      serialNumber: 'GW-10K-2026-0091',
      productName: 'Solis 10kW 3-Phase Commercial Inverter',
      sku: 'INV-SOL-10KW',
      status: 'DELIVERED',
      warehouse: 'Jaipur Central Solar Logistics Hub',
      orderRef: 'ORD-1082',
      customerName: 'Rajesh Sharma',
      dispatchRef: 'DSP-701',
      registeredDate: '2026-10-18',
      deliveryDate: '2026-10-31',
    },
    {
      id: 'sn-2',
      serialNumber: 'EXD-BAT-2026-8812',
      productName: 'Exide 48V 100Ah Lithium LFP Battery Bank',
      sku: 'BAT-EXD-48V100',
      status: 'DISPATCHED',
      warehouse: 'Jaipur Central Solar Logistics Hub',
      orderRef: 'ORD-1079',
      customerName: 'Golden Hospitality Resort',
      dispatchRef: 'DSP-705',
      registeredDate: '2026-10-22',
      deliveryDate: null,
    },
    {
      id: 'sn-3',
      serialNumber: 'GRW-5K-2026-0114',
      productName: 'Growatt 5kW Dual MPPT On-Grid Inverter',
      sku: 'INV-GRW-5KW',
      status: 'RESERVED',
      warehouse: 'Jaipur Central Solar Logistics Hub',
      orderRef: 'ORD-1085',
      customerName: 'Kailash Yadav',
      dispatchRef: null,
      registeredDate: '2026-10-26',
      deliveryDate: null,
    },
    {
      id: 'sn-4',
      serialNumber: 'TAT-540-2026-4401',
      productName: 'Tata Power 540W Mono PERC Solar Panel',
      sku: 'SP-TAT-540M',
      status: 'IN_STOCK',
      warehouse: 'Jaipur Central Solar Logistics Hub',
      orderRef: null,
      customerName: null,
      dispatchRef: null,
      registeredDate: '2026-10-28',
      deliveryDate: null,
    },
    {
      id: 'sn-5',
      serialNumber: 'WAR-550-2026-7731',
      productName: 'Waaree 550W Bifacial Dual Glass Module',
      sku: 'SP-WAR-550B',
      status: 'IN_STOCK',
      warehouse: 'Jaipur Central Solar Logistics Hub',
      orderRef: null,
      customerName: null,
      dispatchRef: null,
      registeredDate: '2026-10-29',
      deliveryDate: null,
    },
  ]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingSerial, setEditingSerial] = useState(null);
  const [serialToDelete, setSerialToDelete] = useState(null);
  const [viewingSerial, setViewingSerial] = useState(null);

  // Form State
  const initialForm = {
    serialNumber: '',
    productName: 'Growatt 5kW Dual MPPT On-Grid Inverter',
    sku: 'INV-GRW-5KW',
    warehouse: 'Jaipur Central Solar Logistics Hub',
    status: 'IN_STOCK',
  };
  const [formData, setFormData] = useState(initialForm);

  // Submit Add or Edit
  const handleSubmitSerial = (e) => {
    e.preventDefault();
    if (!formData.serialNumber) return;

    if (editingSerial) {
      setSerialRecords((prev) =>
        prev.map((s) => (s.id === editingSerial.id ? { ...s, ...formData } : s))
      );
      setEditingSerial(null);
    } else {
      const newRec = {
        id: `sn-${Date.now()}`,
        ...formData,
        registeredDate: new Date().toISOString().split('T')[0],
      };
      setSerialRecords([newRec, ...serialRecords]);
      setIsRegisterOpen(false);
    }
    setFormData(initialForm);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!serialToDelete) return;
    setSerialRecords((prev) => prev.filter((s) => s.id !== serialToDelete.id));
    setSerialToDelete(null);
  };

  // Filtering & Pagination
  const filteredSerials = useMemo(() => {
    let result = [...serialRecords];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.serialNumber.toLowerCase().includes(q) ||
          s.productName.toLowerCase().includes(q) ||
          s.sku.toLowerCase().includes(q) ||
          (s.customerName && s.customerName.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [serialRecords, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredSerials.length / pageSize) || 1;
  const paginatedSerials = filteredSerials.slice(
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
              Serial Number & Barcode Traceability
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {serialRecords.length} Serialized Units
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end device tracking for high-value solar modules, inverters, and battery banks across warehouse storage and dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData(initialForm);
              setEditingSerial(null);
              setIsRegisterOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Register New Serial</span>
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
              placeholder="Search by serial number barcode, SKU, or customer name..."
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
              <option value="ALL">All Serial Statuses</option>
              {Object.keys(SERIAL_STATUSES).map((k) => (
                <option key={k} value={k}>
                  {SERIAL_STATUSES[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Serial / Barcode</th>
                <th className="py-3 px-4">Solar Hardware</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Location / Depot</th>
                <th className="py-3 px-4">Allocated Project</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSerials.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#0284C7]" />
                      <span className="font-mono font-bold text-slate-900">{s.serialNumber}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {s.productName}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {s.sku}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {s.warehouse}
                  </td>

                  <td className="py-3 px-4">
                    {s.customerName ? (
                      <div>
                        <span className="font-semibold text-slate-800">{s.customerName}</span>
                        <div className="text-[10px] text-slate-400">Order: {s.orderRef}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unallocated</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : s.status === 'DISPATCHED'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : s.status === 'RESERVED'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingSerial(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                        title="View Serial History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSerial(s);
                          setFormData({
                            serialNumber: s.serialNumber,
                            productName: s.productName,
                            sku: s.sku,
                            warehouse: s.warehouse,
                            status: s.status,
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        title="Edit Serial"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSerialToDelete(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Serial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedSerials.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No serialized equipment matches your search.
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
          totalRecords={filteredSerials.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Register / Edit Serial */}
      <Modal
        isOpen={isRegisterOpen || Boolean(editingSerial)}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditingSerial(null);
        }}
        title={editingSerial ? `Edit Serial: ${editingSerial.serialNumber}` : 'Register Serialized Solar Hardware'}
      >
        <form onSubmit={handleSubmitSerial} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scan or Enter Serial Number / Barcode *
            </label>
            <Input
              required
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="e.g. SN-TAT-2026-9021"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <Input
                required
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU Code *
              </label>
              <Input
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warehouse Location
              </label>
              <Input
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="IN_STOCK">In Stock (Available)</option>
                <option value="RESERVED">Reserved for Order</option>
                <option value="DISPATCHED">Dispatched with Carrier</option>
                <option value="DELIVERED">Delivered to Site</option>
                <option value="DEFECTIVE">Defective / Quarantined</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsRegisterOpen(false);
                setEditingSerial(null);
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
              {editingSerial ? 'Update Serial' : 'Register Serial'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Serial */}
      <Modal
        isOpen={Boolean(viewingSerial)}
        onClose={() => setViewingSerial(null)}
        title="Hardware Lifecycle Dossier"
      >
        {viewingSerial && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">{viewingSerial.serialNumber}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {viewingSerial.status}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{viewingSerial.productName}</h3>
              <p className="text-slate-500 font-mono">SKU: {viewingSerial.sku}</p>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
              <div>Warehouse: <span className="font-semibold text-slate-800">{viewingSerial.warehouse}</span></div>
              {viewingSerial.orderRef && (
                <div>Allocated Order: <span className="font-semibold text-slate-800">{viewingSerial.orderRef}</span></div>
              )}
              {viewingSerial.customerName && (
                <div>Customer Name: <span className="font-semibold text-slate-800">{viewingSerial.customerName}</span></div>
              )}
              {viewingSerial.dispatchRef && (
                <div>Dispatch Consignment: <span className="font-semibold text-slate-800">{viewingSerial.dispatchRef}</span></div>
              )}
              <div>Registered Date: <span className="text-slate-500">{viewingSerial.registeredDate}</span></div>
              {viewingSerial.deliveryDate && (
                <div>Site Delivery Date: <span className="text-emerald-600 font-semibold">{viewingSerial.deliveryDate}</span></div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingSerial(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete Serial */}
      <ConfirmDialog
        isOpen={Boolean(serialToDelete)}
        onClose={() => setSerialToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Serial Record"
        message={`Are you sure you want to remove serial ${serialToDelete?.serialNumber}?`}
        confirmText="Yes, Delete Serial"
        type="danger"
      />
    </PageContainer>
  );
};

export default WarehouseSerialsPage;
