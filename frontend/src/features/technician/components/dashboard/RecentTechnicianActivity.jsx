import React from 'react';
import { Activity, Camera, CheckSquare, PenTool, ClipboardCheck, Clock } from 'lucide-react';
import Card, { CardHeader } from '../../../../components/ui/Card';

export const RecentTechnicianActivity = ({ activities = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'photo':
        return <Camera className="w-3.5 h-3.5 text-sky-600" />;
      case 'checklist':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'signoff':
        return <PenTool className="w-3.5 h-3.5 text-purple-600" />;
      case 'survey':
        return <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Recent Field Activity & Logs"
        subtitle="Chronological record of measurements, photographs, checklist checks, and customer sign-offs"
        icon={Activity}
      />
      <div className="divide-y divide-slate-100 p-2">
        {activities.map((act) => (
          <div key={act.id} className="flex items-center justify-between p-3 hover:bg-slate-50/60 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                {getIcon(act.type)}
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-800">{act.action}</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap ml-4">
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentTechnicianActivity;
