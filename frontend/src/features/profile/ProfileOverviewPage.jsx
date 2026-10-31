import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/common/PageHeader';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  CheckCircle2,
  Calendar,
  Building,
  Activity,
  Edit2,
  Lock,
} from 'lucide-react';
import storageService from '../../services/storageService';

export const ProfileOverviewPage = () => {
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('sims_admin_profile');
      return saved
        ? JSON.parse(saved)
        : {
            name: 'Admin User',
            title: 'Super Administrator',
            email: 'admin@solar-sims.com',
            phone: '+91 98290 55443',
            department: 'Executive Administration & Operations',
            location: 'Jaipur, Rajasthan, India',
            joinedDate: '2023-01-15T09:00:00Z',
            status: 'Active',
            twoFactorEnabled: true,
          };
    } catch {
      return {
        name: 'Admin User',
        title: 'Super Administrator',
        email: 'admin@solar-sims.com',
        phone: '+91 98290 55443',
        department: 'Executive Administration & Operations',
        location: 'Jaipur, Rajasthan, India',
        joinedDate: '2023-01-15T09:00:00Z',
        status: 'Active',
        twoFactorEnabled: true,
      };
    }
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...adminProfile });
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setAdminProfile(editForm);
    localStorage.setItem('sims_admin_profile', JSON.stringify(editForm));
    storageService.logActivity('Updated Super Administrator profile details', 'Profile', 'Updated');
    setIsEditOpen(false);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  const activities = storageService.getActivities().slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        title="Admin Profile Overview"
        subtitle="Manage master administrator credentials, identity credentials, and security clearance"
      >
        <Button variant="primary" size="sm" icon={Edit2} onClick={() => setIsEditOpen(true)}>
          Edit Profile
        </Button>
      </PageHeader>

      {isSavedAlert && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile information successfully updated and saved in LocalStorage.</span>
        </div>
      )}

      {/* Hero Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white font-bold text-3xl flex items-center justify-center shadow-md mx-auto">
                AD
              </div>
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Online & Active">
                <span className="w-2 h-2 bg-white rounded-full" />
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{adminProfile.name}</h2>
            <p className="text-xs font-semibold text-[#0284C7] mb-2">{adminProfile.title}</p>
            <div className="flex justify-center mb-4">
              <StatusBadge status={adminProfile.status} />
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{adminProfile.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{adminProfile.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{adminProfile.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>SuryaTech Solar Solutions Pvt Ltd</span>
              </div>
            </div>
          </Card>

          {/* Security & Access Box */}
          <Card>
            <CardHeader
              icon={Shield}
              title="Security Credentials"
              subtitle="Access clearance level"
            />
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Access Level:</span>
                <span className="font-semibold text-slate-800">Tier-1 Master Admin</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">2-Factor Authentication:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Session Status:</span>
                <span className="text-[#0284C7] font-semibold">Active HTTPS Session</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Password Last Changed:</span>
                <span className="text-slate-700">14 days ago</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Administrative Roles & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              icon={Key}
              title="Super Administrator Privileges"
              subtitle="Full system capabilities granted to your account"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800 block">User Access Verification</span>
                <p className="text-slate-500 text-[11px]">
                  Authorize and grant role access requests submitted by managers, technicians, and staff from login portal.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800 block">Complete Master CRUD</span>
                <p className="text-slate-500 text-[11px]">
                  Unrestricted create, view, edit, and delete operations across customers, products, enquiries, and inventory.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800 block">Commercial Proposals</span>
                <p className="text-slate-500 text-[11px]">
                  Final approval rights for solar quotations, MNRE direct subsidy adjustments, and contract executions.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800 block">Audit & Financial Oversight</span>
                <p className="text-slate-500 text-[11px]">
                  Access to financial ledgers, audit logs, and critical operational low stock notifications.
                </p>
              </div>
            </div>
          </Card>

          {/* Recent Administrative Log */}
          <Card>
            <CardHeader
              icon={Activity}
              title="Recent Activity Logged By Admin"
              subtitle="Latest audited operations recorded in system registry"
            />
            <div className="divide-y divide-slate-100 text-xs">
              {activities.map((act) => (
                <div key={act.id} className="py-2.5 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{act.activity}</p>
                    <span className="text-[10px] text-slate-400">
                      Module: <span className="font-medium text-slate-600">{act.module}</span> • {act.id}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-[#0284C7] shrink-0">
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Admin Profile Information"
          subtitle="Update master account name, phone and location"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>
                Save Profile
              </Button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Full Administrator Name *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Administrative Role Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Operating Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
};

export default ProfileOverviewPage;

