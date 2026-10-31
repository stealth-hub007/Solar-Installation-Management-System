import React from 'react';
import { CheckSquare, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import Card from '../../../../components/ui/Card';

const DEFAULT_TASKS = [
  {
    id: 'TASK-1',
    title: 'Prepare revised commercial proposal for Mukesh Choudhary (30 kW)',
    dueDate: 'Today, 05:00 PM',
    priority: 'High',
    tag: 'Quotation',
  },
  {
    id: 'TASK-2',
    title: 'Call back lead Sunita Agarwal regarding DISCOM net-metering subsidy',
    dueDate: 'Today, 03:00 PM',
    priority: 'High',
    tag: 'Follow-up',
  },
  {
    id: 'TASK-3',
    title: 'Assign Field Surveyor for sitapura site inspection (SRV-202)',
    dueDate: 'Tomorrow, 10:00 AM',
    priority: 'Medium',
    tag: 'Site Survey',
  },
  {
    id: 'TASK-4',
    title: 'Collect advance milestone token payment for Modern Public School (ORD-902)',
    dueDate: 'Nov 02',
    priority: 'Medium',
    tag: 'Order',
  },
];

export const PendingTasks = ({ tasks = DEFAULT_TASKS }) => {
  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#0284C7]" />
              Action Items & Pending Tasks
            </h3>
            <p className="text-[11px] text-slate-500">Urgent items requiring sales intervention</p>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            {tasks.length} Pending
          </span>
        </div>

        <div className="divide-y divide-slate-100 mt-2 space-y-1">
          {tasks.map((task) => (
            <div key={task.id} className="py-2.5 flex items-start gap-2.5">
              <input
                type="checkbox"
                className="mt-1 w-3.5 h-3.5 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{task.title}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.dueDate}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded font-bold ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#E0F2FE] text-[#0284C7] font-semibold">
                    {task.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Task updates sync with CRM pipeline</span>
        <span className="font-semibold text-[#0284C7]">Automated Sync</span>
      </div>
    </Card>
  );
};

export default PendingTasks;

