import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

// Normalise a single survey object from backend to the shape Sales pages expect
const normaliseSurvey = (s) => ({
  ...s,
  id: s.rawId || s.id,
  displayId: s.id || s.survey_number || `SRV-${(s.rawId || s.id || '').slice(0, 8).toUpperCase()}`,
  customerName: s.customerName || s.customer_name || 'Solar Customer',
  contact: s.contact || '+91 98290 12345',
  siteLocation: s.siteLocation || s.site_address || s.siteAddress || 'Jaipur, Rajasthan',
  assignedSurveyor: s.assignedSurveyor || s.technician_name || 'Vikram Singh',
  status: s.status || (s.survey_status ? s.survey_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Scheduled'),
  approvalStatus: s.approvalStatus || (s.approval_status ? s.approval_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Pending Approval'),
  scheduledDate: s.scheduledDate || (s.scheduled_date ? s.scheduled_date.split('T')[0] : ''),
  scheduledTime: s.scheduledTime || '10:30 AM',
  roofType: s.roofType || s.roof_orientation || 'RCC Flat Roof',
  notes: s.notes || s.technician_remarks || '',
});

export const surveyAPI = {
  async getTechnicians() {
    if (useMock) {
      return [
        'Kailash Chand (Field Tech)',
        'Manoj Saini (Sr. Surveyor)',
        'Dinesh Kumar (Field Tech)',
        'Sunil Sharma (Survey Engineer)',
      ].map((name) => ({ id: name, name }));
    }
    const response = await axiosInstance.get('/v1/sales/technicians');
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  async getSurveys(params = {}) {
    if (useMock) {
      return storageService.getSurveys();
    }
    const response = await axiosInstance.get('/v1/sales/surveys', { params });
    const raw = Array.isArray(response.data) ? response.data : (response.data?.items || response.data?.data || []);
    return raw.map(normaliseSurvey);
  },

  async getSurveyById(id) {
    if (useMock) {
      const surveys = storageService.getSurveys();
      return surveys.find((s) => s.id === id) || null;
    }
    const response = await axiosInstance.get(`/v1/sales/surveys/${id}`);
    const s = response.data?.data || response.data;
    return s ? normaliseSurvey(s) : null;
  },

  async scheduleSurvey(surveyData) {
    if (useMock) {
      const selectedTechnician = (await this.getTechnicians())
        .find((technician) => technician.id === surveyData.assignedTechnicianId);
      return storageService.scheduleSurvey({
        ...surveyData,
        assignedSurveyor: selectedTechnician?.name || '',
      });
    }
    const response = await axiosInstance.post('/v1/sales/surveys', surveyData);
    const s = response.data?.data || response.data;
    return s ? normaliseSurvey(s) : s;
  },

  async updateSurvey(id, patch) {
    if (useMock) {
      return storageService.updateSurvey(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/surveys/${id}`, patch);
    const s = response.data?.data || response.data;
    return s ? normaliseSurvey(s) : s;
  },

  async deleteSurvey(id) {
    if (useMock) {
      return storageService.deleteSurvey(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/surveys/${id}`);
    return response.data?.data || response.data;
  },
};

export default surveyAPI;
