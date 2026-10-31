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
import formatCurrency from '../../../utils/formatCurrency';
import formatDate from '../../../utils/formatDate';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Zap,
  FileText,
  ShoppingCart,
  MessageSquare,
  Plus,
  ShieldCheck,
  PhoneCall,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  SOLAR_PANEL_PRESETS,
  INVERTER_PRESETS,
  ENQUIRY_SOURCES,
} from '../utils/salesConstants';
import { calculateEstimatedSubsidy } from '../utils/salesHelpers';

export const CustomerDetailsPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'quotations' | 'followups' | 'surveys' | 'orders'
  const [successBanner, setSuccessBanner] = useState('');

  // Modal open states (All stay on the same page)
  const [isLogEnquiryOpen, setIsLogEnquiryOpen] = useState(false);
  const [isNewQuotationOpen, setIsNewQuotationOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [isScheduleSurveyOpen, setIsScheduleSurveyOpen] = useState(false);

  // Form states
  const [enquiryForm, setEnquiryForm] = useState({
    source: 'Website Form',
    capacity: 10,
    address: '',
    notes: '',
  });

  const [quotationForm, setQuotationForm] = useState({
    enquiryId: '',
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

  const [followUpForm, setFollowUpForm] = useState({
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:00 AM',
    type: 'Phone Call',
    priority: 'Normal',
    purpose: 'Follow-up regarding solar proposal and financing options',
  });

  const [surveyForm, setSurveyForm] = useState({
    surveyDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    surveyTime: '10:00 AM',
    surveyorName: 'Amit Meena (Field Engineer)',
    roofType: 'Flat RCC Concrete',
    shadowIssue: 'None',
  });

  const loadCustomerData = () => {
    const customers = storageService.getCustomers();
    const found = customers.find((c) => c.id === customerId);
    setCustomer(found || null);

    if (found) {
      // Linked enquiries
      const allEnquiries = storageService.getEnquiries();
      const linkedEnq = allEnquiries.filter(
        (e) =>
          e.customerId === found.id ||
          e.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setEnquiries(linkedEnq);

      // Linked quotations
      const allQuotations = storageService.getQuotations();
      const linkedQuo = allQuotations.filter(
        (q) =>
          q.customerId === found.id ||
          q.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setQuotations(linkedQuo);

      // Linked follow-ups
      const allFollowUps = storageService.getFollowUps();
      const linkedFol = allFollowUps.filter(
        (f) =>
          f.customerId === found.id ||
          f.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setFollowUps(linkedFol);

      // Linked surveys
      const allSurveys = storageService.getSurveys();
      const linkedSurv = allSurveys.filter(
        (s) =>
          s.customerId === found.id ||
          s.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setSurveys(linkedSurv);

      // Linked orders
      const allOrders = storageService.getOrders();
      const linkedOrd = allOrders.filter(
        (o) =>
          o.customerId === found.id ||
          o.customerName?.toLowerCase() === found.name?.toLowerCase()
      );
      setOrders(linkedOrd);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const triggerSuccess = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4500);
  };

  // Submit Log Enquiry (In-Place)
  const handleLogEnquirySubmit = (e) => {
    e.preventDefault();
    if (!customer) return;

    storageService.createEnquiry({
      customerId: customer.id,
      customerName: customer.name,
      contactNumber: customer.phone,
      email: customer.email,
      address: enquiryForm.address || customer.address || customer.city,
      enquirySource: enquiryForm.source,
      capacity: `${enquiryForm.capacity} kW Rooftop`,
      enquiryStatus: 'New',
      notes: enquiryForm.notes,
    });

    loadCustomerData();
    setIsLogEnquiryOpen(false);
    setActiveTab('enquiries');
    triggerSuccess(`Inbound enquiry created successfully for ${customer.name}!`);
    setEnquiryForm({ source: 'Website Form', capacity: 10, address: '', notes: '' });
  };

  // Submit New Quotation (In-Place)
  const handleNewQuotationSubmit = (e) => {
    e.preventDefault();
    if (!customer) return;

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
      customerId: customer.id,
      customerName: customer.name,
      contact: customer.phone,
      enquiryId: quotationForm.enquiryId || (enquiries[0]?.id ?? 'ENQ-DIRECT'),
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

    loadCustomerData();
    setIsNewQuotationOpen(false);
    setActiveTab('quotations');
    triggerSuccess(`Solar Proposal & BOQ (${quotationForm.systemCapacity} kW) created and linked to ${customer.name}!`);
  };

  // Submit Add Follow-up (In-Place)
  const handleAddFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!customer) return;

    storageService.createFollowUp({
      customerId: customer.id,
      customerName: customer.name,
      contact: customer.phone,
      followUpDate: followUpForm.date,
      followUpTime: followUpForm.time,
      type: followUpForm.type,
      priority: followUpForm.priority,
      purpose: followUpForm.purpose,
      status: 'Pending',
      notes: `Follow-up created from customer profile page for ${customer.name}`,
    });

    loadCustomerData();
    setIsAddFollowUpOpen(false);
    setActiveTab('followups');
    triggerSuccess(`Follow-up scheduled for ${customer.name} on ${followUpForm.date}!`);
  };

  // Submit Schedule Survey (In-Place)
  const handleScheduleSurveySubmit = (e) => {
    e.preventDefault();
    if (!customer) return;

    storageService.createSurvey({
      customerId: customer.id,
      customerName: customer.name,
      contact: customer.phone,
      surveyDate: surveyForm.surveyDate,
      surveyTime: surveyForm.surveyTime,
      address: customer.address || customer.city,
      roofType: surveyForm.roofType,
      shadowIssue: surveyForm.shadowIssue,
      surveyorName: surveyForm.surveyorName,
      status: 'Scheduled',
    });

    loadCustomerData();
    setIsScheduleSurveyOpen(false);
    setActiveTab('surveys');
    triggerSuccess(`Site survey scheduled for ${customer.name} on ${surveyForm.surveyDate}!`);
  };

  if (!customer) {
    return (
      <PageContainer>
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Customer not found</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/sales/customers')}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Customers
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
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/customers')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-600 shadow-xs"
            title="Return to customer directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {customer.name}
              </h1>
              <StatusBadge status={customer.status || 'Active'} />
            </div>
            <span className="font-mono text-xs text-[#0284C7] font-semibold">{customer.id}</span>
          </div>
        </div>

        {/* 4 IN-PLACE ACTIONS - STAY ON SAME PAGE */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLogEnquiryOpen(true)}
            className="shadow-xs whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
            <span>Log Query</span>
          </Button>

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
            onClick={() => setIsNewQuotationOpen(true)}
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

      {/* Customer Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Info Card */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#0284C7]" /> Customer Profile & Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Phone Contact</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#0284C7]" /> {customer.phone}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Email Address</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {customer.email || 'Not provided'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Segment Type</span>
              <span className="font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full inline-block mt-0.5">
                {customer.type || 'Residential'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Site City / Region</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {customer.city || 'Jaipur, Rajasthan'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-medium block">Installation Site Address</span>
              <p className="font-medium text-slate-700 mt-0.5">
                {customer.address || 'Address details registered on project contract.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Commercial Summary Tile */}
        <Card>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Energy & System Metrics
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Solar Capacity</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {customer.totalCapacity ? `${customer.totalCapacity} kW` : '10.5 kW'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Est. Daily Generation</span>
              <span className="font-bold text-emerald-600">
                ~{Math.round((customer.totalCapacity || 10.5) * 4.5)} kWh / day
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">DISCOM Meter Sanction</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 3-Phase Approved
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Account Sales Officer</span>
              <span className="font-semibold text-[#0284C7]">Sales Operations Team</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Linked Customer Activities */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'enquiries', label: `Inbound Queries (${enquiries.length})`, icon: MessageSquare },
          { key: 'quotations', label: `Quotations & BOQ (${quotations.length})`, icon: FileText },
          { key: 'followups', label: `Follow-ups (${followUps.length})`, icon: PhoneCall },
          { key: 'surveys', label: `Site Surveys (${surveys.length})`, icon: ClipboardCheck },
          { key: 'orders', label: `Converted Orders (${orders.length})`, icon: ShoppingCart },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#0284C7] text-white shadow-card'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. Enquiries Table */}
      {activeTab === 'enquiries' && (
        <Card padding={false} className="overflow-hidden mb-6">
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Customer Enquiry Pipeline
            </span>
            <Button variant="outline" size="xs" onClick={() => setIsLogEnquiryOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Log New Query
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Enquiry Ref</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Required Capacity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.length > 0 ? (
                  enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{enq.id}</td>
                      <td className="p-3">{enq.enquirySource || 'Website'}</td>
                      <td className="p-3 font-semibold">{enq.capacity}</td>
                      <td className="p-3">
                        <StatusBadge status={enq.enquiryStatus || enq.status || 'New'} />
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{enq.notes || '—'}</td>
                      <td className="p-3 text-slate-500">{formatDate(enq.createdDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No enquiry records logged yet for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 2. Quotations Table */}
      {activeTab === 'quotations' && (
        <Card padding={false} className="overflow-hidden mb-6">
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issued Proposals & Engineering BOQ
            </span>
            <Button variant="primary" size="xs" onClick={() => setIsNewQuotationOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Quotation
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Quotation ID</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Net Payable</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.length > 0 ? (
                  quotations.map((quo) => (
                    <tr key={quo.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{quo.id}</td>
                      <td className="p-3 font-semibold">{quo.systemCapacity || quo.capacity} kW</td>
                      <td className="p-3">{formatCurrency(quo.subtotal || quo.totalCost)}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {formatCurrency(quo.finalAmount || quo.netPayable)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={quo.status} />
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(quo.expiryDate || quo.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No quotations issued yet for this customer. Click "Create Quotation" above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 3. Follow-ups */}
      {activeTab === 'followups' && (
        <Card padding={false} className="overflow-hidden mb-6">
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Customer Follow-up Log
            </span>
            <Button variant="outline" size="xs" onClick={() => setIsAddFollowUpOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Follow-up
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.length > 0 ? (
                  followUps.map((fol) => (
                    <tr key={fol.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{fol.id}</td>
                      <td className="p-3 font-semibold">
                        {formatDate(fol.followUpDate)} at {fol.followUpTime}
                      </td>
                      <td className="p-3">{fol.type}</td>
                      <td className="p-3 text-slate-700 max-w-sm truncate">{fol.purpose}</td>
                      <td className="p-3">
                        <StatusBadge status={fol.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No follow-ups recorded yet for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 4. Surveys */}
      {activeTab === 'surveys' && (
        <Card padding={false} className="overflow-hidden mb-6">
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Site Feasibility Surveys
            </span>
            <Button variant="outline" size="xs" onClick={() => setIsScheduleSurveyOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Schedule Survey
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Survey ID</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Roof Profile</th>
                  <th className="p-3">Assigned Engineer</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surveys.length > 0 ? (
                  surveys.map((surv) => (
                    <tr key={surv.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{surv.id}</td>
                      <td className="p-3 font-semibold">
                        {formatDate(surv.surveyDate)} at {surv.surveyTime}
                      </td>
                      <td className="p-3">{surv.roofType || 'Flat RCC'}</td>
                      <td className="p-3">{surv.surveyorName || 'Assigned Surveyor'}</td>
                      <td className="p-3">
                        <StatusBadge status={surv.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No site feasibility surveys scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: 5. Orders */}
      {activeTab === 'orders' && (
        <Card padding={false} className="overflow-hidden mb-6">
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Converted Solar Contracts & Orders
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">System Size</th>
                  <th className="p-3">Contract Value</th>
                  <th className="p-3">Execution Stage</th>
                  <th className="p-3">Booking Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length > 0 ? (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-sky-50/40">
                      <td className="p-3 font-mono font-bold text-[#0284C7]">{ord.id}</td>
                      <td className="p-3 font-semibold">{ord.capacity}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        {formatCurrency(ord.contractValue || ord.amount)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={ord.stage || ord.status} />
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(ord.createdDate || ord.date)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No converted orders yet. Once a quotation is accepted, it converts here automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 1: LOG CUSTOMER QUERY / ENQUIRY                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isLogEnquiryOpen}
        onClose={() => setIsLogEnquiryOpen(false)}
        title={`Log Inbound Query for ${customer.name}`}
        size="md"
      >
        <form onSubmit={handleLogEnquirySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              value={customer.name}
              disabled
              helperText="Auto-linked"
            />
            <Input
              label="Contact Phone"
              value={customer.phone}
              disabled
              helperText="From customer profile"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Required Capacity (kW)"
              type="number"
              required
              min="1"
              suffix="kW"
              value={enquiryForm.capacity}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, capacity: Number(e.target.value) })}
            />
            <Select
              label="Lead / Enquiry Source"
              value={enquiryForm.source}
              onChange={(e) => setEnquiryForm({ ...enquiryForm, source: e.target.value })}
              options={ENQUIRY_SOURCES}
            />
          </div>

          <Input
            label="Site / Installation Location"
            value={enquiryForm.address || customer.address || customer.city}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
            placeholder="Address where solar rooftop will be mounted"
          />

          <Input
            label="Specific Requirements / Consumer Notes"
            type="textarea"
            rows={2}
            value={enquiryForm.notes}
            onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
            placeholder="e.g. Needs hybrid inverter with battery backup and net metering assistance"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsLogEnquiryOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Enquiry (Save Here)
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 2: CREATE SOLAR PROPOSAL & BOQ (NEW QUOTATION)             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isNewQuotationOpen}
        onClose={() => setIsNewQuotationOpen(false)}
        title={`Create Solar Proposal & BOQ for ${customer.name}`}
        size="lg"
      >
        <form onSubmit={handleNewQuotationSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              value={customer.name}
              disabled
              helperText="Prefilled customer"
            />
            <Select
              label="Linked Enquiry Reference"
              value={quotationForm.enquiryId}
              onChange={(e) => setQuotationForm({ ...quotationForm, enquiryId: e.target.value })}
              options={[
                { value: '', label: 'Direct Proposal (No prior enquiry)' },
                ...enquiries.map((enq) => ({
                  value: enq.id,
                  label: `${enq.id} (${enq.capacity || 'Solar Request'})`,
                })),
              ]}
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
                const estSubsidy = calculateEstimatedSubsidy(cap, customer.type || 'Residential');
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
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewQuotationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Generate & Send Quotation (Save Here)
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 3: SCHEDULE FOLLOW-UP                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddFollowUpOpen}
        onClose={() => setIsAddFollowUpOpen(false)}
        title={`Schedule Follow-up with ${customer.name}`}
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
              Schedule Follow-up (Save Here)
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* IN-PLACE MODAL 4: SCHEDULE SITE SURVEY                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isScheduleSurveyOpen}
        onClose={() => setIsScheduleSurveyOpen(false)}
        title={`Schedule Site Survey for ${customer.name}`}
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
            value={customer.address || customer.city}
            disabled
            helperText="Customer installation location"
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
    </PageContainer>
  );
};

export default CustomerDetailsPage;
