import axiosInstance from '../../../services/axiosInstance';

export const technicianAPI = {
  async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/v1/dashboard/technician');
      const d = response.data?.data || response.data || {};
      return {
        // Backend keys preserved
        ...d,
        // Enriched camelCase fields for component consumption
        assignedSurveys: d.assigned_surveys_count ?? 0,
        pendingSurveys: d.pending_site_surveys ?? d.pending_surveys_count ?? 0,
        inProgressSurveys: d.in_progress_surveys ?? 0,
        submittedSurveys: d.submitted_surveys ?? 0,
        completedSurveys: d.completed_surveys ?? d.submitted_surveys ?? 0,
        surveysAwaitingApproval: d.surveys_awaiting_approval ?? 0,
        surveysRequiringCorrections: d.surveys_requiring_corrections ?? 0,
        upcomingSiteVisits: d.upcoming_site_visits ?? 0,

        assignedInstallations: d.assigned_installations_count ?? 0,
        pendingInstallations: d.pending_installations ?? 0,
        inProgressInstallations: d.in_progress_installations ?? 0,
        completedInstallations: d.completed_installations ?? d.completed_installations_count ?? 0,
        overdueAssignments: d.overdue_assignments ?? 0,
        pendingEquipmentVerification: d.pending_equipment_verification ?? 0,
        pendingChecklists: d.pending_checklists ?? 0,
        pendingSignoffs: d.pending_customer_sign_offs ?? 0,

        totalTasks: d.total_assigned_tasks ?? 0,
        todayTasks: d.today_tasks ?? 0,
        loggedHours: Number(d.total_work_hours_logged) || 0,
        assignedServiceTickets: d.assigned_service_tickets_count ?? 0,
      };
    } catch (err) {
      console.error('Error fetching technician stats:', err);
      return {
        assignedSurveys: 0,
        pendingSurveys: 0,
        inProgressSurveys: 0,
        submittedSurveys: 0,
        completedSurveys: 0,
        surveysAwaitingApproval: 0,
        surveysRequiringCorrections: 0,
        upcomingSiteVisits: 0,
        assignedInstallations: 0,
        pendingInstallations: 0,
        inProgressInstallations: 0,
        completedInstallations: 0,
        overdueAssignments: 0,
        pendingEquipmentVerification: 0,
        pendingChecklists: 0,
        pendingSignoffs: 0,
        totalTasks: 0,
        todayTasks: 0,
        loggedHours: 0,
        assignedServiceTickets: 0,
      };
    }
  },

  async getRecentActivity() {
    try {
      const response = await axiosInstance.get('/v1/notifications', { params: { limit: 10 } });
      const notifications = response.data?.data || response.data || [];
      if (Array.isArray(notifications) && notifications.length > 0) {
        return notifications.map((n) => ({
          id: n.id,
          action: `${n.title}: ${n.message}`,
          time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: n.event_type || 'activity',
        }));
      }
    } catch {
      // Ignore notification fetch errors
    }
    return [
      { id: 'ACT-01', action: 'Field operations dashboard synchronized with solar cloud server', time: 'Just now', type: 'system' },
    ];
  },
};

export default technicianAPI;
