import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../dashboard/components/modals/ConfirmDeleteModal';
import { Package, Plus, Trash2, Edit2, Eye, ShieldCheck, Search } from 'lucide-react';
import storageService from '../../services/storageService';
import formatCurrency from '../../utils/formatCurrency';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [addForm, setAddForm] = useState({
    name: '',
    type: 'PV Module',
    brand: '',
    wattage: '550 W',
    efficiency: '21.0%',
    price: 15000,
    warranty: '25 Years',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    type: 'PV Module',
    brand: '',
    wattage: '550 W',
    efficiency: '21.0%',
    price: 15000,
    warranty: '25 Years',
  });

  const debouncedSearch = useDebounce(search, 300);

  const loadProducts = () => {
    setProducts(storageService.getProducts());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setEditForm({
        name: editingProduct.name || '',
        type: editingProduct.type || 'PV Module',
        brand: editingProduct.brand || '',
        wattage: editingProduct.wattage || '',
        efficiency: editingProduct.efficiency || '',
        price: editingProduct.price || 0,
        warranty: editingProduct.warranty || '25 Years',
      });
    }
  }, [editingProduct]);

  const [addError, setAddError] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setAddError('');
    if (!addForm.name.trim() || !addForm.brand.trim()) {
      setAddError('Please fill in product name and brand.');
      return;
    }
    storageService.createProduct(addForm);
    loadProducts();
    setIsAddOpen(false);
    setAddForm({
      name: '',
      type: 'PV Module',
      brand: '',
      wattage: '550 W',
      efficiency: '21.0%',
      price: 15000,
      warranty: '25 Years',
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    storageService.updateProduct(editingProduct.id, editForm);
    loadProducts();
    setEditingProduct(null);
    if (viewProduct && viewProduct.id === editingProduct.id) {
      setViewProduct({ ...viewProduct, ...editForm });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;
    storageService.deleteProduct(deletingProduct.id);
    loadProducts();
    setDeletingProduct(null);
    if (viewProduct && viewProduct.id === deletingProduct.id) {
      setViewProduct(null);
    }
  };

  const paginated = paginateCollection(products, {
    page,
    pageSize,
    search: debouncedSearch,
    filterKey: 'type',
    filterVal: categoryFilter,
  });

  const columns = [
    {
      header: 'SKU / Model ID',
      accessor: 'id',
      cell: ({ value }) => (
        <span className="font-mono text-xs font-semibold text-[#0284C7] whitespace-nowrap">{value}</span>
      ),
    },
    {
      header: 'Product Description',
      accessor: 'name',
      cell: ({ row }) => (
        <div className="max-w-[210px] truncate" title={`${row.name} (${row.brand})`}>
          <span className="font-semibold text-slate-800 block truncate">{row.name}</span>
          <span className="text-[11px] text-slate-400 block truncate">Brand: {row.brand}</span>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: 'type',
      cell: ({ value }) => (
        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700 whitespace-nowrap">
          {value}
        </span>
      ),
    },
    {
      header: 'Rating / Capacity',
      accessor: 'wattage',
      cell: ({ value }) => <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">{value}</span>,
    },
    {
      header: 'Efficiency',
      accessor: 'efficiency',
      cell: ({ value }) => <span className="text-xs text-sky-700 font-semibold whitespace-nowrap">{value}</span>,
    },
    {
      header: 'Unit Price (₹)',
      accessor: 'price',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-bold text-slate-900 whitespace-nowrap">{formatCurrency(value)}</span>
      ),
    },
    {
      header: 'Warranty',
      accessor: 'warranty',
      cell: ({ value }) => (
        <span className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{value}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setViewProduct(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#0284C7] hover:bg-sky-50 transition"
            title="View Product Specs"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setEditingProduct(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingProduct(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Remove Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Product & Package Management"
        subtitle="Manage Tier-1 solar photovoltaic panels, hybrid inverters, battery storage and BOS components"
      >
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add New Product
        </Button>
      </PageHeader>

      <Card padding={false} className="overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product name, brand or rating..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Equipment Types</option>
              <option value="PV Module">PV Module</option>
              <option value="Inverter">Inverter</option>
              <option value="Battery">Battery Storage</option>
              <option value="BOS">Balance of System (BOS)</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={paginated.data}
          emptyTitle="No products found"
          emptyDescription="No equipment matching your selected filters."
        />

        <TablePagination
          currentPage={paginated.pagination.page}
          pageSize={paginated.pagination.pageSize}
          totalRecords={paginated.pagination.totalRecords}
          totalPages={paginated.pagination.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(ps) => {
            setPageSize(ps);
            setPage(1);
          }}
        />
      </Card>

      {/* View Product Details Modal */}
      {viewProduct && (
        <Modal
          isOpen={!!viewProduct}
          onClose={() => setViewProduct(null)}
          title={`Product Specifications: ${viewProduct.id}`}
          subtitle={viewProduct.name}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  setEditingProduct(viewProduct);
                  setViewProduct(null);
                }}
              >
                Edit Product
              </Button>
              <Button variant="primary" size="sm" onClick={() => setViewProduct(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Category / Type</span>
              <span className="font-semibold text-slate-800">{viewProduct.type}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Manufacturer / Brand</span>
              <span className="font-semibold text-slate-800">{viewProduct.brand}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Rated Output / Capacity</span>
              <span className="font-bold text-[#0284C7]">{viewProduct.wattage}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Conversion Efficiency</span>
              <span className="font-semibold text-emerald-700">{viewProduct.efficiency}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <span className="text-slate-500">Catalog Unit Price</span>
              <span className="font-bold text-slate-900">{formatCurrency(viewProduct.price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Manufacturer Warranty</span>
              <span className="flex items-center gap-1 font-semibold text-sky-700">
                <ShieldCheck className="w-4 h-4" />
                {viewProduct.warranty}
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Product Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Solar Product"
          subtitle="Add PV panel, hybrid inverter, battery or BOS component to master catalog"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddSubmit}>
                Create Product
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs sm:text-sm">
            {addError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Product Model & Description *</label>
              <input
                type="text"
                required
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="e.g. Tata Power 550W Mono PERC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Category Type *</label>
                <select
                  value={addForm.type}
                  onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="PV Module">PV Module</option>
                  <option value="Inverter">Inverter</option>
                  <option value="Battery">Battery</option>
                  <option value="BOS">BOS Component</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={addForm.brand}
                  onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                  placeholder="e.g. Tata Solar, Waaree, Growatt"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Rated Output / Capacity</label>
                <input
                  type="text"
                  value={addForm.wattage}
                  onChange={(e) => setAddForm({ ...addForm, wattage: e.target.value })}
                  placeholder="e.g. 550 W or 10 kW"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Efficiency Rating</label>
                <input
                  type="text"
                  value={addForm.efficiency}
                  onChange={(e) => setAddForm({ ...addForm, efficiency: e.target.value })}
                  placeholder="e.g. 21.4% or 98.6%"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Unit Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={addForm.price}
                  onChange={(e) => setAddForm({ ...addForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Warranty Term</label>
                <input
                  type="text"
                  value={addForm.warranty}
                  onChange={(e) => setAddForm({ ...addForm, warranty: e.target.value })}
                  placeholder="e.g. 25 Years"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Edit Product: ${editingProduct.id}`}
          subtitle={`Update specifications for ${editingProduct.name}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Product Model & Description *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Category Type *</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                >
                  <option value="PV Module">PV Module</option>
                  <option value="Inverter">Inverter</option>
                  <option value="Battery">Battery</option>
                  <option value="BOS">BOS Component</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Brand / Manufacturer *</label>
                <input
                  type="text"
                  required
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Rated Output / Capacity</label>
                <input
                  type="text"
                  value={editForm.wattage}
                  onChange={(e) => setEditForm({ ...editForm, wattage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Efficiency Rating</label>
                <input
                  type="text"
                  value={editForm.efficiency}
                  onChange={(e) => setEditForm({ ...editForm, efficiency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Unit Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Warranty Term</label>
                <input
                  type="text"
                  value={editForm.warranty}
                  onChange={(e) => setEditForm({ ...editForm, warranty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <ConfirmDeleteModal
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Catalog Product"
          message={`Are you sure you want to remove "${deletingProduct.name}" (${deletingProduct.id}) from the product catalog?`}
          itemIdentifier={`${deletingProduct.id} — ${deletingProduct.name}`}
        />
      )}
    </PageContainer>
  );
};

export default ProductsPage;
