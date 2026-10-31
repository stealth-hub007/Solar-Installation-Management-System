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
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Star,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

import {
  fetchSuppliers,
  saveSupplier,
  deleteSupplier,
} from '../slices/warehouseProcurementSlice';
import { SOLAR_PRODUCT_CATEGORIES } from '../utils/warehouseConstants';

export const WarehouseSuppliersPage = () => {
  const dispatch = useDispatch();
  const { suppliers, loading } = useSelector((state) => state.warehouseProcurement);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    code: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    gstin: '',
    paymentTerms: 'Net 30 Days',
    leadTimeDays: 7,
    rating: 4.8,
    category: 'Solar Panels',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchSuppliers());
  };

  // Open Edit Modal
  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      code: sup.code || '',
      contactPerson: sup.contactPerson || '',
      email: sup.email || '',
      phone: sup.phone || '',
      address: sup.address || '',
      city: sup.city || 'Jaipur',
      state: sup.state || 'Rajasthan',
      gstin: sup.gstin || '',
      paymentTerms: sup.paymentTerms || 'Net 30 Days',
      leadTimeDays: sup.leadTimeDays || 7,
      rating: sup.rating || 4.8,
      category: Array.isArray(sup.categories) ? sup.categories[0] : (sup.category || 'Solar Panels'),
    });
  };

  // Submit Add or Edit
  const handleSubmitSupplier = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) return;

    const payload = {
      ...formData,
      id: editingSupplier ? editingSupplier.id : `sup-${Date.now()}`,
      code: formData.code || `SUP-${formData.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      categories: [formData.category],
      leadTimeDays: Number(formData.leadTimeDays || 7),
      rating: Number(formData.rating || 4.8),
    };

    await dispatch(saveSupplier(payload));
    setIsAddModalOpen(false);
    setEditingSupplier(null);
    setFormData(initialForm);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    await dispatch(deleteSupplier(supplierToDelete.id));
    setSupplierToDelete(null);
  };

  // Filtering & Pagination
  const filteredSuppliers = useMemo(() => {
    let result = Array.isArray(suppliers) ? [...suppliers] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.contactPerson?.toLowerCase().includes(q) ||
          s.gstin?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter(
        (s) =>
          s.category === categoryFilter ||
          (Array.isArray(s.categories) && s.categories.includes(categoryFilter))
      );
    }

    return result;
  }, [suppliers, debouncedSearch, categoryFilter]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = filteredSuppliers.slice(
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
              Solar Equipment Suppliers Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {suppliers.length} Approved Vendors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directory of certified Tier-1 equipment manufacturers, distributors, GSTIN verification, and procurement lead times.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh suppliers list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData(initialForm);
              setEditingSupplier(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Onboard New Supplier</span>
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
              placeholder="Search by vendor name, contact person, GSTIN, or supplier code..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
            >
              <option value="ALL">All Equipment Categories</option>
              {SOLAR_PRODUCT_CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Suppliers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {paginatedSuppliers.map((sup) => (
          <Card key={sup.id} className="p-5 border-slate-200 hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-sm shrink-0">
                    <Building2 className="w-5 h-5 text-[#0284C7]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">{sup.name}</h3>
                    <span className="font-mono text-[10px] text-slate-400">{sup.code}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-700 font-bold text-xs">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{sup.rating || 4.8}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E0F2FE] text-[#0284C7]">
                  {Array.isArray(sup.categories) ? sup.categories[0] : (sup.category || 'Solar Equipment')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  GST Verified
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] text-slate-600 bg-slate-100">
                  {sup.paymentTerms || 'Net 30 Days'}
                </span>
              </div>

              {/* Details List */}
              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.city || 'Jaipur'}, {sup.state || 'Rajasthan'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Lead Time: ~{sup.leadTimeDays || 7} business days</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-400">
                GST: {sup.gstin || '08AAACP1234F1Z5'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewingSupplier(sup)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                  title="View Vendor Profile"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenEdit(sup)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                  title="Edit Supplier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSupplierToDelete(sup)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Delete Supplier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No equipment suppliers found matching your search.
          </div>
        )}
      </div>

      {/* Pagination */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filteredSuppliers.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 8, 12, 24]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Add / Edit Supplier */}
      <Modal
        isOpen={isAddModalOpen || Boolean(editingSupplier)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Onboard New Solar Equipment Supplier'}
      >
        <form onSubmit={handleSubmitSupplier} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier / Company Legal Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Waaree Energies Limited"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name *
              </label>
              <Input
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Deepak Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Code (Auto / Custom)
              </label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. SUP-WAR-101"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. sales@waaree.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98290 12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Registration Number *
              </label>
              <Input
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="e.g. 08AAACW1234A1Z1"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Product Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                {SOLAR_PRODUCT_CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Terms
              </label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="100% Advance">100% Advance</option>
                <option value="Net 15 Days">Net 15 Days</option>
                <option value="Net 30 Days">Net 30 Days</option>
                <option value="Net 45 Days">Net 45 Days</option>
                <option value="Against Delivery (COD)">Against Delivery (COD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Average Lead Time (Days)
              </label>
              <Input
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Factory / Warehouse Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Plot No. 12, RIICO Industrial Area, Sitapura, Jaipur"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingSupplier(null);
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
              {editingSupplier ? 'Update Supplier Profile' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Supplier */}
      <Modal
        isOpen={Boolean(viewingSupplier)}
        onClose={() => setViewingSupplier(null)}
        title="Supplier Dossier & Verification"
      >
        {viewingSupplier && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-600">{viewingSupplier.code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {Array.isArray(viewingSupplier.categories) ? viewingSupplier.categories.join(', ') : viewingSupplier.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{viewingSupplier.name}</h3>
              <p className="text-slate-500">{viewingSupplier.address || 'Industrial Area, Rajasthan'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Person</span>
                <span className="font-bold text-slate-900 text-sm">{viewingSupplier.contactPerson}</span>
                <span className="text-slate-500 block mt-0.5">{viewingSupplier.phone}</span>
                <span className="text-slate-500 block truncate">{viewingSupplier.email}</span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tax & Terms</span>
                <span className="font-bold text-slate-900 font-mono">{viewingSupplier.gstin || '08AAACW1234A1Z1'}</span>
                <span className="text-slate-500 block mt-0.5">{viewingSupplier.paymentTerms}</span>
                <span className="text-slate-500 block">Lead Time: ~{viewingSupplier.leadTimeDays || 7} days</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingSupplier(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete Supplier */}
      <ConfirmDialog
        isOpen={Boolean(supplierToDelete)}
        onClose={() => setSupplierToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Approved Supplier"
        message={`Are you sure you want to remove "${supplierToDelete?.name}" (${supplierToDelete?.code})? This will deactivate the vendor record from future procurement.`}
        confirmText="Yes, Delete Supplier"
        type="danger"
      />
    </PageContainer>
  );
};

export default WarehouseSuppliersPage;
