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
  Boxes,
  Plus,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  ArrowDownToLine,
  RefreshCw,
  TrendingUp,
  History,
} from 'lucide-react';

import {
  fetchInventory,
  addStock,
  adjustStock,
  clearInventoryStatus,
} from '../slices/warehouseInventorySlice';

export const WarehouseInventoryPage = () => {
  const dispatch = useDispatch();
  const { items, loading, mutating, error, successMessage } = useSelector(
    (state) => state.warehouseInventory
  );

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  // Form states
  const [newCount, setNewCount] = useState('');
  const [adjustRemarks, setAdjustRemarks] = useState('');
  const [adjustError, setAdjustError] = useState('');

  const [addQty, setAddQty] = useState('');
  const [addCost, setAddCost] = useState('');
  const [addRemarks, setAddRemarks] = useState('');

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  const loadData = () => {
    dispatch(fetchInventory());
  };

  const openAdjust = (item) => {
    setSelectedItem(item);
    setNewCount(item.total_quantity);
    setAdjustRemarks('Warehouse physical cycle count audit reconciliation');
    setAdjustError('');
    setIsAdjustModalOpen(true);
  };

  const openAdd = (item) => {
    setSelectedItem(item);
    setAddQty('');
    setAddCost('');
    setAddRemarks('Consignment stock inward replenishment');
    setIsAddStockModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || newCount === '') return;
    const countNum = Number(newCount);
    if (countNum < Number(selectedItem.reserved_quantity)) {
      setAdjustError(
        `Physical count cannot be less than currently reserved quantity (${selectedItem.reserved_quantity} units).`
      );
      return;
    }

    try {
      await dispatch(
        adjustStock({
          product_id: selectedItem.product_id || selectedItem.id,
          physical_count: countNum,
          remarks: adjustRemarks || 'Physical audit reconciliation',
        })
      ).unwrap();
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err) {
      setAdjustError(err || 'Failed to adjust stock');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !addQty) return;

    try {
      await dispatch(
        addStock({
          product_id: selectedItem.product_id || selectedItem.id,
          quantity: parseFloat(addQty),
          purchase_cost: addCost ? parseFloat(addCost) : undefined,
          remarks: addRemarks || 'Consignment replenishment',
        })
      ).unwrap();
      setIsAddStockModalOpen(false);
      loadData();
    } catch (err) {
      alert(err || 'Failed to inward stock');
    }
  };

  // Filtered & Paginated items
  const filteredItems = useMemo(() => {
    let result = Array.isArray(items) ? [...items] : [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (i) =>
          (i.product?.name || i.name || '').toLowerCase().includes(q) ||
          (i.product?.sku || i.sku || '').toLowerCase().includes(q)
      );
    }

    if (filterType === 'low') {
      result = result.filter(
        (i) => Number(i.available_quantity ?? i.total_quantity) <= Number(i.minimum_stock_level || 5)
      );
    } else if (filterType === 'out') {
      result = result.filter((i) => Number(i.total_quantity || 0) === 0);
    } else if (filterType === 'reserved') {
      result = result.filter((i) => Number(i.reserved_quantity || 0) > 0);
    }

    return result;
  }, [items, debouncedSearch, filterType]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary Metrics
  const totalPhysicalStock = items.reduce((acc, i) => acc + Number(i.total_quantity || 0), 0);
  const totalReservedStock = items.reduce((acc, i) => acc + Number(i.reserved_quantity || 0), 0);
  const totalAvailableStock = Math.max(0, totalPhysicalStock - totalReservedStock);
  const lowCount = items.filter(
    (i) => Number(i.available_quantity ?? i.total_quantity) <= Number(i.minimum_stock_level || 5)
  ).length;

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Warehouse Inventory & Stock Control
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              PostgreSQL Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time physical stock counts, active project reservations, safety reorder thresholds, and physical audit adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="flex items-center gap-1.5"
            title="Refresh stock levels from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Total Physical Units</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalPhysicalStock}</div>
          <span className="text-[10px] text-slate-400">On-hand across all depots</span>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Available Stock</span>
          <div className="text-2xl font-black text-[#0284C7] mt-1">{totalAvailableStock}</div>
          <span className="text-[10px] text-slate-400">Unreserved & ready for dispatch</span>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Reserved for Orders</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{totalReservedStock}</div>
          <span className="text-[10px] text-slate-400">Committed to active installations</span>
        </Card>
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Low Stock SKUs</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{lowCount}</div>
          <span className="text-[10px] text-rose-500 font-semibold">Below minimum threshold</span>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <Card className="p-4 border-slate-200 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search inventory by product name or SKU..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'all'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => {
                setFilterType('low');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'low'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              Low Stock ({lowCount})
            </button>
            <button
              onClick={() => {
                setFilterType('reserved');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'reserved'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Reserved Items
            </button>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Solar Product</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4 text-center">Physical Total</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Available</th>
                <th className="py-3 px-4 text-center">Min Safety Point</th>
                <th className="py-3 px-4">Stock Health</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.map((item) => {
                const totalQ = Number(item.total_quantity || 0);
                const reservedQ = Number(item.reserved_quantity || 0);
                const availableQ = Number(item.available_quantity ?? (totalQ - reservedQ));
                const minLevel = Number(item.minimum_stock_level || 5);
                const isLow = availableQ <= minLevel;
                const isOut = totalQ === 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        {item.product?.name || item.name || 'Solar Equipment'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Category: {item.product?.category?.name || item.category || 'Solar PV'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {item.product?.sku || item.sku || 'SKU-N/A'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {totalQ}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {reservedQ}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        availableQ > minLevel
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {availableQ}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-slate-500 font-medium">
                      {minLevel}
                    </td>

                    <td className="py-3 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Healthy
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdd(item)}
                          className="text-xs px-2 py-1 text-[#0284C7] hover:bg-[#E0F2FE] border-[#BAE6FD]"
                          title="Inward new stock"
                        >
                          <Plus className="w-3.5 h-3.5 mr-0.5" />
                          <span>Inward</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdjust(item)}
                          className="text-xs px-2 py-1 text-slate-700 hover:bg-slate-100"
                          title="Audit physical count"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 mr-0.5 text-slate-500" />
                          <span>Reconcile</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No inventory records match the selected filter.
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
          totalRecords={filteredItems.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>

      {/* Modal: Physical Audit Adjustment */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Physical Audit Count Reconciliation"
      >
        {selectedItem && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">
                {selectedItem.product?.name || selectedItem.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                SKU: <span className="font-mono font-semibold">{selectedItem.product?.sku || selectedItem.sku}</span> • System Total: <span className="font-bold text-slate-800">{selectedItem.total_quantity}</span> • Reserved: <span className="font-bold text-amber-600">{selectedItem.reserved_quantity}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Actual Counted Physical Units *
              </label>
              <Input
                type="number"
                min="0"
                step="any"
                required
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                placeholder="Enter physical audit count"
                autoFocus
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must be at least {selectedItem.reserved_quantity} to respect locked customer reservations.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Audit Justification *
              </label>
              <textarea
                rows="2"
                required
                value={adjustRemarks}
                onChange={(e) => setAdjustRemarks(e.target.value)}
                className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border"
                placeholder="e.g. Broken during rack transport, cycle count discrepancy..."
              />
            </div>

            {adjustError && (
              <p className="text-xs text-rose-500 font-semibold">{adjustError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
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
                {mutating ? 'Saving...' : 'Apply Physical Adjustment'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Inward Stock */}
      <Modal
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
        title="Inward Solar Consignment"
      >
        {selectedItem && (
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">
                {selectedItem.product?.name || selectedItem.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Current Stock: {selectedItem.total_quantity} • Available: {selectedItem.available_quantity ?? selectedItem.total_quantity}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inward Quantity *
                </label>
                <Input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  placeholder="e.g. 50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Cost (₹/unit)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={addCost}
                  onChange={(e) => setAddCost(e.target.value)}
                  placeholder="e.g. 14200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consignment Reference / Supplier Note
              </label>
              <Input
                value={addRemarks}
                onChange={(e) => setAddRemarks(e.target.value)}
                placeholder="e.g. Tata Power GRN #9021"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsAddStockModalOpen(false)}
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
                {mutating ? 'Processing...' : 'Confirm Inward Stock'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </PageContainer>
  );
};

export default WarehouseInventoryPage;
