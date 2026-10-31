import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  FileCheck2,
  Wrench,
  AlertCircle,
  PlayCircle,
  Award,
  ListChecks,
  PenTool,
} from 'lucide-react';
import TechnicianStatCard from './TechnicianStatCard';

export const TechnicianStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const kpis = [
    {
      title: 'Total Assigned Surveys',
      value: stats.assignedSurveys ?? 4,
      subtext: 'Assigned inspection visits',
      icon: ClipboardList,
      badgeText: 'Active',
      badgeVariant: 'primary',
      onClick: () => navigate('/technician/surveys'),
    },
    {
      title: 'Pending Surveys',
      value: stats.pendingSurveys ?? 3,
      subtext: 'To be visited on-site',
      icon: Clock,
      badgeText: 'Action needed',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/surveys?status=SCHEDULED'),
    },
    {
      title: 'Completed Surveys',
      value: stats.completedSurveys ?? 1,
      subtext: 'Fully measured & recorded',
      icon: CheckCircle2,
      badgeText: 'Verified',
      badgeVariant: 'success',
      onClick: () => navigate('/technician/surveys?status=COMPLETED'),
    },
    {
      title: 'Surveys Awaiting Approval',
      value: stats.surveysAwaitingApproval ?? 2,
      subtext: 'Under admin review',
      icon: FileCheck2,
      badgeText: 'Submitted',
      badgeVariant: 'purple',
      onClick: () => navigate('/technician/surveys?status=SUBMITTED'),
    },
    {
      title: 'Total Installations',
      value: stats.assignedInstallations ?? 5,
      subtext: 'Turnkey solar jobs',
      icon: Wrench,
      badgeText: 'Assigned',
      badgeVariant: 'primary',
      onClick: () => navigate('/technician/installations'),
    },
    {
      title: 'Pending Installations',
      value: stats.pendingInstallations ?? 2,
      subtext: 'Awaiting site work commencement',
      icon: AlertCircle,
      badgeText: 'Scheduled',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/installations?status=SCHEDULED'),
    },
    {
      title: 'In-Progress Installations',
      value: stats.inProgressInstallations ?? 2,
      subtext: 'Mounting & cabling active',
      icon: PlayCircle,
      badgeText: 'Active Work',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/installations?status=IN_PROGRESS'),
    },
    {
      title: 'Completed Installations',
      value: stats.completedInstallations ?? 1,
      subtext: 'Handed over to client',
      icon: Award,
      badgeText: 'Commissioned',
      badgeVariant: 'success',
      onClick: () => navigate('/technician/installations?status=COMPLETED'),
    },
    {
      title: 'Pending Checklists',
      value: stats.pendingChecklists ?? 2,
      subtext: 'Wiring & earthing verification',
      icon: ListChecks,
      badgeText: 'Required',
      badgeVariant: 'warning',
      onClick: () => navigate('/technician/installations'),
    },
    {
      title: 'Pending Sign-Offs',
      value: stats.pendingSignoffs ?? 1,
      subtext: 'Customer digital signature',
      icon: PenTool,
      badgeText: 'Pending',
      badgeVariant: 'purple',
      onClick: () => navigate('/technician/installations'),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {kpis.map((kpi, idx) => (
        <TechnicianStatCard key={idx} {...kpi} />
      ))}
    </div>
  );
};

export default TechnicianStats;

