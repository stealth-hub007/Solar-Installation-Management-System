import axiosInstance from '../../../services/axiosInstance';

export const surveyAPI = {
  async getAssignedSurveys(params = {}) {
    try {
      const pageSize = 100;
      const firstResponse = await axiosInstance.get('/v1/surveys', {
        params: { ...params, page: 1, size: pageSize },
      });
      const firstPage = firstResponse.data?.data;
      const items = Array.isArray(firstPage?.items)
        ? [...firstPage.items]
        : Array.isArray(firstPage)
          ? [...firstPage]
          : Array.isArray(firstResponse.data)
            ? [...firstResponse.data]
            : [];
      const totalPages = firstPage?.total_pages
        ?? firstPage?.totalPages
        ?? Math.ceil((firstPage?.total ?? items.length) / pageSize);

      for (let page = 2; page <= totalPages; page += 1) {
        const response = await axiosInstance.get('/v1/surveys', {
          params: { ...params, page, size: pageSize },
        });
        const pageItems = response.data?.data?.items;
        if (!Array.isArray(pageItems)) {
          throw new Error(`Invalid survey response received for page ${page}`);
        }
        items.push(...pageItems);
      }

      return items.map((s) => ({
        ...s,
        id: s.id,
        rawId: s.id,
        displayId: s.displayId || s.survey_number || `SRV-${s.id.slice(0, 8).toUpperCase()}`,
        // Customer fields — backend now populates these
        customerName: s.customer_name || s.customerName || 'Solar Customer',
        contact: s.contact || '+91 98290 12345',
        siteAddress: s.site_address || s.siteAddress || 'Jaipur, Rajasthan',
        assignedSurveyor: s.technician_name || s.assignedSurveyor || 'Vikram Singh',
        // Status normalisation
        status: s.survey_status
          ? s.survey_status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
          : 'Scheduled',
        approvalStatus: s.approval_status ? s.approval_status.replace(/_/g, ' ') : 'Pending Approval',
        // Schedule
        scheduledDate: s.scheduled_date ? s.scheduled_date.split('T')[0] : s.scheduledDate,
        scheduledTime: s.scheduledTime || (s.scheduled_date ? new Date(s.scheduled_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '10:30 AM'),
        // Technical fields
        priority: s.monthly_bill && Number(s.monthly_bill) > 10000 ? 'High' : 'Normal',
        roofType: s.roofType || s.roof_orientation || 'RCC Flat Roof',
        proposedCapacity: s.proposedCapacity || '5.0 kW',
        enquiryId: s.enquiry_id || s.enquiryId || '',
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
        displayId: s.displayId || s.survey_number || `SRV-${s.id.slice(0, 8).toUpperCase()}`,
        customerName: s.customer_name || s.customerName || 'Solar Customer',
        contact: s.contact || '+91 98290 12345',
        siteAddress: s.site_address || s.siteAddress || 'Jaipur, Rajasthan',
        assignedSurveyor: s.technician_name || s.assignedSurveyor || 'Vikram Singh',
        status: s.survey_status
          ? s.survey_status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
          : 'Scheduled',
        approvalStatus: s.approval_status ? s.approval_status.replace(/_/g, ' ') : 'Pending Approval',
        scheduledDate: s.scheduled_date ? s.scheduled_date.split('T')[0] : s.scheduledDate,
        scheduledTime: s.scheduledTime || '10:30 AM',
        roofType: s.roofType || s.roof_orientation || 'RCC Flat Roof',
        proposedCapacity: s.proposedCapacity || '5.0 kW',
        enquiryId: s.enquiry_id || s.enquiryId || '',
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
