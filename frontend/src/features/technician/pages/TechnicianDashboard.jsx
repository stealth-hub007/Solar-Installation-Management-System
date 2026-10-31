import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../../components/layout/PageContainer';
import TechnicianWelcome from '../components/dashboard/TechnicianWelcome';
import TechnicianStats from '../components/dashboard/TechnicianStats';
import TodayAssignments from '../components/dashboard/TodayAssignments';
import RecentTechnicianActivity from '../components/dashboard/RecentTechnicianActivity';
import { fetchTechnicianStats, fetchTechnicianActivity } from '../slices/technicianDashboardSlice';
import { fetchAssignedSurveys } from '../slices/assignedSurveySlice';
import { fetchAssignedInstallations } from '../slices/assignedInstallationSlice';

export const TechnicianDashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { stats, activity, loading: statsLoading } = useSelector((state) => state.technicianDashboard);
  const { items: surveys } = useSelector((state) => state.assignedSurveys);
  const { items: installations } = useSelector((state) => state.assignedInstallations);

  useEffect(() => {
    dispatch(fetchTechnicianStats());
    dispatch(fetchTechnicianActivity());
    dispatch(fetchAssignedSurveys());
    dispatch(fetchAssignedInstallations());
  }, [dispatch]);

  const displayName = user?.name || user?.full_name || user?.email?.split('@')[0] || 'Technician';

  return (
    <PageContainer>
      {/* 1. Welcome Hero Banner with Quick Actions */}
      <TechnicianWelcome
        technicianName={displayName}
        assignedSurveys={stats.assignedSurveys ?? stats.assigned_surveys_count ?? 0}
        assignedInstallations={stats.assignedInstallations ?? stats.assigned_installations_count ?? 0}
        loggedHours={stats.loggedHours ?? Number(stats.total_work_hours_logged) ?? 0}
      />

      {/* 2. 15 Field Operations KPI Cards */}
      <TechnicianStats stats={stats} />

      {/* 3. Today's Site Surveys & Active Installations */}
      <TodayAssignments surveys={surveys} installations={installations} />

      {/* 4. Recent Technician Activity & Audit Trail */}
      <RecentTechnicianActivity activities={activity} />
    </PageContainer>
  );
};

export default TechnicianDashboard;
