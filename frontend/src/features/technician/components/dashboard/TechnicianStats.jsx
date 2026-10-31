import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Calendar,
  Wrench,
  AlertCircle,
  PlayCircle,
  Award,
  ClockAlert,
  ShieldCheck,
  ListChecks,
  PenTool,
  CheckSquare,
} from 'lucide-react';
import TechnicianStatCard from './TechnicianStatCard';

export const TechnicianStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const kpis = [
    {
      title: 'Total Assigned Tasks',
      value: stats.totalTasks ?? stats.total_assigned_tasks ?? 0,
      subtext: 'Surveys, installations & tickets',
      icon: CheckSquare,
      badgeText: 'All Work',
      badgeVariant: 'primary',
      onClick: () => navigate('/technician/tasks'),
    },
    {
      title: "Today's Tasks",
      value: stats.todayTasks ?? stats.today_tasks ?? 0,
      subtext: 'Scheduled for today',
      icon: Calendar,
      badgeText: 'Today',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/tasks?tab=today'),
    },
    {
      title: 'Pending Site Surveys',
      value: stats.pendingSurveys ?? stats.pending_site_surveys ?? 0,
      subtext: 'To be visited on-site',
      icon: Clock,
      badgeText: 'Action needed',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/surveys?status=SCHEDULED'),
    },
    {
      title: 'In-Progress Surveys',
      value: stats.inProgressSurveys ?? stats.in_progress_surveys ?? 0,
      subtext: 'Measuring & roof analysis',
      icon: PlayCircle,
      badgeText: 'Active',
      badgeVariant: 'primary',
      onClick: () => navigate('/technician/surveys?status=IN_PROGRESS'),
    },
    {
      title: 'Submitted Surveys',
      value: stats.submittedSurveys ?? stats.submitted_surveys ?? 0,
      subtext: 'Ready for review',
      icon: CheckCircle2,
      badgeText: 'Recorded',
      badgeVariant: 'success',
      onClick: () => navigate('/technician/surveys?status=SUBMITTED'),
    },
    {
      title: 'Awaiting Approval',
      value: stats.surveysAwaitingApproval ?? stats.surveys_awaiting_approval ?? 0,
      subtext: 'Under admin review',
      icon: FileCheck2,
      badgeText: 'Review',
      badgeVariant: 'purple',
      onClick: () => navigate('/technician/surveys?status=SUBMITTED'),
    },
    {
      title: 'Needs Correction',
      value: stats.surveysRequiringCorrections ?? stats.surveys_requiring_corrections ?? 0,
      subtext: 'Survey revision requested',
      icon: AlertTriangle,
      badgeText: 'Revise',
      badgeVariant: 'error',
      onClick: () => navigate('/technician/tasks?tab=correction'),
    },
    {
      title: 'Upcoming Site Visits',
      value: stats.upcomingSiteVisits ?? stats.upcoming_site_visits ?? 0,
      subtext: 'Future site inspection',
      icon: Calendar,
      badgeText: 'Upcoming',
      badgeVariant: 'neutral',
      onClick: () => navigate('/technician/tasks?tab=upcoming'),
    },
    {
      title: 'Pending Installations',
      value: stats.pendingInstallations ?? stats.pending_installations ?? 0,
      subtext: 'Awaiting site work',
      icon: AlertCircle,
      badgeText: 'Scheduled',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/installations?status=SCHEDULED'),
    },
    {
      title: 'In-Progress Installs',
      value: stats.inProgressInstallations ?? stats.in_progress_installations ?? 0,
      subtext: 'Mounting & cabling active',
      icon: Wrench,
      badgeText: 'In Progress',
      badgeVariant: 'primary',
      onClick: () => navigate('/technician/installations?status=IN_PROGRESS'),
    },
    {
      title: 'Completed Installs',
      value: stats.completedInstallations ?? stats.completed_installations ?? 0,
      subtext: 'Commissioned & handed over',
      icon: Award,
      badgeText: 'Commissioned',
      badgeVariant: 'success',
      onClick: () => navigate('/technician/installations?status=COMPLETED'),
    },
    {
      title: 'Overdue Assignments',
      value: stats.overdueAssignments ?? stats.overdue_assignments ?? 0,
      subtext: 'Past scheduled date',
      icon: ClockAlert,
      badgeText: 'Overdue',
      badgeVariant: 'error',
      onClick: () => navigate('/technician/tasks?tab=overdue'),
    },
    {
      title: 'Equipment Verification',
      value: stats.pendingEquipmentVerification ?? stats.pending_equipment_verification ?? 0,
      subtext: 'Serial tracking pending',
      icon: ShieldCheck,
      badgeText: 'Pending',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/tasks?tab=pending'),
    },
    {
      title: 'Pending Checklists',
      value: stats.pendingChecklists ?? stats.pending_checklists ?? 0,
      subtext: 'Wiring & earthing verification',
      icon: ListChecks,
      badgeText: 'Required',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/installations'),
    },
    {
      title: 'Customer Sign-offs',
      value: stats.pendingSignoffs ?? stats.pending_customer_sign_offs ?? 0,
      subtext: 'Digital signature required',
      icon: PenTool,
      badgeText: 'Handover',
      badgeVariant: 'purple',
      onClick: () => navigate('/technician/installations'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {kpis.map((kpi, idx) => (
        <TechnicianStatCard key={idx} {...kpi} />
      ))}
    </div>
  );
};

export default TechnicianStats;
