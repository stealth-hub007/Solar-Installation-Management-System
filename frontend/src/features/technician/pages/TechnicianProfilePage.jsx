import React from 'react';
import PageContainer from '../../../components/layout/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import Card from '../../../components/ui/Card';
import { User, Phone, Mail, Award, Clock, ShieldCheck, MapPin, Wrench } from 'lucide-react';

export const TechnicianProfilePage = () => {
  return (
    <PageContainer>
      <PageHeader
        title="Field Technician Profile & Logged Labor"
        subtitle="Credentials, contact details, certified skillsets, and field hours ledger"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card padding={false} className="p-6 overflow-hidden text-center">
          <div className="w-20 h-20 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-md">
            VS
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">Vikram Singh</h3>
          <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-[#0284C7]">
            Lead Field Engineer & Surveyor
          </span>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>vikram.tech@sunpower.com</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>+91 98290 11111</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Jaipur Hub, Rajasthan</span>
            </div>
          </div>
        </Card>

        {/* Certifications and Summary */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding={false} className="p-6 overflow-hidden">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Technical Certifications & Field Qualifications</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-800">NISE / Skill Council for Green Jobs (SCGJ) Solar PV Installer</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Level 4 Certified</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-800">DISCOM Net-Metering & CEIG Safety Inspector Clearance</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Active License</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-800">Elevated Superstructure & Chemical Anchoring Specialist</span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">Hilti Certified</span>
              </div>
            </div>
          </Card>

          <Card padding={false} className="p-6 overflow-hidden">
            <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0284C7]" />
              <span>Field Activity Ledger Summary</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-sky-50">
                <span className="text-xl font-extrabold text-[#0284C7] block">34.5</span>
                <span className="text-[11px] text-slate-500 font-medium">Logged Hours</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <span className="text-xl font-extrabold text-emerald-700 block">4</span>
                <span className="text-[11px] text-slate-500 font-medium">Surveys Done</span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <span className="text-xl font-extrabold text-purple-700 block">5</span>
                <span className="text-[11px] text-slate-500 font-medium">Installations</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <span className="text-xl font-extrabold text-amber-700 block">5.0 ★</span>
                <span className="text-[11px] text-slate-500 font-medium">Client Rating</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default TechnicianProfilePage;
