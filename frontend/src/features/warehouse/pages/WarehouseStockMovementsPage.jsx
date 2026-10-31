import React, { useState, useMemo } from 'react';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  History,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  SlidersHorizontal,
  Calendar,
  Boxes,
  RefreshCw,
} from 'lucide-react';

import { STOCK_MOVEMENT_TYPES } from '../utils/warehouseConstants';

export const WarehouseStockMovementsPage = () => {
  const [movements] = useState([
    {
      id: 'mov-1',
      refNumber: 'MVT-20261031-01',
      productName: 'Waaree 550W Bifacial Dual Glass Module',
      sku: 'SP-WAR-550B',
      type: 'STOCK_DISPATCH',
      quantity: -24,
      docRef: 'DSP-701',
      performedBy: 'Super Administrator',
      remarks: 'Dispatched for Rajesh Sharma installation project',
      date: '2026-10-31 16:30',
    },
    {
      id: 'mov-2',
      refNumber: 'MVT-20261031-02',
      productName: 'Solis 10kW 3-Phase Commercial Inverter',
      sku: 'INV-SOL-10KW',
      type: 'STOCK_RESERVATION',
      quantity: 1,
      docRef: 'ORD-1082',
      performedBy: 'Super Administrator',
      remarks: 'Material locked for customer order conversion',
      date: '2026-10-31 14:15',
    },
    {
      id: 'mov-3',
      refNumber: 'MVT-20261030-01',
      productName: 'Tata Power 540W Mono PERC Solar Panel',
      sku: 'SP-TAT-540M',
      type: 'STOCK_IN',
      quantity: 50,
      docRef: 'GRN-2026-082',
      performedBy: 'Devendra Rathore',
      remarks: 'Consignment received & staged in Bay 1',
      date: '2026-10-30 11:20',
    },
    {
      id: 'mov-4',
      refNumber: 'MVT-20261029-01',
      productName: 'Polycab 4 sq.mm Solar DC Cable Red (100m Drum)',
      sku: 'CBL-PLY-4R100',
      type: 'STOCK_ADJUSTMENT',
      quantity: -1,
      docRef: 'ADJ-881',
      performedBy: 'Warehouse Manager',
      remarks: 'Audit adjustment for damaged outer sheath',
      date: '2026-10-29 17:05',
    },
    {
      id: 'mov-5',
      refNumber: 'MVT-20261028-01',
      productName: 'Exide 48V 100Ah Lithium LFP Battery Bank',
      sku: 'BAT-EXD-48V100',
      type: 'STOCK_IN',
      quantity: 12,
      docRef: 'GRN-2026-080',
      performedBy: 'Surender Singh',
      remarks: 'Initial stock inwarding from factory',
      date: '2026-10-28 10:10',
    },
    {
      id: 'mov-6',
      refNumber: 'MVT-20261027-01',
      productName: 'Growatt 5kW Dual MPPT On-Grid Inverter',
      sku: 'INV-GRW-5KW',
      type: 'STOCK_RESERVATION',
      quantity: 4,
      docRef: 'ORD-1079',
      performedBy: 'Super Administrator',
      remarks: 'Reserved for Golden Hospitality Resort',
      date: '2026-10-27 15:45',
    },
    {
      id: 'mov-7',
      refNumber: 'MVT-20261026-01',
      productName: 'Aluminum Elevated Rooftop Rail (3.3m)',
      sku: 'MNT-ALU-33M',
      type: 'STOCK_IN',
      quantity: 100,
      docRef: 'GRN-2026-079',
      performedBy: 'Devendra Rathore',
      remarks: 'Bulk aluminum extrusion delivery',
      date: '2026-10-26 09:30',
    },
  ]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Pagination
  const filteredMovements = useMemo(() => {
    let result = [...movements];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (m) =>
          m.refNumber.toLowerCase().includes(q) ||
          m.productName.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.docRef.toLowerCase().includes(q) ||
          m.remarks.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((m) => m.type === typeFilter);
    }

    return result;
  }, [movements, debouncedSearch, typeFilter]);

  const totalPages = Math.ceil(filteredMovements.length / pageSize) || 1;
  const paginatedMovements = filteredMovements.slice(
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
              Stock Movement Audit Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              Immutable Audit Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time chronological log of all stock receipts, project dispatch deductions, reservations, and physical audit adjustments.
          </p>
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
              placeholder="Search by transaction #, SKU, document reference, or remarks..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs rounded-lg border-slate-300 shadow-sm focus:border-[#0284C7] focus:ring-[#0284C7] p-2 border bg-white"
            >
              <option value="ALL">All Movement Event Types</option>
              {Object.keys(STOCK_MOVEMENT_TYPES).map((k) => (
                <option key={k} value={k}>
                  {STOCK_MOVEMENT_TYPES[k].label}
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
                <th className="py-3 px-4">Event Ref & Timestamp</th>
                <th className="py-3 px-4">Solar Hardware</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4 text-center">Qty Delta</th>
                <th className="py-3 px-4">Document Ref</th>
                <th className="py-3 px-4">Audited Remarks</th>
                <th className="py-3 px-4 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMovements.map((m) => {
                const isPositive = m.quantity > 0;
                const isZeroOrNegative = m.quantity < 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{m.refNumber}</div>
                      <div className="text-[10px] text-slate-400">{m.date}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{m.productName}</div>
                      <div className="font-mono text-[10px] text-slate-400">SKU: {m.sku}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.type === 'STOCK_IN'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.type === 'STOCK_DISPATCH'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : m.type === 'STOCK_RESERVATION'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {m.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-bold text-xs ${
                          isPositive ? 'text-emerald-600' : isZeroOrNegative ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {isPositive ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-[#0284C7]">
                      {m.docRef}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {m.remarks}
                    </td>

                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      {m.performedBy}
                    </td>
                  </tr>
                );
              })}

              {paginatedMovements.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No stock movement audit records match the filter.
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
          totalRecords={filteredMovements.length}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default WarehouseStockMovementsPage;
