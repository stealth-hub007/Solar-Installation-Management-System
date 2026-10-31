import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Table, { TablePagination } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../dashboard/components/modals/ConfirmDeleteModal';
import { Boxes, Plus, Edit2, Trash2, Search, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import storageService from '../../services/storageService';
import { paginateCollection } from '../../services/mockData';
import useDebounce from '../../hooks/useDebounce';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // Direct stock value input state
  const [newStockValue, setNewStockValue] = useState(0);
  const [addError, setAddError] = useState('');

  const [newItem, setNewItem] = useState({
    category: '',
    available: 100,
    lowStock: 20,
    reserved: 10,
    outOfStock: 0,
  });

  const debouncedSearch = useDebounce(search, 300);

  const loadData = () => {
    setInventory(storageService.getInventory());
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setNewStockValue(item.available);
    setIsAdjustOpen(true);
  };

  const handleAdjustSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedItem) return;
    const stock = Math.max(0, Number(newStockValue));
    storageService.setInventoryStock(selectedItem.category, stock);
    loadData();
    setIsAdjustOpen(false);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    setAddError('');
    if (!newItem.category.trim()) {
      setAddError('Please enter category name');
      return;
    }
    const current = storageService.getInventory();
    const updated = [
      ...current,
      {
        ...newItem,
        available: Number(newItem.available) || 0,
        lowStock: Number(newItem.lowStock) || 10,
        reserved: Number(newItem.reserved) || 0,
        outOfStock: Number(newItem.available) <= 0 ? 1 : 0,
      },
    ];
    localStorage.setItem('sims_inventory_data', JSON.stringify(updated));
    storageService.logActivity(`Added inventory equipment category "${newItem.category}"`, 'Inventory', 'Created');
    loadData();
    setIsAddOpen(false);
    setNewItem({ category: '', available: 100, lowStock: 20, reserved: 10, outOfStock: 0 });
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    storageService.deleteInventory(deletingItem.category);
    loadData();
    setDeletingItem(null);
  };

  const filteredInventory = inventory.filter((item) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'out') return item.available === 0 || item.outOfStock > 0;
    if (statusFilter === 'low') return item.available > 0 && item.available <= item.lowStock;
    if (statusFilter === 'sufficient') return item.available > item.lowStock;
    return true;
  });

  const paginated = paginateCollection(filteredInventory, {
    page,
    pageSize,
    search: debouncedSearch,
  });

  const columns = [
    {
      header: 'Equipment Category',
      accessor: 'category',
      cell: ({ value }) => (
        <span className="font-semibold text-xs text-slate-800 max-w-[240px] truncate block" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Available Stock',
      accessor: 'available',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-bold text-slate-900 whitespace-nowrap">{value.toLocaleString()} units</span>
      ),
    },
    {
      header: 'Reserved for Projects',
      accessor: 'reserved',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded whitespace-nowrap">
          {value} units
        </span>
      ),
    },
    {
      header: 'Safety Buffer',
      accessor: 'lowStock',
      align: 'right',
      cell: ({ value }) => <span className="text-slate-500 whitespace-nowrap">{value} threshold</span>,
    },
    {
      header: 'Stock Status',
      cell: ({ row }) => {
        if (row.outOfStock > 0 || row.available === 0) {
          return <Badge variant="danger" dot>Out of Stock</Badge>;
        }
        if (row.available <= row.lowStock) {
          return <Badge variant="warning" dot>Low Stock</Badge>;
        }
        return <Badge variant="success" dot>Sufficient</Badge>;
      },
    },
    {
      header: 'Actions',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            icon={Edit2}
            onClick={() => openAdjustModal(row)}
            className="whitespace-nowrap"
          >
            Adjust Stock
          </Button>
          <button
            onClick={() => setDeletingItem(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Delete Category"
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
        title="Inventory & Warehouse Management"
        subtitle="Track solar PV modules, string inverters, lithium batteries, and balance-of-system (BOS) stock"
      >
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add Stock Category
        </Button>
      </PageHeader>

      <Card padding={false} className="overflow-hidden">
        {/* Search & Filters */}
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
              placeholder="Search category or item description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            >
              <option value="all">All Stock Statuses</option>
              <option value="sufficient">Sufficient</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <span className="text-xs text-slate-500 font-medium pl-2">
              Total Items: <span className="font-bold text-slate-800">{inventory.length} Categories</span>
            </span>
          </div>
        </div>

        <Table
          columns={columns}
          data={paginated.data}
          emptyTitle="No inventory items found"
          emptyDescription="No equipment categories match your search."
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

      {/* Adjust Stock Modal - Single Submit Button & Direct Stock Value Input */}
      {isAdjustOpen && selectedItem && (
        <Modal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          title={`Adjust Inventory: ${selectedItem.category}`}
          subtitle={`Current stock in warehouse: ${selectedItem.available} units`}
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setIsAdjustOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAdjustSubmit}>
                Submit
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4 py-2 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Enter Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={newStockValue}
                onChange={(e) => setNewStockValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="Enter stock units (e.g. 150)"
                className="w-full px-3 py-2 text-base font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            {/* Live Status Reflection Preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <span className="text-xs text-slate-500 font-medium block">Resulting Stock Status:</span>
              <div>
                {newStockValue === 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> Out of Stock (0 units)
                  </span>
                ) : newStockValue <= selectedItem.lowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({newStockValue} units &le; buffer {selectedItem.lowStock})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sufficient ({newStockValue} units)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Submitting updates the available units and immediately synchronizes stock health.
              </p>
            </div>
          </form>
        </Modal>
      )}

      {/* Add New Category Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Equipment Category"
          subtitle="Register a new item classification into warehouse inventory"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddItem}>
                Create Category
              </Button>
            </>
          }
        >
          <form onSubmit={handleAddItem} className="space-y-3 text-xs sm:text-sm">
            {addError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Equipment / Category Name *</label>
              <input
                type="text"
                required
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="e.g. 540W Bi-facial PV Modules"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Initial Available Units *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newItem.available}
                  onChange={(e) => setNewItem({ ...newItem, available: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Safety Buffer Alert *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newItem.lowStock}
                  onChange={(e) => setNewItem({ ...newItem, lowStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <ConfirmDeleteModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDeleteConfirm}
          title="Remove Inventory Equipment"
          message={`Are you sure you want to delete inventory category "${deletingItem.category}"? This will remove all tracked stock units.`}
          itemIdentifier={deletingItem.category}
        />
      )}
    </PageContainer>
  );
};

export default InventoryPage;
