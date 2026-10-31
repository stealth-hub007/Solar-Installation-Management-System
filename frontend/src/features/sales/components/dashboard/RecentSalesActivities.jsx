import React from 'react';
import Card from '../../../../components/ui/Card';
import formatDate from '../../../../utils/formatDate';
import {
  Activity,
  UserCheck,
  FileCheck,
  PhoneForwarded,
  ClipboardList,
  ShoppingCart,
  Send,
} from 'lucide-react';

export const RecentSalesActivities = ({ activities = [] }) => {
  const getIcon = (module) => {
    switch (module) {
      case 'Customers':
        return <UserCheck className="w-3.5 h-3.5 text-blue-500" />;
      case 'Enquiries':
        return <Send className="w-3.5 h-3.5 text-sky-500" />;
      case 'Sales Follow-ups':
        return <PhoneForwarded className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Site Surveys':
        return <ClipboardList className="w-3.5 h-3.5 text-amber-500" />;
      case 'Quotations':
        return <FileCheck className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Sales Orders':
        return <ShoppingCart className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0284C7]" />
            Recent Sales Activities
          </h3>
          <p className="text-[11px] text-slate-500">Live operational audit trail of customer deals</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Live Feed
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto mt-2">
        {activities.length > 0 ? (
          activities.slice(0, 6).map((item) => (
            <div key={item.id} className="py-2.5 flex items-start gap-3">
              <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {getIcon(item.module)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 leading-snug">{item.activity}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-600">{item.user}</span>
                  <span>•</span>
                  <span>{formatDate(item.timestamp, true)}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                    {item.module}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent activity logged.
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecentSalesActivities;

