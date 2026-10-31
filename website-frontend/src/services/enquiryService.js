import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const enquiryService = {
  /**
   * Submit a public solar installation enquiry
   * @param {Object} formData
   */
  async submitEnquiry(formData) {
    const payload = {
      full_name: formData.fullName?.trim(),
      phone: formData.phone?.trim(),
      email: formData.email?.trim().toLowerCase(),
      city: formData.city?.trim(),
      property_type: formData.propertyType || 'Residential',
      interested_service: formData.interestedService || 'Residential Solar Installation',
      property_address: formData.propertyAddress?.trim() || null,
      required_solar_capacity: formData.requiredSolarCapacity || '3kW',
      message: formData.message?.trim(),
      consent: Boolean(formData.consent),
      honeypot: formData.website_hp || null,
    };

    const response = await api.post('/v1/enquiries/public', payload);
    return response.data;
  },
};

export default enquiryService;

