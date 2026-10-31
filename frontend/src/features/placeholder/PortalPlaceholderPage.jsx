import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import PortalSwitcher from '../../components/layout/PortalSwitcher';
import {
  Boxes,
  Wrench,
  Construction,
  ArrowLeft,
  Shield,
  TrendingUp,
  Sparkles,
  Sun,
} from 'lucide-react';

export const PortalPlaceholderPage = ({ type = 'warehouse' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isWarehouse = type === 'warehouse' || location.pathname.includes('warehouse');
  const isTechnician = type === 'technician' || location.pathname.includes('technician');

  const config = isWarehouse
    ? {
        role: 'Warehouse Manager',
        title: 'Warehouse & Inventory Portal',
        subtitle: 'Supply Chain, Stock Receiving, Equipment Staging & Dispatch Tracking',
        icon: Boxes,
        gradient: 'from-[#0284C7] to-[#0369A1]',
        iconColor: 'text-[#0284C7]',
        badgeBg: 'bg-[#E0F2FE]',
        badgeText: 'text-[#0284C7]',
      }
    : {
        role: 'Field Service Technician',
        title: 'Technician Field Operations Portal',
        subtitle: 'Site Survey Execution, Solar Rooftop Commissioning & Ticket Resolution',
        icon: Wrench,
        gradient: 'from-[#0D9488] to-[#0F766E]',
        iconColor: 'text-teal-600',
        badgeBg: 'bg-teal-50',
        badgeText: 'text-teal-700',
      };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0F7FF] to-[#E0F2FE] flex flex-col">
      {/* Top Header with Portal Switcher */}
      <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white font-bold shadow-sm">
            <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">SIMS</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {config.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Solar Management System</p>
          </div>
        </div>

        {/* 1-Tap Portal Switcher */}
        <div className="flex items-center gap-3">
          <PortalSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl bg-white rounded-3xl p-8 sm:p-10 shadow-elevated border border-slate-200/80 text-center relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-sky-100/60 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

          {/* Module Icon */}
          <div className={`w-20 h-20 rounded-2xl ${config.badgeBg} flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100`}>
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>

          {/* Role Status Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
            <Construction className="w-3.5 h-3.5 text-amber-600" />
            <span>Role Ready • Portal Coming Soon</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {config.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
            {config.subtitle}. The routing, authentication clearance, and portal switching for the <strong className="text-slate-800">{config.role}</strong> are configured and ready for full implementation.
          </p>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold shadow-card transition active:scale-95"
            >
              <Shield className="w-4 h-4" />
              <span>Switch to Admin Console</span>
            </button>

            <button
              onClick={() => navigate('/sales/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-xs transition active:scale-95"
            >
              <TrendingUp className="w-4 h-4 text-[#0284C7]" />
              <span>Switch to Sales Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalPlaceholderPage;

