import axiosInstance from '../../../services/axiosInstance';
import storageService from '../../../services/storageService';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

const normalizeQuotation = (quotation) => ({
  ...quotation,
  displayId: quotation.quotation_number || quotation.id,
  customerId: quotation.customer_id || quotation.customerId,
  customerName: quotation.customer_name || quotation.customerName || 'Customer',
  systemCapacity: quotation.system_capacity || quotation.systemCapacity || quotation.capacity,
  subtotal: Number(quotation.subtotal ?? quotation.totalCost ?? 0),
  discount: Number(quotation.discount ?? 0),
  taxAmount: Number(quotation.tax_amount ?? quotation.taxAmount ?? 0),
  finalAmount: Number(quotation.final_amount ?? quotation.finalAmount ?? quotation.netPayable ?? 0),
  createdDate: quotation.quotation_date || quotation.created_at || quotation.createdDate,
  expiryDate: quotation.valid_until || quotation.expiryDate,
  status: String(quotation.status || 'DRAFT').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
  items: (quotation.items || []).map((item) => ({
    ...item,
    name: item.product_name_snapshot || item.name,
    unitPrice: Number(item.unit_price_snapshot ?? item.unitPrice ?? 0),
    lineTotal: Number(item.total_price ?? item.lineTotal ?? 0),
  })),
});

export const quotationAPI = {
  async getQuotations(params = {}) {
    if (useMock) {
      return storageService.getQuotations();
    }
    const response = await axiosInstance.get('/v1/quotations', { params });
    const raw = response.data?.data?.items || response.data?.data || [];
    return Array.isArray(raw) ? raw.map(normalizeQuotation) : [];
  },

  async getQuotationById(id) {
    if (useMock) {
      return storageService.getQuotationById(id);
    }
    const response = await axiosInstance.get(`/v1/quotations/${id}`);
    const quotation = response.data?.data || response.data;
    return quotation ? normalizeQuotation(quotation) : null;
  },

  async createQuotation(quotationData) {
    if (useMock) {
      return storageService.createQuotation(quotationData);
    }
    let surveyId = quotationData.surveyId || quotationData.survey_id;
    if (!surveyId) {
      const surveysResponse = await axiosInstance.get('/v1/surveys', {
        params: { page: 1, size: 100 },
      });
      const surveyData = surveysResponse.data?.data?.items || [];
      const targetEnquiryId = String(quotationData.enquiryId || quotationData.enquiry_id || '');
      const approvedSurvey = surveyData.find((survey) => (
        survey.approval_status === 'APPROVED' &&
        (String(survey.enquiry_id) === targetEnquiryId ||
          String(survey.enquiry_id).startsWith(targetEnquiryId.replace(/^ENQ-/i, '')))
      ));
      surveyId = approvedSurvey?.id;
    }
    if (!surveyId) {
      throw new Error('An approved site survey is required before generating a quotation.');
    }
    const response = await axiosInstance.post('/v1/quotations', {
      survey_id: surveyId,
      discount: Number(quotationData.discount || 0),
      terms_conditions: quotationData.notes || undefined,
    });
    return normalizeQuotation(response.data?.data || response.data);
  },

  async updateQuotation(id, patch) {
    if (useMock) {
      return storageService.updateQuotation(id, patch);
    }
    const response = await axiosInstance.put(`/v1/sales/quotations/${id}`, patch);
    return response.data?.data || response.data;
  },

  async submitQuotation(id) {
    if (useMock) {
      return storageService.updateQuotation(id, { approvalStatus: 'Pending', status: 'Submitted' });
    }
    const response = await axiosInstance.post(`/v1/sales/quotations/${id}/submit`);
    return response.data?.data || response.data;
  },

  async approveQuotation(id) {
    if (useMock) {
      return storageService.approveQuotation(id);
    }
    const response = await axiosInstance.post(`/v1/sales/quotations/${id}/approve`);
    return response.data?.data || response.data;
  },

  async acceptQuotation(id, convertToOrder = true) {
    if (useMock) {
      return storageService.acceptQuotation(id, convertToOrder);
    }
    const response = await axiosInstance.post(`/v1/quotations/${id}/accept`);
    return normalizeQuotation(response.data?.data || response.data);
  },

  async convertQuotationToOrder(id, expectedInstallationDate) {
    if (useMock) {
      throw new Error('Order conversion is available only when connected to the backend.');
    }
    const response = await axiosInstance.post('/v1/orders/convert', {
      quotation_id: id,
      expected_installation_date: expectedInstallationDate || undefined,
    });
    return response.data?.data || response.data;
  },

  async deleteQuotation(id) {
    if (useMock) {
      return storageService.deleteQuotation(id);
    }
    const response = await axiosInstance.delete(`/v1/sales/quotations/${id}`);
    return response.data?.data || response.data;
  },
};

export default quotationAPI;
