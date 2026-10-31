import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  Filter,
  Search,
  CheckCircle2,
  PackageX,
  Warehouse,
  Boxes,
  Plus,
  RefreshCw,
  TrendingDown,
} from 'lucide-react';

import { fetchInventory } from '../slices/warehouseInventorySlice';

export const WarehouseAlertsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: inventory, loading } = useSelector((state) => state.warehouseInventory);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [acknowledgedIds, setAcknowledgedIds] = useState([]);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  // Derive active alerts directly from live inventory items
  const generatedAlerts = useMemo(() => {
    if (!Array.isArray(inventory) || inventory.length === 0) {
      return [];
    }

    const list = [];
    inventory.forEach((item) => {
      const totalQ = Number(item.total_quantity || 0);
      const reservedQ = Number(item.reserved_quantity || 0);
      const availableQ = Number(item.available_quantity ?? (totalQ - reservedQ));
      const minLevel = Number(item.minimum_stock_level || 5);

      if (availableQ <= minLevel) {
        let priority = 'LOW';
        let reason = `Stock has dipped below minimum threshold (${minLevel} units).`;

        if (totalQ === 0) {
          priority = 'CRITICAL';
          reason = 'Completely out of physical stock in warehouse depot.';
        } else if (availableQ <= 0) {
          priority = 'CRITICAL';
          reason = `Zero available unreserved stock. All ${totalQ} units are locked for active orders.`;
        } else if (availableQ <= minLevel / 2) {
          priority = 'WARNING';
          reason = `Critical depletion: available units (${availableQ}) are under 50% of safety buffer.`;
        }

        const suggestedQty = Math.max(minLevel * 2, minLevel - availableQ + 10);

        list.push({
          id: item.id || item.product_id,
          product_id: item.product_id || item.id,
          productName: item.product?.name || item.name || 'Solar Equipment',
          sku: item.product?.sku || item.sku || 'SKU-N/A',
          category: item.product?.category?.name || item.category || 'Solar PV',
          warehouse: item.warehouse || 'Jaipur Central Solar Logistics Hub',
          onHand: totalQ,
          reserved: reservedQ,
          available: availableQ,
          reorderPoint: minLevel,
          priority,
          reason,
          suggestedQty,
        });
      }
    });

    return list;
  }, [inventory]);

  // Filter alerts by search, priority, and acknowledge status
  const filteredAlerts = useMemo(() => {
    let result = generatedAlerts.filter((a) => !acknowledgedIds.includes(a.id));

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.productName.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter((a) => a.priority === priorityFilter);
    }

    return result;
  }, [generatedAlerts, debouncedSearch, priorityFilter, acknowledgedIds]);

  const totalPages = Math.ceil(filteredAlerts.length / pageSize) || 1;
  const paginatedAlerts = filteredAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAcknowledge = (id) => {
    setAcknowledgedIds((prev) => [...prev, id]);
  };

  const handleCreatePO = (alertItem) => {
    navigate('/warehouse/purchases', {
      state: {
        product_id: alertItem.product_id,
        suggestedQty: alertItem.suggestedQty,
        sku: alertItem.sku,
        productName: alertItem.productName,
      },
    });
  };

  const criticalCount = generatedAlerts.filter((a) => a.priority === 'CRITICAL' && !acknowledgedIds.includes(a.id)).length;
  const warningCount = generatedAlerts.filter((a) => a.priority === 'WARNING' && !acknowledgedIds.includes(a.id)).length;
  const lowCount = generatedAlerts.filter((a) => a.priority === 'LOW' && !acknowledgedIds.includes(a.id)).length;

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Low Stock & Reorder Alert Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
              {filteredAlerts.length} Actionable Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Proactive threshold monitoring identifying stock depletion, exhausted unreserved allocations, and suggested procurement reorders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(fetchInventory())}
            className="flex items-center gap-1.5"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh Alerts</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/warehouse/purchases')}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>Open Purchase Center</span>
          </Button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <Card className="p-4 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Alerts</span>
            <AlertTriangle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{filteredAlerts.length}</div>
          <span className="text-[10px] text-slate-400">Requires procurement attention</span>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Out of Stock</span>
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{criticalCount}</div>
          <span className="text-[10px] text-rose-500 font-semibold">Immediate reorder required</span>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approaching Reorder</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{warningCount}</div>
          <span className="text-[10px] text-amber-600">Under 50% safety buffer</span>
        </Card>

        <Card className="p-4 border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Standard Low Stock</span>
            <Boxes className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-2xl font-black text-[#0284C7] mt-2">{lowCount}</div>
          <span className="text-[10px] text-slate-400">At or below reorder level</span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search alert by SKU or equipment name..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setPriorityFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                priorityFilter === 'ALL'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => {
                setPriorityFilter('CRITICAL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                priorityFilter === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => {
                setPriorityFilter('WARNING');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                priorityFilter === 'WARNING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Warning ({warningCount})
            </button>
          </div>
        </div>
      </Card>

      {/* Alerts Cards Stack with Proper Indentation & Structure */}
      <div className="space-y-4 mb-6">
        {paginatedAlerts.map((alert) => {
          const ratio = alert.reorderPoint > 0 ? Math.min(100, Math.round((alert.available / alert.reorderPoint) * 100)) : 0;
          const isCritical = alert.priority === 'CRITICAL';

          return (
            <Card
              key={alert.id}
              className={`p-5 border transition shadow-sm ${
                isCritical ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Product & Hierarchy */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : alert.priority === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-sky-100 text-[#0284C7] border border-sky-300'
                      }`}
                    >
                      {alert.priority}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {alert.sku}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded">
                      {alert.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {alert.productName}
                  </h3>

                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{alert.reason}</span>
                  </p>
                </div>

                {/* Center: Stock Health Metric & Progress */}
                <div className="w-full lg:w-72 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-500">Available / Reorder Point</span>
                    <span className={alert.available <= 0 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {alert.available} / {alert.reorderPoint} units
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCritical ? 'bg-rose-500' : alert.available <= alert.reorderPoint / 2 ? 'bg-amber-500' : 'bg-[#0284C7]'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>On-Hand: {alert.onHand}</span>
                    <span>Reserved: {alert.reserved}</span>
                    <span className="text-[#0284C7] font-semibold">Suggest: +{alert.suggestedQty}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:w-44 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleCreatePO(alert)}
                    className="flex-1 lg:flex-initial flex items-center justify-center gap-1 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs border-0 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Generate PO</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="flex items-center justify-center gap-1 text-slate-600 hover:text-slate-900 text-xs"
                    title="Acknowledge alert"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Acknowledge</span>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredAlerts.length === 0 && (
          <Card className="p-12 text-center border-slate-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Low Stock Alerts</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All solar modules, inverters, battery banks, and BOS components currently meet or exceed minimum safety reorder thresholds.
            </p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredAlerts.length > 0 && (
        <Card className="border-slate-200 overflow-hidden shadow-sm">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredAlerts.length}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default WarehouseAlertsPage;
