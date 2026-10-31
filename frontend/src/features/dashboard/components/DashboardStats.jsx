import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  MessageSquareMore,
  Zap,
  ClipboardCheck,
  Headphones,
  AlertTriangle,
} from 'lucide-react';
import StatCard from './StatCard';
import ErrorMessage from '../../../components/common/ErrorMessage';

export const DashboardStats = ({
  stats,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (error && !stats) {
    return (
      <ErrorMessage
        title="Failed to load executive statistics"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  const kpis = [
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      value: stats?.totalRevenue?.value ?? 0,
      isCurrency: true,
      compact: false,
      icon: TrendingUp,
      iconBgColor: 'bg-sky-50 text-[#0284C7]',
      changePercentage: stats?.totalRevenue?.changePercentage,
      trend: stats?.totalRevenue?.trend,
      comparisonPeriod: stats?.totalRevenue?.comparisonPeriod,
    },
    {
      id: 'paymentsReceived',
      title: 'Payments Received',
      value: stats?.paymentsReceived?.value ?? 0,
      isCurrency: true,
      compact: false,
      icon: CheckCircle2,
      iconBgColor: 'bg-emerald-50 text-emerald-600',
      changePercentage: stats?.paymentsReceived?.changePercentage,
      trend: stats?.paymentsReceived?.trend,
      comparisonPeriod: stats?.paymentsReceived?.comparisonPeriod,
    },
    {
      id: 'outstandingPayments',
      title: 'Outstanding Payments',
      value: stats?.outstandingPayments?.value ?? 0,
      isCurrency: true,
      compact: false,
      icon: Clock,
      iconBgColor: 'bg-amber-50 text-amber-600',
      changePercentage: stats?.outstandingPayments?.changePercentage,
      trend: stats?.outstandingPayments?.trend,
      comparisonPeriod: stats?.outstandingPayments?.comparisonPeriod,
    },
    {
      id: 'totalCustomers',
      title: 'Total Customers',
      value: stats?.totalCustomers?.value ?? 0,
      isCurrency: false,
      compact: false,
      icon: Users,
      iconBgColor: 'bg-blue-50 text-blue-600',
      changePercentage: stats?.totalCustomers?.changePercentage,
      trend: stats?.totalCustomers?.trend,
      comparisonPeriod: stats?.totalCustomers?.comparisonPeriod,
    },
    {
      id: 'totalEnquiries',
      title: 'Total Enquiries',
      value: stats?.totalEnquiries?.value ?? 0,
      isCurrency: false,
      compact: false,
      icon: MessageSquareMore,
      iconBgColor: 'bg-indigo-50 text-indigo-600',
      changePercentage: stats?.totalEnquiries?.changePercentage,
      trend: stats?.totalEnquiries?.trend,
      comparisonPeriod: stats?.totalEnquiries?.comparisonPeriod,
    },
    {
      id: 'activeProjects',
      title: 'Active Projects',
      value: stats?.activeProjects?.value ?? 0,
      isCurrency: false,
      compact: false,
      icon: Zap,
      iconBgColor: 'bg-sky-100 text-[#0284C7]',
      changePercentage: stats?.activeProjects?.changePercentage,
      trend: stats?.activeProjects?.trend,
      comparisonPeriod: stats?.activeProjects?.comparisonPeriod,
    },
    {
      id: 'pendingSurveys',
      title: 'Pending Surveys',
      value: stats?.pendingSurveys?.value ?? 0,
      isCurrency: false,
      compact: false,
      icon: ClipboardCheck,
      iconBgColor: 'bg-cyan-50 text-cyan-700',
      changePercentage: stats?.pendingSurveys?.changePercentage,
      trend: stats?.pendingSurveys?.trend,
      comparisonPeriod: stats?.pendingSurveys?.comparisonPeriod,
    },
    {
      id: 'openServiceTickets',
      title: 'Open Service Tickets',
      value: stats?.openServiceTickets?.value ?? 0,
      isCurrency: false,
      compact: false,
      icon: Headphones,
      iconBgColor: 'bg-purple-50 text-purple-600',
      changePercentage: stats?.openServiceTickets?.changePercentage,
      trend: stats?.openServiceTickets?.trend,
      comparisonPeriod: stats?.openServiceTickets?.comparisonPeriod,
    },
    {
      id: 'lowStockAlerts',
      title: 'Low Stock Alerts',
      value: stats?.lowStockAlerts?.value ?? 0,
      isCurrency: false,
      compact: false,
      icon: AlertTriangle,
      iconBgColor: 'bg-rose-50 text-rose-600',
      changePercentage: stats?.lowStockAlerts?.changePercentage,
      trend: stats?.lowStockAlerts?.trend,
      comparisonPeriod: stats?.lowStockAlerts?.comparisonPeriod,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          isCurrency={kpi.isCurrency}
          compact={kpi.compact}
          icon={kpi.icon}
          iconBgColor={kpi.iconBgColor}
          changePercentage={kpi.changePercentage}
          trend={kpi.trend}
          comparisonPeriod={kpi.comparisonPeriod}
          isLoading={isLoading}
          error={error}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
