import storageService from '../../../services/storageService';

/**
 * Smart navigator that routes to the lead enquiry details view (e.g. /sales/enquiries/ENQ-4414)
 * regardless of which tab the user is currently on (Orders, Quotations, Surveys, Follow-ups, Customers).
 * 
 * @param {Function} navigate React Router navigate function
 * @param {Object} item Object containing enquiryId, customerName, name, or customerId
 */
export const openLeadEnquiry = (navigate, item = {}) => {
  if (!navigate) return;

  // Direct enquiry ID
  if (item.enquiryId && String(item.enquiryId).startsWith('ENQ-')) {
    navigate(`/sales/enquiries/${item.enquiryId}`);
    return;
  }

  if (item.id && String(item.id).startsWith('ENQ-')) {
    navigate(`/sales/enquiries/${item.id}`);
    return;
  }

  const customerName = (item.customerName || item.name || '').trim();
  const customerId = item.customerId || '';

  // Look up lead enquiry by customer name or ID in local storage
  try {
    const enquiries = storageService.getEnquiries() || [];

    if (customerName) {
      const matchByName = enquiries.find(
        (e) => (e.customerName || e.name || '').trim().toLowerCase() === customerName.toLowerCase()
      );
      if (matchByName?.id) {
        navigate(`/sales/enquiries/${matchByName.id}`);
        return;
      }
    }

    if (customerId) {
      const matchByCustomerId = enquiries.find((e) => e.customerId === customerId);
      if (matchByCustomerId?.id) {
        navigate(`/sales/enquiries/${matchByCustomerId.id}`);
        return;
      }
    }

    if (item.quotationId) {
      const quotations = storageService.getQuotations() || [];
      const matchQuo = quotations.find((q) => q.id === item.quotationId);
      if (matchQuo?.enquiryId) {
        navigate(`/sales/enquiries/${matchQuo.enquiryId}`);
        return;
      }
    }
  } catch (err) {
    console.error('Error finding linked enquiry:', err);
  }

  // If customer has a customer profile ID
  if (customerId && String(customerId).startsWith('CUST-')) {
    navigate(`/sales/customers/${customerId}`);
    return;
  }

  // Fallback to enquiries list
  navigate(`/sales/enquiries`);
};

export default openLeadEnquiry;

