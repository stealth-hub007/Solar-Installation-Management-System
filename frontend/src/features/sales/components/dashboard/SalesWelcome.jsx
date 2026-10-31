import React from 'react';
import { Plus, Users, Calendar, FileText } from 'lucide-react';

export const SalesWelcome = ({
  salesRepName = 'Sales Executive',
  isAdmin = false,
  stats,
  onAddCustomer,
  onCreateEnquiry,
  onScheduleFollowUp,
  onCreateQuotation,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const pendingFollowUpsCount = stats?.pendingFollowUps ?? 5;
  const upcomingSurveysCount = stats?.upcomingSurveys ?? 3;
  const targetPercent = stats?.targetAchievementPercent ?? 52.5;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00609C] via-[#0284C7] to-[#0369A1] text-white p-6 sm:p-7 shadow-elevated mb-6">
      {/* Decorative background sun rays */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-20 -bottom-16 w-48 h-48 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-medium text-white/90 mb-3">
            <Calendar className="w-3.5 h-3.5 text-white/80" />
            <span>
              {todayFormatted} • {isAdmin ? 'Administrator Console • Sales Operations Oversight' : 'Solar Commercial Division • Sales Executive Workspace'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-[#FCD34D]">{salesRepName}</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            {isAdmin ? (
              <>
                You are currently managing the <span className="font-bold text-white">Solar Commercial Sales Pipeline</span> with Super Administrator privileges. The team has achieved <span className="font-bold text-white">{targetPercent}%</span> of this month's revenue target with <span className="font-bold text-white">{pendingFollowUpsCount} follow-ups</span> and <span className="font-bold text-white">{upcomingSurveysCount} site surveys</span> scheduled across active leads.
              </>
            ) : (
              <>
                You are currently managing your <span className="font-bold text-white">Solar Commercial Sales Pipeline</span> as <span className="font-bold text-white">Sales Executive</span>. You have achieved <span className="font-bold text-white">{targetPercent}%</span> of this month's revenue target with <span className="font-bold text-white">{pendingFollowUpsCount} follow-ups</span> and <span className="font-bold text-white">{upcomingSurveysCount} site surveys</span> scheduled across active leads.
              </>
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onAddCustomer}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-white text-[#0284C7] text-xs font-semibold hover:bg-sky-50 shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={onCreateEnquiry}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold backdrop-blur shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Enquiry</span>
          </button>

          <button
            onClick={onScheduleFollowUp}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold backdrop-blur shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Follow-up</span>
          </button>

          <button
            onClick={onCreateQuotation}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 text-xs font-bold shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-900" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesWelcome;
