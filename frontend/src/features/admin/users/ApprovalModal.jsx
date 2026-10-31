import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  TrendingUp,
  Boxes,
  Wrench,
  Shield,
  Check,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import userAPI from './userAPI';

export const ApprovalModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('SALES');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const roleOptions = [
    {
      id: 'SALES',
      title: 'Sales Executive',
      badge: 'Sales Operations',
      icon: TrendingUp,
      color: 'border-blue-300 bg-blue-50/50 text-blue-900',
      description: 'Enquiries, customer onboarding, site survey scheduling, quotations, and commercial sales orders.',
    },
    {
      id: 'WAREHOUSE',
      title: 'Warehouse Manager',
      badge: 'Supply Chain',
      icon: Boxes,
      color: 'border-amber-300 bg-amber-50/50 text-amber-900',
      description: 'Inventory monitoring, purchase orders, goods receipts, serial tracking, and dispatch staging.',
    },
    {
      id: 'TECHNICIAN',
      title: 'Field Technician',
      badge: 'Field Engineering',
      icon: Wrench,
      color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
      description: 'Site feasibility surveys, hardware installation checklists, photo uploads, and commissioning signoffs.',
    },
    {
      id: 'ADMIN',
      title: 'Administrator',
      badge: 'Full Enterprise',
      icon: Shield,
      color: 'border-purple-300 bg-purple-50/50 text-purple-900',
      description: 'Full supervisory authority across all 4 dashboards: Admin, Sales, Warehouse, and Technician modules.',
    },
  ];

  const handleApprove = async () => {
    setLoading(true);
    setError('');

    try {
      await userAPI.approveUser(user.id, {
        role: selectedRole,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#123C32] to-[#0D2D25] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Approve User Account</h3>
              <p className="text-xs text-emerald-100/80">Assign an operational role and activate access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* User Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Applicant Information
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-bold text-slate-900">{user.full_name || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Corporate Email:</span>
              <span className="font-semibold text-slate-900">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account ID:</span>
              <span className="font-mono text-slate-600">{user.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Registered On:</span>
              <span className="text-slate-700">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Select Operational Role to Assign *
            </label>
            <div className="space-y-2">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedRole === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedRole(opt.id)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'border-[#0284C7] bg-sky-50/70 shadow-xs ring-1 ring-[#0284C7]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#0284C7] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{opt.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 leading-snug">{opt.description}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? 'border-[#0284C7] bg-[#0284C7] text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleApprove}
            disabled={loading}
            icon={loading ? Loader2 : ShieldCheck}
          >
            {loading ? 'Approving...' : `Approve as ${selectedRole}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;
