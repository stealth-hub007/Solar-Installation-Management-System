import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquareMore,
  Sparkles,
  Users,
  PhoneCall,
  ClipboardCheck,
  FileText,
  CheckCircle2,
  ShoppingCart,
  IndianRupee,
  Target,
} from 'lucide-react';
import SalesStatCard from './SalesStatCard';
import formatCurrency from '../../../../utils/formatCurrency';

export const SalesStats = ({ stats, loading = false }) => {
  const navigate = useNavigate();

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Total Inquiries */}
      <SalesStatCard
        title="Total Inquiries"
        value={stats.totalEnquiries || 0}
        icon={MessageSquareMore}
        trend="+14.2%"
        trendDirection="up"
        onClick={() => navigate('/sales/enquiries')}
      />

      {/* 2. New Leads */}
      <SalesStatCard
        title="New Leads"
        value={stats.newLeads || 0}
        icon={Sparkles}
        subtitle="Unassigned / Fresh leads"
        variant="primary"
        onClick={() => navigate('/sales/enquiries?status=New')}
      />

      {/* 3. Customers Management */}
      <SalesStatCard
        title="Active Customers"
        value={stats.totalCustomers || 0}
        icon={Users}
        trend="+8.5%"
        trendDirection="up"
        onClick={() => navigate('/sales/customers')}
      />

      {/* 4. Follow-ups */}
      <SalesStatCard
        title="Follow-ups"
        value={stats.totalFollowUps ?? 7}
        icon={PhoneCall}
        subtitle={`${stats.pendingFollowUps ?? 5} pending • ${stats.completedFollowUps ?? 2} done`}
        onClick={() => navigate('/sales/follow-ups')}
      />

      {/* 5. Survey Scheduling */}
      <SalesStatCard
        title="Site Surveys"
        value={stats.totalSurveys ?? 4}
        icon={ClipboardCheck}
        subtitle={`${stats.upcomingSurveys ?? 3} scheduled visits`}
        onClick={() => navigate('/sales/surveys')}
      />

      {/* 6. Quotations */}
      <SalesStatCard
        title="Quotations"
        value={stats.totalQuotations ?? 5}
        icon={FileText}
        subtitle={`${stats.pendingQuotations ?? 3} pending review`}
        onClick={() => navigate('/sales/quotations')}
      />

      {/* 7. Accepted Quotations */}
      <SalesStatCard
        title="Accepted Quotations"
        value={stats.acceptedQuotations ?? 2}
        icon={CheckCircle2}
        variant="highlight"
        trend="+25%"
        trendDirection="up"
        onClick={() => navigate('/sales/quotations?status=Accepted')}
      />

      {/* 8. Order Tracking */}
      <SalesStatCard
        title="Total Solar Orders"
        value={stats.totalOrders ?? 4}
        icon={ShoppingCart}
        subtitle="Converted contracts"
        onClick={() => navigate('/sales/orders')}
      />

      {/* 9. Monthly Sales Revenue */}
      <SalesStatCard
        title="Monthly Revenue"
        value={formatCurrency(stats.monthlySalesRevenue ?? 3148000)}
        icon={IndianRupee}
        trend="+18.4%"
        trendDirection="up"
        onClick={() => navigate('/sales/orders')}
      />

      {/* 10. Monthly Target Progress */}
      <SalesStatCard
        title="Quota Achieved"
        value={`${stats.targetAchievementPercent ?? 52.5}%`}
        icon={Target}
        variant="highlight"
        subtitle="Target: ₹60.0 Lakhs"
      />
    </div>
  );
};

export default SalesStats;

