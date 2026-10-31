/**
 * Validation rules for Site Surveys
 */

export const validateSurveyMeasurements = (data) => {
  const errors = {};

  if (!data.roof_area_sqft || Number(data.roof_area_sqft) <= 0) {
    errors.roof_area_sqft = 'Total roof area is required and must be greater than 0';
  }

  if (!data.shadow_free_area_sqft || Number(data.shadow_free_area_sqft) <= 0) {
    errors.shadow_free_area_sqft = 'Shadow-free area is required';
  } else if (Number(data.shadow_free_area_sqft) > Number(data.roof_area_sqft)) {
    errors.shadow_free_area_sqft = 'Shadow-free area cannot exceed total roof area';
  }

  if (data.roof_tilt_degrees !== undefined && data.roof_tilt_degrees !== '') {
    const tilt = Number(data.roof_tilt_degrees);
    if (isNaN(tilt) || tilt < 0 || tilt > 90) {
      errors.roof_tilt_degrees = 'Roof tilt must be between 0° and 90°';
    }
  }

  if (!data.cable_distance_meters || Number(data.cable_distance_meters) <= 0) {
    errors.cable_distance_meters = 'Estimated cabling distance is required';
  }

  if (!data.monthly_bill || Number(data.monthly_bill) < 0) {
    errors.monthly_bill = 'Average monthly bill is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSurveyPreSubmission = (survey, photos = []) => {
  const issues = [];

  if (!survey.roof_area_sqft || Number(survey.roof_area_sqft) <= 0) {
    issues.push('Technical roof measurements are incomplete.');
  }

  if (!survey.shadow_free_area_sqft) {
    issues.push('Shadow analysis is missing.');
  }

  if (!survey.cable_distance_meters) {
    issues.push('Cable run distance has not been estimated.');
  }

  if (!photos || photos.length < 2) {
    issues.push('At least 2 site photographs (Roof Overview & Electrical Panel) are required.');
  }

  return {
    canSubmit: issues.length === 0,
    issues,
  };
};
