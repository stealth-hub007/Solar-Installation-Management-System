import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Phone, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';

export const TodayAssignments = ({ surveys = [], installations = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Today's Site Visits */}
      <Card padding={false} className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0284C7]" />
            <span className="font-bold text-sm text-slate-800">Today & Upcoming Surveys</span>
          </div>
          <Button variant="ghost" size="xs" onClick={() => navigate('/technician/surveys')}>
            View All ({surveys.length})
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {surveys.slice(0, 3).map((survey) => (
            <div key={survey.id} className="p-4 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#0284C7] mr-2">{survey.id}</span>
                  <span className="font-bold text-sm text-slate-900">{survey.customerName}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-100">
                  {survey.proposedCapacity}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {survey.scheduledDate} ({survey.scheduledTime})
                </span>
                <span className="flex items-center gap-1 truncate max-w-[220px]" title={survey.siteAddress}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{survey.siteAddress}</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Roof: <strong className="text-slate-700">{survey.roofType}</strong>
                </span>
                <Button
                  size="xs"
                  variant="primary"
                  onClick={() => navigate(`/technician/surveys/${survey.id}`)}
                >
                  Start Survey
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Active Installation Jobs */}
      <Card padding={false} className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-sm text-slate-800">Active Installation Jobs</span>
          </div>
          <Button variant="ghost" size="xs" onClick={() => navigate('/technician/installations')}>
            View All ({installations.length})
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {installations.slice(0, 3).map((job) => (
            <div key={job.id} className="p-4 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#0284C7] mr-2">{job.id}</span>
                  <span className="font-bold text-sm text-slate-900">{job.customerName}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {job.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 mb-2 truncate">
                {job.panels} • {job.inverter}
              </div>

              {/* Progress bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Installation Checklist</span>
                  <span className="font-bold text-slate-800">
                    {job.checklistCompleted} / {job.checklistTotal} done
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#0284C7] h-full rounded-full transition-all"
                    style={{ width: `${Math.round((job.checklistCompleted / job.checklistTotal) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-700 font-medium">
                  {job.dispatchStatus}
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => navigate(`/technician/installations/${job.id}`)}
                >
                  Manage Job
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TodayAssignments;
