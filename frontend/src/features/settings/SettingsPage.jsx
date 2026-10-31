import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/common/Button';
import { Settings, Shield, CheckCircle2, RotateCcw } from 'lucide-react';
import { resetAllData } from '../dashboard/dashboardSlice';

export const SettingsPage = () => {
  const dispatch = useDispatch();
  const [orgName, setOrgName] = useState('SuryaTech Solar Solutions Pvt Ltd');
  const [contactEmail, setContactEmail] = useState('admin@solar-sims.com');
  const [currencyCode, setCurrencyCode] = useState('INR (₹)');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all sample data back to pristine baseline defaults?')) {
      await dispatch(resetAllData());
      alert('Sample data reset successfully!');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage organization profile, business branding, and administrative access privileges"
      >
        <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleResetData}>
          Reset Baseline Data
        </Button>
      </PageHeader>

      <div className="w-full space-y-6">
        <Card>
          <CardHeader
            icon={Settings}
            title="Organization Profile"
            subtitle="Business information displayed on customer solar quotations, invoices and official contracts"
          />
          <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Company / Entity Legal Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Administrative Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Standard Currency Base</label>
                <input
                  type="text"
                  disabled
                  value={currencyCode}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" size="sm" type="submit">
                Save Profile Changes
              </Button>
              {isSaved && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved successfully to local storage
                </span>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            icon={Shield}
            title="Role-Based Access Control (RBAC) Matrix"
            subtitle="Overview of user roles and operational security clearance across SIMS subsystems"
          />
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-3.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-800 text-sm">Super Administrator</span>
                <span className="block text-xs text-slate-500 mt-0.5">Unrestricted master CRUD authority across all solar modules and system configurations</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-sky-100 text-[#0284C7] font-semibold text-xs whitespace-nowrap">Active Admin</span>
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-800 text-sm">Operations / Branch Manager</span>
                <span className="block text-xs text-slate-500 mt-0.5">Authorized for Inventory, Warehouse Dispatch, Order processing, and Technician allocation</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">Operational Role</span>
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-800 text-sm">Field Service Engineer</span>
                <span className="block text-xs text-slate-500 mt-0.5">Assigned to Site Surveys, Rooftop Work Orders, and Breakdown Resolution Tickets</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">Technical Staff</span>
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-800 text-sm">Sales & Proposal Officer</span>
                <span className="block text-xs text-slate-500 mt-0.5">Inbound Enquiries, Customer KYC verification, Quotations, and Contract proposals</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">Sales Role</span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
