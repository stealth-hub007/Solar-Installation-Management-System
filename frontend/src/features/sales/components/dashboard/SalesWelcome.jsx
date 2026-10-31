import React from 'react';
import { Sun, Plus, PhoneCall, FileText, ClipboardCheck, Users, Calendar, ShieldCheck } from 'lucide-react';
import Button from '../../../../components/common/Button';

export const SalesWelcome = ({
  salesRepName = 'Admin User',
  isAdmin = true,
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

  const pendingFollowUpsCount = stats?.pendingFollowUps ?? stats?.totalFollowUps ?? 8;
  const upcomingSurveysCount = stats?.upcomingSurveys ?? stats?.totalSurveys ?? 5;
  const targetPercent = stats?.targetAchievementPercent ?? 80.8;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#075985] text-white p-6 sm:p-8 shadow-elevated mb-6">
      {/* Decorative background sun rays */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-20 -bottom-16 w-48 h-48 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs font-semibold mb-3">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>{todayFormatted}</span>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span className="text-sky-200">
              {isAdmin ? 'Administrator Console • Sales Operations Oversight' : 'Solar Commercial Division'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-amber-300">{salesRepName}</span>
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
            {isAdmin ? (
              <>
                You are currently managing the <span className="font-bold text-white">Solar Commercial Sales Pipeline</span> with Super Administrator privileges. The team has achieved <span className="font-bold text-white">{targetPercent}%</span> of this month's revenue target with <span className="font-bold text-amber-200">{pendingFollowUpsCount} follow-ups</span> and <span className="font-bold text-emerald-200">{upcomingSurveysCount} site surveys</span> scheduled across active leads.
              </>
            ) : (
              <>
                You are on track to achieve <span className="font-bold text-white">{targetPercent}%</span> of your monthly solar sales quota. 
                There are <span className="font-bold text-amber-200">{pendingFollowUpsCount} follow-ups</span> and <span className="font-bold text-emerald-200">{upcomingSurveysCount} site surveys</span> scheduled this week.
              </>
            )}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onAddCustomer}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-white text-[#0284C7] text-xs font-bold hover:bg-sky-50 shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={onCreateEnquiry}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold backdrop-blur shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Enquiry</span>
          </button>

          <button
            onClick={onScheduleFollowUp}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-bold backdrop-blur shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Schedule Follow-up</span>
          </button>

          <button
            onClick={onCreateQuotation}
            className="h-9 inline-flex flex-row flex-nowrap items-center gap-1.5 px-3.5 rounded-xl bg-amber-400 text-slate-900 text-xs font-bold hover:bg-amber-300 shadow-sm transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesWelcome;
