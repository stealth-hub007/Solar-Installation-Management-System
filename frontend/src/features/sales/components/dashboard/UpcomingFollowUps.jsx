import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Users,
} from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from '../../../../components/ui/StatusBadge';

export const UpcomingFollowUps = ({
  followUps = [],
  onComplete,
  onReschedule,
}) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'overdue'

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = followUps.filter((f) => {
    if (filter === 'today') return f.followUpDate === todayStr;
    if (filter === 'overdue') return f.status === 'Overdue';
    return true;
  });

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#0284C7]" />
            Follow-ups & Outreach
          </h3>
          <p className="text-[11px] text-slate-500">Scheduled client calls and customer meetings</p>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              filter === 'all' ? 'bg-[#E0F2FE] text-[#0284C7] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              filter === 'today' ? 'bg-[#E0F2FE] text-[#0284C7] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              filter === 'overdue' ? 'bg-rose-50 text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[340px]">
        {filtered.length > 0 ? (
          filtered.slice(0, 5).map((item) => {
            const isOverdue = item.status === 'Overdue';

            return (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {item.customerName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({item.enquiryId})</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-1">{item.purpose}</p>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#0284C7]" />
                      {item.followUpDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.followUpTime}
                    </span>
                    <span className="text-[#0284C7] font-medium">{item.type}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {onComplete && item.status !== 'Completed' && (
                    <button
                      onClick={() => onComplete(item)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Mark follow-up completed"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  {onReschedule && item.status !== 'Completed' && (
                    <button
                      onClick={() => onReschedule(item)}
                      className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No follow-ups matching this filter.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-end">
        <button
          onClick={() => navigate('/sales/follow-ups')}
          className="text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1 transition"
        >
          View all follow-up schedule <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};

export default UpcomingFollowUps;

