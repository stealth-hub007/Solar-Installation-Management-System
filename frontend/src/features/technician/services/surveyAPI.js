import axiosInstance from '../../../services/axiosInstance';

export const surveyAPI = {
  async getAssignedSurveys(params = {}) {
    try {
      const response = await axiosInstance.get('/v1/surveys', { params });
      const raw = response.data?.data?.items || response.data?.data || response.data;
      const items = Array.isArray(raw) ? raw : [];
      return items.map((s, idx) => ({
        ...s,
        id: s.id,
        rawId: s.id,
        displayId: `SRV-${s.id.slice(0, 8).toUpperCase()}`,
        status: s.survey_status ? s.survey_status.replace(/_/g, ' ') : 'Scheduled',
        approvalStatus: s.approval_status ? s.approval_status.replace(/_/g, ' ') : 'Pending Approval',
        priority: s.monthly_bill && s.monthly_bill > 10000 ? 'High' : 'Normal',
      }));
    } catch (err) {
      console.error('Failed to fetch assigned surveys:', err);
      throw err;
    }
  },

  async getSurveyById(id) {
    try {
      const response = await axiosInstance.get(`/v1/surveys/${id}`);
      const s = response.data?.data || response.data;
      return {
        ...s,
        id: s.id,
        rawId: s.id,
        displayId: `SRV-${s.id.slice(0, 8).toUpperCase()}`,
        status: s.survey_status ? s.survey_status.replace(/_/g, ' ') : 'Scheduled',
        approvalStatus: s.approval_status ? s.approval_status.replace(/_/g, ' ') : 'Pending Approval',
      };
    } catch (err) {
      console.error(`Failed to fetch survey ${id}:`, err);
      throw err;
    }
  },

  async updateMeasurements(id, measurements) {
    try {
      const response = await axiosInstance.put(`/v1/surveys/${id}/measurements`, measurements);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to update measurements for survey ${id}:`, err);
      throw err;
    }
  },

  async uploadPhoto(surveyId, file, caption) {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    try {
      const response = await axiosInstance.post(`/v1/surveys/${surveyId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to upload photo for survey ${surveyId}:`, err);
      throw err;
    }
  },

  async submitSurvey(id) {
    try {
      const response = await axiosInstance.post(`/v1/surveys/${id}/submit`);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`Failed to submit survey ${id}:`, err);
      throw err;
    }
  },
};

export default surveyAPI;
