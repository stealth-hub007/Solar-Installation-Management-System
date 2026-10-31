import axiosInstance from '../../../services/axiosInstance';

export const installationAPI = {
  async getAssignedInstallations(params = {}) {
    try {
      const response = await axiosInstance.get('/v1/installations', { params });
      const raw = response.data?.data?.items || response.data?.data || response.data;
      const items = Array.isArray(raw) ? raw : [];
      return items.map((j) => {
        const checklist = j.checklist || {};
        const completedChecklistCount = [
          checklist.mounting_stands_installed,
          checklist.solar_panels_installed,
          checklist.inverter_installed,
          checklist.battery_installed,
          checklist.wiring_completed,
          checklist.safety_equipment_installed,
          checklist.earthing_completed,
          checklist.system_tested,
          checklist.power_generation_verified,
        ].filter(Boolean).length;

        return {
          ...j,
          id: j.id,
          rawId: j.id,
          jobNumber: j.job_number || `JOB-${j.id.slice(0, 8).toUpperCase()}`,
          displayId: `INS-${j.id.slice(0, 8).toUpperCase()}`,
          status: j.installation_status ? j.installation_status.replace(/_/g, ' ') : 'Scheduled',
          checklistCompleted: completedChecklistCount,
          checklistTotal: 9,
        };
      });
    } catch (err) {
      console.error('Failed to fetch assigned installations:', err);
      throw err;
    }
  },

  async getInstallationById(id) {
    try {
      const response = await axiosInstance.get(`/v1/installations/${id}`);
      const j = response.data?.data || response.data;
      const checklist = j.checklist || {};
      const completedChecklistCount = [
        checklist.mounting_stands_installed,
        checklist.solar_panels_installed,
        checklist.inverter_installed,
        checklist.battery_installed,
        checklist.wiring_completed,
        checklist.safety_equipment_installed,
        checklist.earthing_completed,
        checklist.system_tested,
        checklist.power_generation_verified,
      ].filter(Boolean).length;

      return {
        ...j,
        id: j.id,
        rawId: j.id,
        jobNumber: j.job_number || `JOB-${j.id.slice(0, 8).toUpperCase()}`,
        displayId: `INS-${j.id.slice(0, 8).toUpperCase()}`,
        status: j.installation_status ? j.installation_status.replace(/_/g, ' ') : 'Scheduled',
        checklistCompleted: completedChecklistCount,
        checklistTotal: 9,
      };
    } catch (err) {
      console.error(`Failed to fetch installation ${id}:`, err);
      throw err;
    }
  },

  async startInstallation(id) {
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/start`);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to start installation ${id}:`, err);
      throw err;
    }
  },

  async updateChecklist(id, checklist) {
    try {
      const response = await axiosInstance.put(`/v1/installations/${id}/checklist`, checklist);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to update checklist for ${id}:`, err);
      throw err;
    }
  },

  async logWorkHours(id, workLogData) {
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/work-logs`, workLogData);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to log work hours for ${id}:`, err);
      throw err;
    }
  },

  async captureSignoff(id, formData) {
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/signoff`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to capture signoff for ${id}:`, err);
      throw err;
    }
  },

  async completeInstallation(id, completionData) {
    try {
      const response = await axiosInstance.post(`/v1/installations/${id}/complete`, completionData);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to complete installation ${id}:`, err);
      throw err;
    }
  },
};

export default installationAPI;
