import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/layout/PageContainer';
import Card from '../../../components/ui/Card';
import Button from '../../../components/common/Button';
import StatusBadge from '../../../components/ui/StatusBadge';
import storageService from '../../../services/storageService';
import formatDate from '../../../utils/formatDate';
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
} from 'lucide-react';

export const EnquiryDetailsPage = () => {
  const { enquiryId } = useParams();
  const navigate = useNavigate();

  const [enquiry, setEnquiry] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const list = storageService.getEnquiries();
    const found = list.find((e) => e.id === enquiryId);
    setEnquiry(found || null);

    if (found) {
      // Linked follow-ups
      const allFollowUps = storageService.getFollowUps();
      setFollowUps(allFollowUps.filter((f) => f.enquiryId === found.id));

      // Linked surveys
      const allSurveys = storageService.getSurveys();
      setSurveys(allSurveys.filter((s) => s.enquiryId === found.id));

      // Linked quotations
      const allQuotations = storageService.getQuotations();
      setQuotations(allQuotations.filter((q) => q.enquiryId === found.id));
    }
  }, [enquiryId]);

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
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Pipeline
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/enquiries')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-600"
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/sales/follow-ups?schedule=true&enquiryId=${enquiry.id}&customer=${encodeURIComponent(
                  enquiry.customerName
                )}`
              )
            }
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1" /> Add Follow-up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(
                `/sales/surveys?schedule=true&enquiryId=${enquiry.id}&customer=${encodeURIComponent(
                  enquiry.customerName
                )}`
              )
            }
          >
            <ClipboardCheck className="w-3.5 h-3.5 mr-1" /> Schedule Survey
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(
                `/sales/quotations?create=true&enquiryId=${enquiry.id}&customer=${encodeURIComponent(
                  enquiry.customerName
                )}`
              )
            }
          >
            <FileText className="w-3.5 h-3.5 mr-1" /> Create Quotation
          </Button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Enquiry Spec Card */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0284C7]" /> Technical & Site Requirements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Requested Solar Capacity</span>
              <span className="font-extrabold text-[#0284C7] text-base mt-0.5 block">
                {enquiry.capacity}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Lead Generation Source</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                {enquiry.enquirySource || 'Website Inbound'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Contact Number</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#0284C7]" /> {enquiry.contactNumber || enquiry.phone}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Email Address</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {enquiry.email || '—'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-medium block">Installation Site Address</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />{' '}
                {enquiry.address || enquiry.location || 'Rajasthan, India'}
              </span>
            </div>

            <div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-semibold block mb-1">Customer Remarks / Electricity Load:</span>
              <p className="text-slate-700">
                {enquiry.notes ||
                  'Customer requested quote for residential rooftop solar with DISCOM PM Surya Ghar subsidy.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Lead Workflow Status Card */}
        <Card>
          <h3 className="text-sm font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Lead Qualification Stage
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Pipeline Stage</span>
              <StatusBadge status={enquiry.enquiryStatus || enquiry.status || 'New'} />
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Assigned Sales Officer</span>
              <span className="font-semibold text-slate-800">Vikram Singh</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-500">Logged On</span>
              <span className="font-semibold text-slate-700">{formatDate(enquiry.createdDate)}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Electricity Bill</span>
              <span className="font-medium text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded text-[11px]">
                {enquiry.files || 'Bill_Attached.pdf'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Linked Follow-ups and Surveys */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-ups */}
        <Card>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-[#0284C7]" /> Follow-up Records ({followUps.length})
            </h4>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {followUps.length > 0 ? (
              followUps.map((f) => (
                <div key={f.id} className="py-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">{f.purpose}</span>
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>{f.followUpDate} at {f.followUpTime}</span>
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

        {/* Site Surveys */}
        <Card>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" /> Site Surveys ({surveys.length})
            </h4>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {surveys.length > 0 ? (
              surveys.map((s) => (
                <div key={s.id} className="py-2.5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-800">{s.siteLocation}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>Scheduled: {s.scheduledDate} {s.scheduledTime}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-medium">{s.assignedSurveyor}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-400">No site survey scheduled yet.</p>
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default EnquiryDetailsPage;

