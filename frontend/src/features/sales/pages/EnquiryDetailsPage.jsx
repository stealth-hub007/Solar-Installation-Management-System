import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import storageService from '../../../services/storageService';
import formatDate from '../../../utils/formatDate';
import formatCurrency from '../../../utils/formatCurrency';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  ClipboardCheck,
  FileText,
  PhoneCall,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  SOLAR_PANEL_PRESETS,
  INVERTER_PRESETS,
} from '../utils/salesConstants';
import { calculateEstimatedSubsidy } from '../utils/salesHelpers';

export const EnquiryDetailsPage = () => {
  const { enquiryId } = useParams();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [successBanner, setSuccessBanner] = useState('');

  // In-place modals
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [isScheduleSurveyOpen, setIsScheduleSurveyOpen] = useState(false);
  const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState(false);

  // Modal forms
  const [followUpForm, setFollowUpForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:00 AM',
    type: 'Phone Call',
    priority: 'High',
    purpose: 'Discuss system feasibility, subsidy criteria and initial pricing',
  });

  const [surveyForm, setSurveyForm] = useState({
    surveyDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    surveyTime: '10:00 AM',
    surveyorName: 'Amit Meena (Field Engineer)',
    roofType: 'Flat RCC Concrete',
    shadowIssue: 'None',
  });

  const [quotationForm, setQuotationForm] = useState({
    systemCapacity: 10.0,
    panelModel: SOLAR_PANEL_PRESETS[0]?.name || 'Adani 540W Mono PERC',
    inverterModel: INVERTER_PRESETS[2]?.name || 'Growatt 10kW 3-Phase',
    panelCount: 20,
    structureCost: 38000,
    bosCost: 28000,
    installationCost: 35000,
    subsidy: 78000,
    discount: 10000,
    notes: '',
  });

  const loadData = () => {
    const list = storageService.getEnquiries();
    const found = list.find((e) => e.id === enquiryId);
    setEnquiry(found || null);

    if (found) {
      const allFollowUps = storageService.getFollowUps();
      setFollowUps(allFollowUps.filter((f) => f.enquiryId === found.id || f.customerName?.toLowerCase() === found.customerName?.toLowerCase()));

      const allSurveys = storageService.getSurveys();
      setSurveys(allSurveys.filter((s) => s.enquiryId === found.id || s.customerName?.toLowerCase() === found.customerName?.toLowerCase()));

      const allQuotations = storageService.getQuotations();
      setQuotations(allQuotations.filter((q) => q.enquiryId === found.id || q.customerName?.toLowerCase() === found.customerName?.toLowerCase()));

      // Initialize quotation form capacity from enquiry
      const numericCap = parseFloat(found.capacity) || 10.0;
      setQuotationForm((prev) => ({
        ...prev,
        systemCapacity: numericCap,
        panelCount: Math.ceil((numericCap * 1000) / 540),
        subsidy: calculateEstimatedSubsidy(numericCap, 'Residential'),
      }));
    }
  };

  useEffect(() => {
    loadData();
  }, [enquiryId]);

  const triggerSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // Submit Follow-up in place
  const handleAddFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!enquiry) return;

    storageService.createFollowUp({
      enquiryId: enquiry.id,
      customerName: enquiry.customerName,
      contact: enquiry.contactNumber || enquiry.contact,
      followUpDate: followUpForm.date,
      followUpTime: followUpForm.time,
      type: followUpForm.type,
      priority: followUpForm.priority,
      purpose: followUpForm.purpose,
      status: 'Pending',
      notes: `Scheduled from lead profile for enquiry ${enquiry.id}`,
    });

    loadData();
    setIsAddFollowUpOpen(false);
    triggerSuccess(`Follow-up scheduled for lead ${enquiry.id} on ${followUpForm.date}!`);
  };

  // Submit Survey in place
  const handleScheduleSurveySubmit = (e) => {
    e.preventDefault();
    if (!enquiry) return;

    storageService.createSurvey({
      enquiryId: enquiry.id,
      customerName: enquiry.customerName,
      contact: enquiry.contactNumber || enquiry.contact,
      surveyDate: surveyForm.surveyDate,
      surveyTime: surveyForm.surveyTime,
      address: enquiry.address || 'Site inspection location',
      roofType: surveyForm.roofType,
      shadowIssue: surveyForm.shadowIssue,
      surveyorName: surveyForm.surveyorName,
      status: 'Scheduled',
    });

    loadData();
    setIsScheduleSurveyOpen(false);
    triggerSuccess(`Site survey scheduled for ${enquiry.customerName} on ${surveyForm.surveyDate}!`);
  };

  // Submit Quotation in place
  const handleCreateQuotationSubmit = (e) => {
    e.preventDefault();
    if (!enquiry) return;

    const baseCost = Number(quotationForm.systemCapacity) * 35000;
    const subtotal =
      baseCost +
      Number(quotationForm.structureCost) +
      Number(quotationForm.bosCost) +
      Number(quotationForm.installationCost);
    const subsidy = Number(quotationForm.subsidy) || 0;
    const discount = Number(quotationForm.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - subsidy - discount);
    const gstAmount = Math.round(taxableAmount * 0.138);
    const finalAmount = taxableAmount + gstAmount;

    storageService.createQuotation({
      enquiryId: enquiry.id,
      customerName: enquiry.customerName,
      contact: enquiry.contactNumber || enquiry.contact,
      systemCapacity: Number(quotationForm.systemCapacity),
      panelModel: quotationForm.panelModel,
      inverterModel: quotationForm.inverterModel,
      panelCount: Number(quotationForm.panelCount),
      subtotal,
      subsidy,
      discount,
      gstAmount,
      finalAmount,
      status: 'Sent',
      notes: quotationForm.notes,
    });

    loadData();
    setIsCreateQuotationOpen(false);
    triggerSuccess(`Solar proposal created and linked to lead ${enquiry.id}!`);
  };

  if (!enquiry) {
    return (
      <PageContainer>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Enquiry lead not found</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/sales/enquiries')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Enquiries
          </Button>
        </div>
      </PageContainer>
    );
  }

  // Live calculation values for quotation modal
  const baseCostCalc = Number(quotationForm.systemCapacity || 10) * 35000;
  const subtotalCalc =
    baseCostCalc +
    Number(quotationForm.structureCost || 0) +
    Number(quotationForm.bosCost || 0) +
    Number(quotationForm.installationCost || 0);
  const subsidyCalc = Number(quotationForm.subsidy || 0);
  const discountCalc = Number(quotationForm.discount || 0);
  const taxableCalc = Math.max(0, subtotalCalc - subsidyCalc - discountCalc);
  const gstCalc = Math.round(taxableCalc * 0.138);
  const finalNetCalc = taxableCalc + gstCalc;

  return (
    <PageContainer>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/enquiries')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-600 shadow-xs"
            title="Return to enquiry pipeline"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {enquiry.customerName}
              </h1>
              <StatusBadge status={enquiry.enquiryStatus || enquiry.status || 'New'} />
            </div>
            <span className="font-mono text-xs text-[#0284C7] font-semibold">{enquiry.id}</span>
          </div>
        </div>

        {/* 3 IN-PLACE ACTION BUTTONS - STAY ON SAME PAGE */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddFollowUpOpen(true)}
            className="shadow-xs whitespace-nowrap"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Add Follow-up</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleSurveyOpen(true)}
            className="shadow-xs whitespace-nowrap"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Schedule Survey</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateQuotationOpen(true)}
            className="shadow-card whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Create Quotation</span>
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner('')}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Enquiry Spec Card */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0284C7]" /> Technical & Site Requirements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Proposed Solar Capacity</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                {enquiry.capacity || '10 kW Rooftop'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Lead Acquisition Channel</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {enquiry.enquirySource || 'Website Form'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Site Location / Address</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {enquiry.address || 'Jaipur, Rajasthan, India'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Initial Registration Date</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {formatDate(enquiry.createdDate)}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-medium block">Consumer Specific Notes & Instructions</span>
              <p className="font-medium text-slate-700 mt-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                {enquiry.notes || 'Client is interested in MNRE rooftop subsidy and requires a 3-phase net meter.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Customer Profile Tile */}
        <Card>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0284C7]" /> Client Profile
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Client Name</span>
              <span className="font-bold text-slate-900 text-sm">{enquiry.customerName}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Primary Contact</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#0284C7]" /> {enquiry.contactNumber || enquiry.contact || '+91 98290 12345'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Corporate Email</span>
              <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {enquiry.email || 'customer@gmail.com'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium block">Sales Territory Rep</span>
              <span className="font-semibold text-[#0284C7]">Sales Operations Division</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Linked Activities Grid: Follow-ups, Surveys, Quotations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Follow-ups */}
        <Card>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#0284C7]" /> Follow-ups ({followUps.length})
            </h4>
            <Button variant="outline" size="xs" onClick={() => setIsAddFollowUpOpen(true)}>
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>

          <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
            {followUps.length > 0 ? (
              followUps.map((f) => (
                <div key={f.id} className="py-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">{f.purpose}</span>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>{f.followUpDate} {f.followUpTime}</span>
                    <span>•</span>
                    <span className="text-[#0284C7] font-medium">{f.type}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No follow-ups recorded yet for this lead.</p>
            )}
          </div>
        </Card>

        {/* 2. Site Surveys */}
        <Card>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" /> Surveys ({surveys.length})
            </h4>
            <Button variant="outline" size="xs" onClick={() => setIsScheduleSurveyOpen(true)}>
              <Plus className="w-3 h-3 mr-1" /> Schedule
            </Button>
          </div>

          <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
            {surveys.length > 0 ? (
              surveys.map((s) => (
                <div key={s.id} className="py-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">{s.roofType || 'Site Survey'}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>{s.surveyDate || s.scheduledDate} {s.surveyTime || s.scheduledTime}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{s.surveyorName || 'Engineer'}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No site survey scheduled yet.</p>
            )}
          </div>
        </Card>

        {/* 3. Linked Quotations */}
        <Card>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0284C7]" /> Quotations ({quotations.length})
            </h4>
            <Button variant="primary" size="xs" onClick={() => setIsCreateQuotationOpen(true)}>
              <Plus className="w-3 h-3 mr-1" /> Create
            </Button>
          </div>

          <div className="divide-y divide-slate-100 text-xs max-h-72 overflow-y-auto">
            {quotations.length > 0 ? (
              quotations.map((q) => (
                <div key={q.id} className="py-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#0284C7] font-mono">{q.id}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="flex justify-between items-center text-slate-600 text-[11px]">
                    <span>{q.systemCapacity || q.capacity} kW System</span>
                    <span className="font-extrabold text-slate-900">{formatCurrency(q.finalAmount || q.netPayable)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No quotation generated yet.</p>
            )}
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 1: ADD FOLLOW-UP                                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddFollowUpOpen}
        onClose={() => setIsAddFollowUpOpen(false)}
        title={`Add Follow-up for Lead ${enquiry.id}`}
        size="md"
      >
        <form onSubmit={handleAddFollowUpSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Follow-up Date"
              type="date"
              required
              value={followUpForm.date}
              onChange={(e) => setFollowUpForm({ ...followUpForm, date: e.target.value })}
            />
            <Input
              label="Preferred Time"
              value={followUpForm.time}
              onChange={(e) => setFollowUpForm({ ...followUpForm, time: e.target.value })}
              placeholder="e.g. 11:30 AM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Contact Channel"
              value={followUpForm.type}
              onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
              options={['Phone Call', 'WhatsApp Discussion', 'In-Person Meeting', 'Site Visit']}
            />
            <Select
              label="Priority Level"
              value={followUpForm.priority}
              onChange={(e) => setFollowUpForm({ ...followUpForm, priority: e.target.value })}
              options={['Normal', 'High', 'Urgent']}
            />
          </div>

          <Input
            label="Call / Meeting Agenda"
            value={followUpForm.purpose}
            onChange={(e) => setFollowUpForm({ ...followUpForm, purpose: e.target.value })}
            placeholder="Discuss quotation details, financing, roof structure"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddFollowUpOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Follow-up (Stay Here)
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 2: SCHEDULE SURVEY                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isScheduleSurveyOpen}
        onClose={() => setIsScheduleSurveyOpen(false)}
        title={`Schedule Site Survey for Lead ${enquiry.id}`}
        size="md"
      >
        <form onSubmit={handleScheduleSurveySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Survey Date"
              type="date"
              required
              value={surveyForm.surveyDate}
              onChange={(e) => setSurveyForm({ ...surveyForm, surveyDate: e.target.value })}
            />
            <Input
              label="Arrival Time"
              value={surveyForm.surveyTime}
              onChange={(e) => setSurveyForm({ ...surveyForm, surveyTime: e.target.value })}
              placeholder="e.g. 10:00 AM"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Roof Structure Type"
              value={surveyForm.roofType}
              onChange={(e) => setSurveyForm({ ...surveyForm, roofType: e.target.value })}
              options={['Flat RCC Concrete', 'Sloped Metal Shed', 'Tiled Roof', 'Elevated Superstructure']}
            />
            <Input
              label="Assigned Surveyor"
              value={surveyForm.surveyorName}
              onChange={(e) => setSurveyForm({ ...surveyForm, surveyorName: e.target.value })}
            />
          </div>

          <Input
            label="Site Address"
            value={enquiry.address || 'Site inspection address'}
            disabled
            helperText="From lead record"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsScheduleSurveyOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Survey Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 3: CREATE QUOTATION                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCreateQuotationOpen}
        onClose={() => setIsCreateQuotationOpen(false)}
        title={`Create Solar Proposal & BOQ for ${enquiry.customerName}`}
        size="lg"
      >
        <form onSubmit={handleCreateQuotationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              value={enquiry.customerName}
              disabled
              helperText="Linked customer"
            />
            <Input
              label="Linked Enquiry Reference"
              value={enquiry.id}
              disabled
              helperText="Active enquiry"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="System Capacity (kW)"
              type="number"
              required
              min="1"
              suffix="kW"
              value={quotationForm.systemCapacity}
              onChange={(e) => {
                const cap = Number(e.target.value);
                const count = Math.ceil((cap * 1000) / 540);
                const estSubsidy = calculateEstimatedSubsidy(cap, 'Residential');
                setQuotationForm({
                  ...quotationForm,
                  systemCapacity: cap,
                  panelCount: count,
                  subsidy: estSubsidy,
                });
              }}
            />
            <Select
              label="Solar PV Module"
              value={quotationForm.panelModel}
              onChange={(e) => setQuotationForm({ ...quotationForm, panelModel: e.target.value })}
              options={SOLAR_PANEL_PRESETS.map((p) => p.name)}
            />
            <Select
              label="Solar Inverter"
              value={quotationForm.inverterModel}
              onChange={(e) => setQuotationForm({ ...quotationForm, inverterModel: e.target.value })}
              options={INVERTER_PRESETS.map((i) => i.name)}
            />
          </div>

          {/* Micro Grid with uniform baseline alignment */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <Input
              label="Panels Count"
              type="number"
              min="1"
              value={quotationForm.panelCount}
              onChange={(e) => setQuotationForm({ ...quotationForm, panelCount: Number(e.target.value) })}
            />
            <Input
              label="Structure Cost"
              type="number"
              prefix="₹"
              value={quotationForm.structureCost}
              onChange={(e) => setQuotationForm({ ...quotationForm, structureCost: Number(e.target.value) })}
            />
            <Input
              label="BOS & Wiring"
              type="number"
              prefix="₹"
              value={quotationForm.bosCost}
              onChange={(e) => setQuotationForm({ ...quotationForm, bosCost: Number(e.target.value) })}
            />
            <Input
              label="Installation"
              type="number"
              prefix="₹"
              value={quotationForm.installationCost}
              onChange={(e) => setQuotationForm({ ...quotationForm, installationCost: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Govt PM Surya Ghar Subsidy"
              type="number"
              prefix="₹"
              value={quotationForm.subsidy}
              onChange={(e) => setQuotationForm({ ...quotationForm, subsidy: Number(e.target.value) })}
              helperText="Residential: ₹78k for 3kW+"
            />
            <Input
              label="Special Discount"
              type="number"
              prefix="₹"
              value={quotationForm.discount}
              onChange={(e) => setQuotationForm({ ...quotationForm, discount: Number(e.target.value) })}
            />
          </div>

          {/* Live Calculation Summary */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#F0F7FF] to-white border border-[#BAE6FD] text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">Subtotal Components:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(subtotalCalc)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-emerald-600 font-semibold">Government MNRE Subsidy:</span>
              <span className="font-bold text-emerald-600">- {formatCurrency(subsidyCalc)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">GST Tax (13.8% Composite):</span>
              <span className="font-semibold text-slate-800">+ {formatCurrency(gstCalc)}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-extrabold text-[#0284C7]">
              <span>Final Net Payable:</span>
              <span>{formatCurrency(finalNetCalc)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateQuotationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate & Save Quotation (Stay Here)
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default EnquiryDetailsPage;
