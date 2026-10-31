import React, { useState } from 'react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';
import { Ruler, Compass, Zap, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ROOF_ORIENTATIONS, ROOF_TYPES } from '../../utils/technicianConstants';
import { validateSurveyMeasurements } from '../../utils/surveyValidators';
import { calculateShadowFreeAreaPercent } from '../../utils/technicianHelpers';

export const SiteMeasurementForm = ({ survey, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    roof_area_sqft: survey.roof_area_sqft || 850,
    shadow_free_area_sqft: survey.shadow_free_area_sqft || 750,
    roof_orientation: survey.roof_orientation || 'SOUTH',
    roof_tilt_degrees: survey.roof_tilt_degrees || 15,
    monthly_bill: survey.monthly_bill || 8500,
    cable_distance_meters: survey.cable_distance_meters || 18,
    grid_connection_suitable: survey.grid_connection_suitable ?? true,
    technician_remarks: survey.technician_remarks || '',
  });

  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  const shadowFreePercent = calculateShadowFreeAreaPercent(
    formData.roof_area_sqft,
    formData.shadow_free_area_sqft
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSaveSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateSurveyMeasurements(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    if (onSave) {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Technical Roof Measurements & Shadow Analysis"
        subtitle="Record precision area measurements, orientation azimuth, and cabling requirements"
        icon={Ruler}
      />

      <form onSubmit={handleSubmit} className="p-5 space-y-6">
        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Measurements successfully saved and synchronized.</span>
          </div>
        )}

        {/* 1. Area Measurements */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Rooftop Dimensions</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Usable Roof Area (sq. ft) *
              </label>
              <input
                type="number"
                name="roof_area_sqft"
                value={formData.roof_area_sqft}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="e.g. 850"
              />
              {errors.roof_area_sqft && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.roof_area_sqft}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shadow-Free Area (sq. ft) *
              </label>
              <input
                type="number"
                name="shadow_free_area_sqft"
                value={formData.shadow_free_area_sqft}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="e.g. 750"
              />
              {errors.shadow_free_area_sqft && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.shadow_free_area_sqft}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solar Usability Rating
              </label>
              <div className="h-10 px-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">{shadowFreePercent}% Shadow Free</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${shadowFreePercent >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {shadowFreePercent >= 80 ? 'Optimal' : 'Moderate'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Orientation & Azimuth */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Orientation & Azimuth</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roof Orientation Azimuth *
              </label>
              <select
                name="roof_orientation"
                value={formData.roof_orientation}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              >
                {ROOF_ORIENTATIONS.map((ori) => (
                  <option key={ori.value} value={ori.value}>
                    {ori.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Roof Tilt Angle (Degrees 0° - 90°)
              </label>
              <input
                type="number"
                name="roof_tilt_degrees"
                value={formData.roof_tilt_degrees}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="Recommended: 15° for Rajasthan"
              />
              {errors.roof_tilt_degrees && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.roof_tilt_degrees}</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Electrical Infrastructure */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Electrical Infrastructure & Grid Sync</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cable Routing Distance to Inverter/LT Board (Meters) *
              </label>
              <input
                type="number"
                name="cable_distance_meters"
                value={formData.cable_distance_meters}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="e.g. 18"
              />
              {errors.cable_distance_meters && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.cable_distance_meters}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Average Monthly Electricity Bill (₹) *
              </label>
              <input
                type="number"
                name="monthly_bill"
                value={formData.monthly_bill}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                placeholder="e.g. 8500"
              />
              {errors.monthly_bill && (
                <span className="text-[11px] text-rose-600 mt-1 block">{errors.monthly_bill}</span>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="grid_connection_suitable"
              name="grid_connection_suitable"
              checked={formData.grid_connection_suitable}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#0284C7] focus:ring-[#0284C7]"
            />
            <label htmlFor="grid_connection_suitable" className="text-xs text-slate-700 font-medium">
              DISCOM 3-Phase Net Metering grid connection verified and suitable
            </label>
          </div>
        </div>

        {/* 4. Technician Remarks */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Technical Observations & Parapet Obstacles
          </label>
          <textarea
            name="technician_remarks"
            value={formData.technician_remarks}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            placeholder="Record water tank height, stairwell shadows, structural stability, or chemical anchoring notes..."
          />
        </div>

        {/* Submit / Save Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={isSaving}>
            Save Measurements
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default SiteMeasurementForm;

