import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

export const surveyAPI = {
  async getSurveys(params = {}) {
    if (useMock) {
      return storageService.getSurveys();
    }
    const response = await axiosInstance.get('/v1/sales/surveys', { params });
    return response.data;
  },

  async getSurveyById(id) {
    if (useMock) {
      const surveys = storageService.getSurveys();
      return surveys.find((s) => s.id === id) || null;
    }
    const response = await axiosInstance.get(`/v1/sales/surveys/${id}`);
    return response.data;
  },

  async scheduleSurvey(surveyData) {
    if (useMock) {
      return storageService.scheduleSurvey(surveyData);
    }
    const response = await axiosInstance.post('/v1/sales/surveys', surveyData);
    return response.data;
  },

  async updateSurvey(id, patch) {
    if (useMock) {
      return storageService.updateSurvey(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/surveys/${id}`, patch);
    return response.data;
  },

  async deleteSurvey(id) {
    if (useMock) {
      return storageService.deleteSurvey(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/surveys/${id}`);
    return response.data;
  },
};

export default surveyAPI;

