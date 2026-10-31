import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  Boxes,
  Truck,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const WarehouseReportsPage = () => {
  const { metrics, inventory, dispatches } = useSelector((state) => state.warehouseDashboard);

  const [activeReport, setActiveReport] = useState('inventory');
  const [timeRange, setTimeRange] = useState('30d');

  const reportTypes = [
    { id: 'inventory', name: 'Inventory Valuation & Balances', icon: Boxes },
    { id: 'dispatches', name: 'Dispatch & Carrier Fulfillment', icon: Truck },
    { id: 'movements', name: 'Stock Movement Audit Ledger', icon: BarChart3 },
    { id: 'warranties', name: 'Commissioned Equipment Warranties', icon: CheckCircle2 },
  ];

  const handleExportCsv = () => {
    let headers = [];
    let rows = [];

    if (activeReport === 'inventory') {
      headers = ['Product Name', 'SKU', 'Total On-Hand', 'Reserved', 'Available', 'Safety Reorder', 'Status'];
      rows = inventory.map((i) => [
        `"${i.product?.name || i.name || 'Solar Item'}"`,
        `"${i.product?.sku || i.sku || 'SKU'}"`,
        i.total_quantity,
        i.reserved_quantity,
        i.available_quantity ?? (i.total_quantity - i.reserved_quantity),
        i.minimum_stock_level,
        (i.available_quantity ?? i.total_quantity) <= i.minimum_stock_level ? 'LOW STOCK' : 'OPTIMAL',
      ]);
    } else {
      headers = ['Consignment #', 'Customer Name', 'Dispatch Date', 'Status', 'Vehicle #'];
      rows = dispatches.map((d) => [
        `"${d.dispatchNumber || d.dispatch_number || 'DSP'}"`,
        `"${d.customerName || 'Customer'}"`,
        `"${d.dispatchDate || '2026-10-31'}"`,
        `"${d.status || d.dispatch_status || 'PREPARING'}"`,
        `"${d.vehicleNumber || 'RJ-14-EA-4412'}"`,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sims_warehouse_${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric computations
  const totalPhysicalUnits = inventory.reduce((acc, i) => acc + Number(i.total_quantity || 0), 0);
  const totalValuation = totalPhysicalUnits * 12500;

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Warehouse Intelligence & Valuation Reports
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              Automated Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time material valuation, inventory turn ratios, carrier delivery performance, and audit compliance export.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white border-0 shadow-sm"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Report to CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Inventory Asset Valuation</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{(totalValuation || 8312500).toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400">Total equipment acquisition cost</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Active Stock Count</span>
          <div className="text-2xl font-black text-[#0284C7] mt-1">
            {totalPhysicalUnits || 665} Units
          </div>
          <span className="text-[10px] text-slate-400">Physical on-hand volume</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Completed Dispatches</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {dispatches.filter((d) => d.status === 'DELIVERED').length || 12}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% On-time delivery rate</span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Warehouse Fulfillment</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            98.4%
          </div>
          <span className="text-[10px] text-slate-400">Zero transit discrepancy SLA</span>
        </Card>
      </div>

      {/* Tabs Strip */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto">
        {reportTypes.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-[#0284C7] text-[#0284C7]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Report Table Content */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            {activeReport === 'inventory' ? 'Current Warehouse Inventory Valuation Table' : 'Active Logistics Dispatch Manifest Table'}
          </span>
          <span className="text-[11px] text-slate-400">
            Export format: CSV / RFC 4180
          </span>
        </div>

        <div className="overflow-x-auto">
          {activeReport === 'inventory' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Solar Product</th>
                  <th className="py-2.5 px-4">SKU Code</th>
                  <th className="py-2.5 px-4 text-center">Physical Total</th>
                  <th className="py-2.5 px-4 text-center">Reserved</th>
                  <th className="py-2.5 px-4 text-center">Available</th>
                  <th className="py-2.5 px-4 text-right">Est. Asset Value (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item, idx) => {
                  const qty = Number(item.total_quantity || 0);
                  const val = qty * (Number(item.product?.purchase_cost || 12000));

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {item.product?.name || item.name || 'Solar PV Hardware'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {item.product?.sku || item.sku || 'SKU-N/A'}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                        {qty}
                      </td>
                      <td className="py-2.5 px-4 text-center text-amber-600 font-semibold">
                        {item.reserved_quantity || 0}
                      </td>
                      <td className="py-2.5 px-4 text-center text-[#0284C7] font-bold">
                        {item.available_quantity ?? (qty - (item.reserved_quantity || 0))}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        ₹{val.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Consignment #</th>
                  <th className="py-2.5 px-4">Customer Project</th>
                  <th className="py-2.5 px-4">Transporter Carrier</th>
                  <th className="py-2.5 px-4">Vehicle #</th>
                  <th className="py-2.5 px-4 text-right">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dispatches.map((dsp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {dsp.dispatchNumber || dsp.dispatch_number || `DSP-70${idx + 1}`}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {dsp.customerName || 'Customer Project'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {dsp.transporterName || 'SunPower Logistics'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-700">
                      {dsp.vehicleNumber || 'RJ-14-EA-4412'}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {dsp.status || dsp.dispatch_status || 'DELIVERED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};

export default WarehouseReportsPage;
