import React from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import StatCard from '../dashboard/components/StatCard';
import storageService from '../../services/storageService';
import formatCurrency from '../../utils/formatCurrency';
import { DollarSign, TrendingUp, ShieldAlert, PieChart } from 'lucide-react';

export const FinancePage = () => {
  const stats = storageService.getStats();
  const payments = storageService.getPayments();

  const totalCollected = payments
    .filter((p) => p.paymentStatus === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const gstCollected = Math.round(totalCollected * 0.12); // 12% solar GST
  const netRevenue = totalCollected - gstCollected;

  return (
    <PageContainer>
      <PageHeader
        title="Finance & Profitability Management"
        subtitle="Manage project cash flows, milestone receipts, vendor disbursements, and 12% GST compliance"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Cash Collected"
          value={totalCollected}
          isCurrency
          icon={TrendingUp}
          trend="up"
          changePercentage={12.5}
          comparisonPeriod="vs last month"
        />
        <StatCard
          title="GST Tax Compliance (12%)"
          value={gstCollected}
          isCurrency
          icon={DollarSign}
          iconBgColor="bg-amber-100 text-amber-900"
          trend="neutral"
          comparisonPeriod="quarterly liability"
        />
        <StatCard
          title="Net Recognized Revenue"
          value={netRevenue}
          isCurrency
          icon={TrendingUp}
          iconBgColor="bg-sky-100 text-[#0284C7]"
          trend="up"
          changePercentage={9.2}
          comparisonPeriod="after tax realization"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader
            icon={DollarSign}
            title="Capital Expenditure Allocation"
            subtitle="Standard breakdown per kW solar turnkey project"
          />
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Solar PV Modules (Tier-1 Mono PERC)</span>
              <span className="font-bold text-slate-800">55% (~₹25,000 / kW)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Grid-Tied String Inverter & BOS</span>
              <span className="font-bold text-slate-800">20% (~₹9,000 / kW)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Hot-Dip Galvanized Mounting Rails</span>
              <span className="font-bold text-slate-800">12% (~₹5,500 / kW)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Technician Installation & Civil Labor</span>
              <span className="font-bold text-slate-800">8% (~₹3,500 / kW)</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">DISCOM Net Meter Liaisoning & Inspection</span>
              <span className="font-bold text-slate-800">5% (~₹2,000 / kW)</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={TrendingUp}
            title="Collection Health & Aging"
            subtitle="Realized payments versus uncollected milestones"
          />
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-8 border-[#0284C7] text-xl font-bold text-[#0284C7]">
              75%
            </div>
            <p className="text-xs text-slate-600">
              Outstanding receivables stand at <span className="font-bold text-slate-800">{formatCurrency(stats.outstandingPayments.value)}</span> across active installations.
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default FinancePage;

