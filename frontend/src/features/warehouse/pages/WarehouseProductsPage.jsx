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
import { Badge } from '../../../components/ui/Badge';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  QrCode,
  Tag,
  Shield,
  Layers,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';

import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../slices/warehouseProductSlice';

export const WarehouseProductsPage = () => {
  const dispatch = useDispatch();
  const { items, categories, total, loading, mutating, error } = useSelector((state) => state.warehouseProducts);

  // Search, filter, pagination states
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [serialFilter, setSerialFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Form state
  const initialForm = {
    name: '',
    category_id: '',
    sku: '',
    description: '',
    unit: 'Piece',
    selling_price: '',
    purchase_cost: '',
    minimum_stock_level: 10,
    is_serial_tracked: false,
    warranty_duration: 1,
    warranty_unit: 'YEARS',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = () => {
    dispatch(
      fetchProducts({
        search: debouncedSearch || undefined,
        category_id: selectedCategory || undefined,
        is_serial_tracked: serialFilter === 'all' ? undefined : serialFilter === 'true',
        page: currentPage,
        size: pageSize,
      })
    );
    dispatch(fetchCategories());
  };

  useEffect(() => {
    loadData();
  }, [dispatch, debouncedSearch, selectedCategory, serialFilter, currentPage, pageSize]);

  // Client-side filtering fallback
  const filteredProducts = useMemo(() => {
    let result = Array.isArray(items) ? [...items] : [];
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter((p) => p.category_id === selectedCategory || p.category?.id === selectedCategory || p.category === selectedCategory);
    }
    if (serialFilter !== 'all') {
      const isTracked = serialFilter === 'true';
      result = result.filter((p) => Boolean(p.is_serial_tracked) === isTracked);
    }
    return result;
  }, [items, debouncedSearch, selectedCategory, serialFilter]);

  const totalPages = Math.ceil((total || filteredProducts.length) / pageSize) || 1;
  const paginatedItems = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Open Edit Modal
  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      category_id: prod.category_id || prod.category?.id || '',
      sku: prod.sku || '',
      description: prod.description || '',
      unit: prod.unit || 'Piece',
      selling_price: prod.selling_price || '',
      purchase_cost: prod.purchase_cost || '',
      minimum_stock_level: prod.minimum_stock_level || 5,
      is_serial_tracked: Boolean(prod.is_serial_tracked),
      warranty_duration: prod.warranty_duration || 1,
      warranty_unit: prod.warranty_unit || 'YEARS',
    });
  };

  // Submit Add or Edit Product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const payload = {
      ...formData,
      category_id: formData.category_id || (categories[0]?.id || 'cat-1'),
      selling_price: Number(formData.selling_price || 0),
      purchase_cost: Number(formData.purchase_cost || 0),
      minimum_stock_level: Number(formData.minimum_stock_level || 5),
      warranty_duration: Number(formData.warranty_duration || 1),
    };

    if (editingProduct) {
      await dispatch(updateProduct({ id: editingProduct.id, payload }));
      setEditingProduct(null);
    } else {
      await dispatch(createProduct(payload));
      setIsAddProductOpen(false);
    }
    setFormData(initialForm);
    loadData();
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    await dispatch(deleteProduct(productToDelete.id));
    setProductToDelete(null);
    loadData();
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Solar Equipment & Product Catalog
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {total || filteredProducts.length} Products
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master repository of certified solar photovoltaic panels, string inverters, battery storage, and BOS electrical components.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh catalog"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormData(initialForm);
              setEditingProduct(null);
              setIsAddProductOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Add Solar Product</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Debounced Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, product name, or specification..."
              className="pl-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
            >
              <option value="">All Solar Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Serial Tracking Filter */}
          <div className="sm:col-span-3">
            <select
              value={serialFilter}
              onChange={(e) => {
                setSerialFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
            >
              <option value="all">All Tracking Types</option>
              <option value="true">Serialized (High Value)</option>
              <option value="false">Non-Serialized (Bulk BOS)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Pricing (₹)</th>
                <th className="py-3 px-4">Safety Stock</th>
                <th className="py-3 px-4">Serial Tracked</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition group">
                  {/* Product Info */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-[#0284C7] transition">
                      {prod.name}
                    </div>
                    {prod.description && (
                      <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                        {prod.description}
                      </div>
                    )}
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {prod.sku}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E0F2FE] text-[#0284C7]">
                      {prod.category?.name || prod.category_name || prod.category || 'Solar PV'}
                    </span>
                  </td>

                  {/* Pricing */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">
                      ₹{Number(prod.selling_price || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Cost: ₹{Number(prod.purchase_cost || 0).toLocaleString('en-IN')}
                    </div>
                  </td>

                  {/* Min Stock */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-700">
                      {prod.minimum_stock_level} {prod.unit || 'units'}
                    </div>
                  </td>

                  {/* Serial Tracking */}
                  <td className="py-3 px-4">
                    {prod.is_serial_tracked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0284C7]">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Serialized</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Bulk Item</span>
                      </span>
                    )}
                  </td>

                  {/* Warranty */}
                  <td className="py-3 px-4 text-slate-600">
                    {prod.warranty_duration} {prod.warranty_unit?.toLowerCase() || 'years'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingProduct(prod)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#0284C7] hover:bg-[#E0F2FE] transition"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No solar equipment found matching your criteria.
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
          totalRecords={filteredProducts.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Add / Edit Product */}
      <Modal
        isOpen={isAddProductOpen || Boolean(editingProduct)}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `Edit Product: ${editingProduct.sku}` : 'Register New Solar Product'}
      >
        <form onSubmit={handleSubmitProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Commercial Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Waaree 540W Mono PERC Half-Cut Module"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unique SKU Code *
              </label>
              <Input
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g. SP-WAR-540M"
                disabled={Boolean(editingProduct)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Equipment Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="e.g. 18500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Cost (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                required
                value={formData.purchase_cost}
                onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                placeholder="e.g. 14200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Safety Stock Level
              </label>
              <Input
                type="number"
                min="1"
                value={formData.minimum_stock_level}
                onChange={(e) => setFormData({ ...formData, minimum_stock_level: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
              >
                <option value="Piece">Piece / Unit</option>
                <option value="Pack">Pack / Set</option>
                <option value="Drum">Drum / Roll</option>
                <option value="Meter">Meter (m)</option>
                <option value="Kg">Kilogram (kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warranty (Years)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.warranty_duration}
                onChange={(e) => setFormData({ ...formData, warranty_duration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Description & Notes
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 144 half-cut cells, IP68 rated junction box, MC4 compatible..."
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="serial_tracked_chk"
              checked={formData.is_serial_tracked}
              onChange={(e) => setFormData({ ...formData, is_serial_tracked: e.target.checked })}
              className="rounded text-[#0284C7] focus:ring-[#0284C7] w-4 h-4"
            />
            <label htmlFor="serial_tracked_chk" className="text-xs font-semibold text-slate-800">
              Mandatory Serial Number & Barcode Tracking (High-Value Item)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsAddProductOpen(false);
                setEditingProduct(null);
              }}
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
              {mutating ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Product Details */}
      <Modal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        title="Product Specifications"
      >
        {viewingProduct && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-[#0284C7]">{viewingProduct.sku}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {viewingProduct.category?.name || viewingProduct.category || 'Solar'}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 mt-1">{viewingProduct.name}</h3>
              <p className="text-slate-600 mt-1">{viewingProduct.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Selling Price</span>
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{Number(viewingProduct.selling_price || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchase Cost</span>
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{Number(viewingProduct.purchase_cost || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Min Safety Stock</span>
                <span className="font-bold text-slate-800">{viewingProduct.minimum_stock_level} {viewingProduct.unit}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Serial Tracked</span>
                <span className="font-bold text-slate-800">{viewingProduct.is_serial_tracked ? 'Yes' : 'No'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Warranty</span>
                <span className="font-bold text-slate-800">{viewingProduct.warranty_duration} Years</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setViewingProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog: Delete Product */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Solar Product"
        message={`Are you sure you want to delete ${productToDelete?.name} (${productToDelete?.sku})? This will also remove associated inventory records.`}
        confirmText="Yes, Delete Product"
        type="danger"
      />
    </PageContainer>
  );
};

export default WarehouseProductsPage;
