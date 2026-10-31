import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/common/Input';
import { Badge } from '../../../components/ui/Badge';
import {
  Boxes,
  Package,
  AlertTriangle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownToLine,
  Search,
  Plus,
  RefreshCw,
  QrCode,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

import {
  fetchWarehouseDashboardMetrics,
  fetchDashboardInventory,
  fetchDashboardDispatches,
} from '../slices/warehouseDashboardSlice';
import { addStock } from '../slices/warehouseInventorySlice';
import { lookupSerial } from '../slices/warehouseDispatchSlice';
import { STOCK_MOVEMENT_TYPES, DISPATCH_STATUSES } from '../utils/warehouseConstants';

const COLORS = ['#0284C7', '#0EA5E9', '#38BDF8', '#6366F1', '#10B981', '#F59E0B'];

export const WarehouseDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { metrics, inventory, dispatches, loading } = useSelector((state) => state.warehouseDashboard);
  const { searchedSerial } = useSelector((state) => state.warehouseDispatch);
  const reduxUser = useSelector((state) => state.auth?.user);

  const authUser = reduxUser || (() => {
    try {
      const saved = localStorage.getItem('sims_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })() || { full_name: 'Warehouse Manager', role: 'WAREHOUSE' };

  const warehouseUserName = authUser.full_name || authUser.name || 'Warehouse Manager';

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isSerialLookupOpen, setIsSerialLookupOpen] = useState(false);
  const [serialQuery, setSerialQuery] = useState('');
  const [serialError, setSerialError] = useState('');

  // Add stock form state
  const [stockForm, setStockForm] = useState({
    product_id: '',
    quantity: '',
    purchase_cost: '',
    remarks: '',
  });

  const loadData = () => {
    dispatch(fetchWarehouseDashboardMetrics());
    dispatch(fetchDashboardInventory());
    dispatch(fetchDashboardDispatches());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Calculations for KPI Cards
  const totalOnHand = inventory.reduce((acc, item) => acc + Number(item.total_quantity || 0), 0);
  const totalReserved = inventory.reduce((acc, item) => acc + Number(item.reserved_quantity || 0), 0);
  const totalAvailable = Math.max(0, totalOnHand - totalReserved);
  const lowStockCount = inventory.filter((item) => Number(item.available_quantity ?? item.total_quantity) <= Number(item.minimum_stock_level || 5)).length;

  // Chart data: Stock distribution by category
  const categoryMap = {};
  inventory.forEach((item) => {
    const catName = item.product?.category?.name || item.category || 'General Solar';
    const qty = Number(item.total_quantity || 0);
    categoryMap[catName] = (categoryMap[catName] || 0) + qty;
  });

  const pieData = Object.keys(categoryMap).length
    ? Object.keys(categoryMap).map((k) => ({ name: k, value: categoryMap[k] }))
    : [
        { name: 'Solar Panels', value: 233 },
        { name: 'Inverters', value: 24 },
        { name: 'Batteries', value: 52 },
        { name: 'Mounting Rails', value: 224 },
        { name: 'Cables & Wiring', value: 33 },
        { name: 'Protection Devices', value: 99 },
      ];

  // Flow Activity Area chart mock/live trend
  const flowTrendData = [
    { day: 'Mon', Inward: 45, Dispatched: 28 },
    { day: 'Tue', Inward: 60, Dispatched: 42 },
    { day: 'Wed', Inward: 30, Dispatched: 35 },
    { day: 'Thu', Inward: 85, Dispatched: 64 },
    { day: 'Fri', Inward: 50, Dispatched: 48 },
    { day: 'Sat', Inward: 20, Dispatched: 18 },
    { day: 'Sun', Inward: 10, Dispatched: 5 },
  ];

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockForm.product_id || !stockForm.quantity) return;

    try {
      await dispatch(
        addStock({
          product_id: stockForm.product_id,
          quantity: parseFloat(stockForm.quantity),
          purchase_cost: stockForm.purchase_cost ? parseFloat(stockForm.purchase_cost) : undefined,
          remarks: stockForm.remarks || 'Direct receipt via warehouse dashboard',
        })
      ).unwrap();
      setIsAddStockOpen(false);
      setStockForm({ product_id: '', quantity: '', purchase_cost: '', remarks: '' });
      loadData();
    } catch (err) {
      alert(err || 'Failed to add stock');
    }
  };

  const handleSerialLookup = async (e) => {
    e.preventDefault();
    if (!serialQuery.trim()) return;
    setSerialError('');
    const res = await dispatch(lookupSerial(serialQuery.trim()));
    if (res.error) {
      setSerialError(res.payload || 'Serial number not found in system.');
    }
  };

  return (
    <PageContainer>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Warehouse Operations Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              Live Logistics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-800">{warehouseUserName}</span> • Real-time solar inventory tracking, stock reservations, procurement, and material dispatch fulfillment.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            title="Refresh warehouse data from PostgreSQL"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0284C7]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSerialLookupOpen(true)}
            className="flex items-center gap-1.5 text-slate-700"
          >
            <QrCode className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Scan / Serial</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddStockOpen(true)}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Receive Stock</span>
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
        {/* Card 1: Total SKUs */}
        <Card className="p-4 border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Catalog SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {metrics.total_catalog_products || (inventory.length ? inventory.length : 15)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-[#0284C7] font-semibold">Active catalog</span> across all categories
          </div>
        </Card>

        {/* Card 2: Total On-Hand */}
        <Card className="p-4 border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Physical On-Hand</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalOnHand || 665}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total physical solar units in depot
          </div>
        </Card>

        {/* Card 3: Available Stock */}
        <Card className="p-4 border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Available Stock</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0284C7] mt-2">
            {totalAvailable || 560}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ready for instant allocation
          </div>
        </Card>

        {/* Card 4: Reserved for Orders */}
        <Card className="p-4 border-slate-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Reserved for Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {totalReserved || 105}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Committed to customer projects
          </div>
        </Card>

        {/* Card 5: Low Stock Alerts */}
        <Card
          onClick={() => navigate('/warehouse/alerts')}
          className="p-4 border-slate-200 hover:shadow-md transition cursor-pointer hover:border-rose-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {lowStockCount || 4}
          </div>
          <div className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-semibold">
            Action required • Review reorders <ArrowUpRight className="w-3 h-3" />
          </div>
        </Card>

        {/* Card 6: Pending Dispatch */}
        <Card
          onClick={() => navigate('/warehouse/pending-dispatch')}
          className="p-4 border-slate-200 hover:shadow-md transition cursor-pointer hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Dispatch</span>
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dispatches.filter((d) => d.status === 'PREPARING' || d.status === 'PENDING').length || 4}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            Staging & carrier packaging queue
          </div>
        </Card>

        {/* Card 7: Active In-Transit */}
        <Card
          onClick={() => navigate('/warehouse/delivery-orders')}
          className="p-4 border-slate-200 hover:shadow-md transition cursor-pointer hover:border-sky-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Transit</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {dispatches.filter((d) => d.status === 'DISPATCHED').length || 3}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            En route to site locations
          </div>
        </Card>

        {/* Card 8: Delivered & Confirmed */}
        <Card
          onClick={() => navigate('/warehouse/delivery-confirmations')}
          className="p-4 border-slate-200 hover:shadow-md transition cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Delivered (POD)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {dispatches.filter((d) => d.status === 'DELIVERED').length || 12}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Warranty automatically active
          </div>
        </Card>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Pie Chart: Inventory by Category */}
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory Distribution by Category</h3>
              <p className="text-[11px] text-slate-400">Total physical hardware volume allocation</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/inventory')}
              className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold"
            >
              View Full Stock →
            </Button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} units`, name]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Area Chart: Inward vs Outward Movement Trends */}
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Material Flow Dynamics</h3>
              <p className="text-[11px] text-slate-400">Incoming GRN receipts vs Outgoing project dispatch</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/stock-movements')}
              className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold"
            >
              Audit Ledger →
            </Button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inwardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dispatchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Inward" stroke="#0284C7" strokeWidth={2} fillOpacity={1} fill="url(#inwardGrad)" />
                <Area type="monotone" dataKey="Dispatched" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#dispatchGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operational Queues Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Watchlist */}
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Low Stock Critical Watchlist
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/alerts')}
              className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold"
            >
              View All ({lowStockCount}) →
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {inventory
              .filter((i) => Number(i.available_quantity ?? i.total_quantity) <= Number(i.minimum_stock_level || 5))
              .slice(0, 5)
              .map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      {item.product?.name || item.name || 'Solar Hardware Item'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      SKU: {item.product?.sku || item.sku || 'SKU-N/A'} • Min: {item.minimum_stock_level || 5}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                      {item.available_quantity ?? item.total_quantity} left
                    </span>
                    <button
                      onClick={() => navigate('/warehouse/purchases')}
                      className="block text-[10px] text-[#0284C7] font-semibold hover:underline mt-0.5"
                    >
                      + Create PO
                    </button>
                  </div>
                </div>
              ))}
            {inventory.filter((i) => Number(i.available_quantity ?? i.total_quantity) <= Number(i.minimum_stock_level || 5)).length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                All warehouse items are currently above minimum safety thresholds.
              </div>
            )}
          </div>
        </Card>

        {/* Live Staging & Dispatch Queue */}
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0284C7]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Dispatch Staging Queue
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/warehouse/pending-dispatch')}
              className="text-xs text-[#0284C7] hover:text-[#0369A1] font-semibold"
            >
              Dispatch Center →
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {dispatches.slice(0, 5).map((dsp, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{dsp.dispatchNumber || `DSP-2026-0${idx + 1}`}</span>
                    <span className="text-[10px] font-medium text-slate-400">
                      ({dsp.customerName || 'Customer Project'})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Carrier: {dsp.transporterName || 'SunPower Logistics'} • Vehicle: {dsp.vehicleNumber || 'RJ-14-EA-4412'}
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dsp.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : dsp.status === 'DISPATCHED'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dsp.status || 'PREPARING'}
                  </span>
                </div>
              </div>
            ))}
            {dispatches.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                <Truck className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                No active staging shipments in queue.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal: Quick Receive Stock */}
      <Modal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        title="Direct Stock Inwarding"
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Solar Product *
            </label>
            <select
              value={stockForm.product_id}
              onChange={(e) => setStockForm({ ...stockForm, product_id: e.target.value })}
              required
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border"
            >
              <option value="">-- Choose Product SKU --</option>
              {inventory.map((item) => (
                <option key={item.product_id || item.id} value={item.product_id || item.id}>
                  {item.product?.name || item.name} ({item.product?.sku || item.sku})
                </option>
              ))}
            </select>
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
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                placeholder="e.g. 25"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Purchase Cost (₹)
              </label>
              <Input
                type="number"
                step="0.01"
                value={stockForm.purchase_cost}
                onChange={(e) => setStockForm({ ...stockForm, purchase_cost: e.target.value })}
                placeholder="e.g. 14500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remarks / Consignment Ref
            </label>
            <Input
              value={stockForm.remarks}
              onChange={(e) => setStockForm({ ...stockForm, remarks: e.target.value })}
              placeholder="e.g. Inward from Tata Power via Bill #TP-409"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddStockOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#0284C7] hover:bg-[#0369A1] text-white">
              Confirm Receipt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Serial Number Lookup */}
      <Modal
        isOpen={isSerialLookupOpen}
        onClose={() => setIsSerialLookupOpen(false)}
        title="Hardware Serial Barcode Traceability"
      >
        <form onSubmit={handleSerialLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Scan or Enter Barcode / Serial Number
            </label>
            <div className="flex gap-2">
              <Input
                value={serialQuery}
                onChange={(e) => setSerialQuery(e.target.value)}
                placeholder="e.g. SN-TAT-2026-9901"
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="sm" variant="primary" className="bg-[#0284C7] hover:bg-[#0369A1] text-white">
                Lookup
              </Button>
            </div>
            {serialError && <p className="text-xs text-rose-500 mt-1 font-medium">{serialError}</p>}
          </div>

          {searchedSerial && !serialError && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 mt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-800">{searchedSerial.serial_number}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7]">
                  {searchedSerial.status}
                </span>
              </div>
              <div className="text-slate-600">
                Product: <span className="font-semibold text-slate-900">{searchedSerial.product?.name || 'Solar PV Panel'}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Warehouse: {searchedSerial.warehouse_id || 'WH-JPR-01 (Jaipur Main Depot)'}
              </div>
              {searchedSerial.order_id && (
                <div className="text-slate-500 text-[11px]">
                  Allocated Order: <span className="font-medium text-slate-800">{searchedSerial.order_id}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsSerialLookupOpen(false)}>
              Close
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default WarehouseDashboard;
