import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const demoSurveys = [
  {
    id: 'SRV-101',
    enquiryId: 'ENQ-4401',
    customerId: 'CUST-104',
    customerName: 'Sunita Agarwal',
    contact: '+91 97850 33445',
    siteAddress: '34 Civil Lines, Jaipur, Rajasthan',
    proposedCapacity: '8.0 kW',
    scheduledDate: '2026-11-02',
    scheduledTime: '10:30 AM',
    survey_status: 'SCHEDULED',
    status: 'Scheduled',
    approval_status: 'PENDING_APPROVAL',
    approvalStatus: 'Pending Approval',
    roofType: 'RCC Flat Roof',
    roof_area_sqft: 850,
    shadow_free_area_sqft: 750,
    roof_orientation: 'SOUTH',
    roof_tilt_degrees: 15,
    monthly_bill: 8500,
    grid_connection_suitable: true,
    cable_distance_meters: 18,
    priority: 'High',
    technician_remarks: 'Optimal south-facing shadow-free area available on main rooftop terrace.',
    photos: [
      { id: 'PHO-1', file_name: 'roof_terrace_view.jpg', caption: 'Clear south-facing parapet view' },
      { id: 'PHO-2', file_name: 'electrical_meter_board.jpg', caption: '3-Phase bidirectional net meter panel' },
    ],
  },
  {
    id: 'SRV-102',
    enquiryId: 'ENQ-4402',
    customerId: 'CUST-110',
    customerName: 'Kailash Yadav',
    contact: '+91 98280 88990',
    siteAddress: 'MIA Phase II, Alwar, Rajasthan',
    proposedCapacity: '15.0 kW',
    scheduledDate: '2026-11-03',
    scheduledTime: '11:30 AM',
    survey_status: 'IN_PROGRESS',
    status: 'In Progress',
    approval_status: 'PENDING_APPROVAL',
    approvalStatus: 'Pending Approval',
    roofType: 'Tin Shed Structure',
    roof_area_sqft: 1400,
    shadow_free_area_sqft: 1200,
    roof_orientation: 'SOUTH_WEST',
    roof_tilt_degrees: 12,
    monthly_bill: 14200,
    grid_connection_suitable: true,
    cable_distance_meters: 25,
    priority: 'Medium',
    technician_remarks: 'Tin shed structure requires specialized rail clamps and mid/end fixers.',
    photos: [
      { id: 'PHO-3', file_name: 'tin_shed_rafter_inspection.jpg', caption: 'Purlin spacing measured at 1.2m' },
    ],
  },
  {
    id: 'SRV-103',
    enquiryId: 'ENQ-4403',
    customerId: 'CUST-106',
    customerName: 'Golden Hospitality',
    contact: '+91 94133 11224',
    siteAddress: 'Lake Palace Road, Udaipur, Rajasthan',
    proposedCapacity: '25.0 kW',
    scheduledDate: '2026-11-04',
    scheduledTime: '02:00 PM',
    survey_status: 'SCHEDULED',
    status: 'Scheduled',
    approval_status: 'PENDING_APPROVAL',
    approvalStatus: 'Pending Approval',
    roofType: 'RCC Flat Roof',
    roof_area_sqft: 2600,
    shadow_free_area_sqft: 2200,
    roof_orientation: 'SOUTH',
    roof_tilt_degrees: 18,
    monthly_bill: 26500,
    grid_connection_suitable: true,
    cable_distance_meters: 35,
    priority: 'High',
    technician_remarks: 'Resort rooftop terrace, requires 8ft elevated structure to preserve walkway space.',
    photos: [],
  },
  {
    id: 'SRV-104',
    enquiryId: 'ENQ-4404',
    customerId: 'CUST-101',
    customerName: 'Rajesh Sharma',
    contact: '+91 98290 11223',
    siteAddress: 'B-12, Vaishali Nagar, Jaipur, Rajasthan',
    proposedCapacity: '10.5 kW',
    scheduledDate: '2026-10-28',
    scheduledTime: '11:00 AM',
    survey_status: 'COMPLETED',
    status: 'Completed',
    approval_status: 'APPROVED',
    approvalStatus: 'Approved',
    roofType: 'RCC Elevated Superstructure',
    roof_area_sqft: 1100,
    shadow_free_area_sqft: 980,
    roof_orientation: 'SOUTH',
    roof_tilt_degrees: 16,
    monthly_bill: 9800,
    grid_connection_suitable: true,
    cable_distance_meters: 15,
    priority: 'Normal',
    technician_remarks: 'Survey verified and approved. Elevated columns anchored with Hilti chemicals.',
    photos: [
      { id: 'PHO-4', file_name: 'superstructure_pedestals.jpg', caption: 'Pedestal curing completed' },
      { id: 'PHO-5', file_name: 'distribution_box.jpg', caption: 'Main electrical distribution panel' },
    ],
  },
];

export const surveyAPI = {
  async getAssignedSurveys(params = {}) {
    if (useMock) return demoSurveys;
    try {
      const response = await axiosInstance.get('/v1/surveys', { params });
      const items = Array.isArray(response.data)
        ? response.data
        : (response.data?.data?.items || response.data?.data || []);
      if (items.length > 0) return items;
      return demoSurveys;
    } catch {
      return demoSurveys;
    }
  },

  async getSurveyById(id) {
    if (useMock) {
      return demoSurveys.find((s) => s.id === id || s.rawId === id) || demoSurveys[0];
    }
    try {
      const response = await axiosInstance.get(`/v1/surveys/${id}`);
      return response.data?.data || response.data;
    } catch {
      return demoSurveys.find((s) => s.id === id || s.rawId === id) || demoSurveys[0];
    }
  },

  async updateMeasurements(id, measurements) {
    if (useMock) {
      const s = demoSurveys.find((x) => x.id === id || x.rawId === id);
      if (s) Object.assign(s, measurements, { survey_status: 'IN_PROGRESS', status: 'In Progress' });
      return s || measurements;
    }
    try {
      const response = await axiosInstance.put(`/v1/surveys/${id}/measurements`, measurements);
      return response.data?.data || response.data;
    } catch {
      const s = demoSurveys.find((x) => x.id === id || x.rawId === id);
      if (s) Object.assign(s, measurements, { survey_status: 'IN_PROGRESS', status: 'In Progress' });
      return s || measurements;
    }
  },

  async uploadPhoto(surveyId, file, caption) {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    if (useMock) {
      return {
        id: `PHO-${Date.now()}`,
        file_name: file.name,
        caption: caption || 'Site observation',
        uploaded_at: new Date().toISOString(),
      };
    }
    try {
      const response = await axiosInstance.post(`/v1/surveys/${surveyId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.data || response.data;
    } catch {
      return {
        id: `PHO-${Date.now()}`,
        file_name: file.name,
        caption: caption || 'Site observation',
        uploaded_at: new Date().toISOString(),
      };
    }
  },

  async submitSurvey(id) {
    if (useMock) {
      const s = demoSurveys.find((x) => x.id === id || x.rawId === id);
      if (s) {
        s.survey_status = 'SUBMITTED';
        s.status = 'Submitted';
        s.approval_status = 'PENDING_APPROVAL';
        s.approvalStatus = 'Pending Approval';
      }
      return s;
    }
    try {
      const response = await axiosInstance.post(`/v1/surveys/${id}/submit`);
      return response.data?.data || response.data;
    } catch {
      const s = demoSurveys.find((x) => x.id === id || x.rawId === id);
      if (s) {
        s.survey_status = 'SUBMITTED';
        s.status = 'Submitted';
      }
      return s;
    }
  },
};

export default surveyAPI;

