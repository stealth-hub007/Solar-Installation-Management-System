/**
 * Sales Form Validation Utilities
 * Validates inputs client-side before submission
 */

export const validateCustomerForm = (formData) => {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Customer name is required';
  } else if (formData.name.trim().length < 3) {
    errors.name = 'Customer name must be at least 3 characters';
  }

  if (!formData.phone || !formData.phone.trim()) {
    errors.phone = 'Contact phone number is required';
  } else {
    // Check Indian mobile format: digits, length >= 10
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
  }

  if (formData.email && formData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
  }

  if (!formData.city || !formData.city.trim()) {
    errors.city = 'City/Location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateEnquiryForm = (formData) => {
  const errors = {};

  if (!formData.customerName || !formData.customerName.trim()) {
    errors.customerName = 'Customer / Business name is required';
  }

  if (!formData.contactNumber || !formData.contactNumber.trim()) {
    errors.contactNumber = 'Contact phone number is required';
  } else {
    const cleanPhone = formData.contactNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      errors.contactNumber = 'Enter a valid 10-digit phone number';
    }
  }

  if (!formData.capacity || Number(formData.capacity) <= 0) {
    errors.capacity = 'Solar capacity must be greater than 0 kW';
  }

  if (!formData.location || !formData.location.trim()) {
    errors.location = 'Site address / city is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFollowUpForm = (formData) => {
  const errors = {};

  if (!formData.customerName || !formData.customerName.trim()) {
    errors.customerName = 'Customer is required';
  }

  if (!formData.followUpDate) {
    errors.followUpDate = 'Follow-up date is required';
  }

  if (!formData.purpose || !formData.purpose.trim()) {
    errors.purpose = 'Follow-up objective / purpose is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSurveyForm = (formData) => {
  const errors = {};

  if (!formData.customerName || !formData.customerName.trim()) {
    errors.customerName = 'Customer is required';
  }

  if (!formData.siteLocation || !formData.siteLocation.trim()) {
    errors.siteLocation = 'Site location is required';
  }

  if (!formData.scheduledDate) {
    errors.scheduledDate = 'Survey date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateQuotationForm = (formData) => {
  const errors = {};

  if (!formData.customerName || !formData.customerName.trim()) {
    errors.customerName = 'Customer is required';
  }

  if (!formData.systemCapacity || Number(formData.systemCapacity) <= 0) {
    errors.systemCapacity = 'System capacity must be greater than 0 kW';
  }

  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one line item is required in the quotation';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

