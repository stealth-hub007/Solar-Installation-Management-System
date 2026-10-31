import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import enquiryService from '../../services/enquiryService';

export const ContactForm = ({ defaultService = 'Residential Solar Installation' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    propertyType: 'Residential',
    interestedService: defaultService,
    propertyAddress: '',
    requiredSolarCapacity: '3kW',
    message: '',
    consent: true,
    website_hp: '', // Bot honeypot (should stay empty)
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const propertyTypes = [
    { value: 'Residential', label: 'Residential (Home / Villa / Apartment)' },
    { value: 'Commercial', label: 'Commercial (Office / Hotel / Hospital)' },
    { value: 'Industrial', label: 'Industrial (Factory / Warehouse / Plant)' },
    { value: 'Other', label: 'Other (Agricultural / Institutional)' },
  ];

  const serviceOptions = [
    'Residential Solar Installation',
    'Commercial Solar Net-Metering',
    'Industrial Solar Power Plant',
    'Off-Grid & Battery Backup System',
    'Solar Panel Maintenance & AMC',
  ];

  const capacityOptions = [
    { value: '1kW', label: '1 kW (Small Home / 2-3 Fans & Lights)' },
    { value: '2kW', label: '2 kW (Medium Home / Fridge + Fans)' },
    { value: '3kW', label: '3 kW (Standard Home / 1 AC + Household)' },
    { value: '5kW', label: '5 kW (Large Villa / 2 ACs + Full Load)' },
    { value: '10kW', label: '10 kW (Commercial / High Monthly Bill)' },
    { value: '25kW+', label: '25 kW+ (Commercial & Industrial Plant)' },
    { value: 'Not sure', label: 'Not sure (Need Engineer Assessment)' },
  ];

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(cleanPhone) && !/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.city.trim()) {
      errs.city = 'City / Location is required';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please provide details about your solar requirements';
    } else if (formData.message.trim().length < 5) {
      errs.message = 'Message must be at least 5 characters';
    }

    if (!formData.consent) {
      errs.consent = 'You must give consent to be contacted regarding this enquiry';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await enquiryService.submitEnquiry(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        propertyType: 'Residential',
        interestedService: defaultService,
        propertyAddress: '',
        requiredSolarCapacity: '3kW',
        message: '',
        consent: true,
        website_hp: '',
      });
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Unable to connect to the solar enquiry server. Please check your network and try again.';
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-card p-6 sm:p-8 lg:p-10 relative overflow-hidden">
      {/* Subtle top brand gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#0369A1]" />

      {submitSuccess ? (
        <div className="py-10 text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Installation Request Received!
          </h3>
          <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Thank you! Your installation request has been submitted successfully. Our Sales team has received your request and will contact you as soon as possible.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => setSubmitSuccess(false)}
              className="px-6 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold shadow-xs transition"
            >
              Submit Another Request
            </button>
            <a
              href="tel:+919829012345"
              className="px-6 py-2.5 rounded-xl border border-sky-200 bg-[#F0F9FF] text-[#0284C7] text-xs font-semibold hover:bg-sky-100 transition"
            >
              Call Us Directly: +91 98290 12345
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="border-b border-sky-100/80 pb-4 mb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
              <Sparkles className="w-4 h-4" />
              <span>Get Free Site Survey & Feasibility Report</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Request Your Solar Quotation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the details below. Our solar EPC engineers will design a customized proposal with subsidy benefits.
            </p>
          </div>

          {submitError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Honeypot field (hidden from legitimate users) */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website_hp}
              onChange={handleChange}
            />
          </div>

          {/* Row 1: Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="e.g. Ramesh Kumar"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 transition ${
                  errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#0284C7]'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="e.g. 9829012345"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 transition ${
                  errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#0284C7]'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 2: Email & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="e.g. ramesh.kumar@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 transition ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#0284C7]'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                City / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Jaipur, Rajasthan"
                value={formData.city}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 transition ${
                  errors.city ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#0284C7]'
                }`}
              />
              {errors.city && <p className="text-[11px] text-rose-500 mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* Row 3: Property Type & Interested Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Property Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition"
              >
                {propertyTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Interested Solar Service <span className="text-rose-500">*</span>
              </label>
              <select
                name="interestedService"
                value={formData.interestedService}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition"
              >
                {serviceOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Required Solar Capacity & Property Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Approximate Solar Capacity Needed
              </label>
              <select
                name="requiredSolarCapacity"
                value={formData.requiredSolarCapacity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition"
              >
                {capacityOptions.map((cap) => (
                  <option key={cap.value} value={cap.value}>{cap.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Property Address (Optional)
              </label>
              <input
                type="text"
                name="propertyAddress"
                placeholder="e.g. Plot 42, Civil Lines"
                value={formData.propertyAddress}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition"
              />
            </div>
          </div>

          {/* Row 5: Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Requirements / Monthly Electricity Bill <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="message"
              rows={3}
              placeholder="Tell us about your rooftop area, current monthly power bill, or specific requirements..."
              value={formData.message}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-[#0284C7]/20 transition ${
                errors.message ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-[#0284C7]'
              }`}
            />
            {errors.message && <p className="text-[11px] text-rose-500 mt-1">{errors.message}</p>}
          </div>

          {/* Row 6: Consent Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded text-[#0284C7] focus:ring-[#0284C7] border-slate-300"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I authorize SunPower Solutions to contact me via phone, email, or WhatsApp regarding this solar feasibility request.
              </span>
            </label>
            {errors.consent && <p className="text-[11px] text-rose-500 mt-1">{errors.consent}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-sm shadow-sm hover:shadow transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Solar Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Installation Enquiry</span>
                </>
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Zero-obligation inquiry • 100% data confidentiality</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactForm;

