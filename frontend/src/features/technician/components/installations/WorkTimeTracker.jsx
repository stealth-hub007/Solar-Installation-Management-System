import React, { useState } from 'react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';
import { Clock, Play, Square, CheckCircle2, History } from 'lucide-react';
import useWorkTimer from '../../hooks/useWorkTimer';
import { formatDurationHours } from '../../utils/technicianHelpers';

export const WorkTimeTracker = ({ jobId, onLogHours, workLogs = [] }) => {
  const { isRunning, startTime, elapsedSeconds, startTimer, stopTimer } = useWorkTimer(jobId);
  const [logNotes, setLogNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLogged, setLastLogged] = useState(null);

  const handleStart = () => {
    startTimer();
  };

  const handleStop = async () => {
    const session = stopTimer();
    setIsSubmitting(true);
    try {
      const payload = {
        start_time: session.startTime,
        end_time: session.endTime,
        total_hours: session.totalHours,
        notes: logNotes || 'Field installation & mounting labor',
      };
      if (onLogHours) {
        await onLogHours(payload);
      }
      setLastLogged(session);
      setLogNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Field Labor & Work Time Tracking"
        subtitle="Record on-site working hours for accurate job costing and attendance proof"
        icon={Clock}
      />

      <div className="p-5 space-y-5">
        {/* Timer Control Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg shadow-inner ${
                isRunning ? 'bg-amber-100 text-amber-700 animate-pulse ring-2 ring-amber-400' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isRunning ? 'Work Session Active' : 'Session Inactive'}
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
                {formatDurationHours(elapsedSeconds)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isRunning ? (
              <Button
                variant="primary"
                icon={Play}
                onClick={handleStart}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 font-bold"
              >
                Start On-Site Work
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={Square}
                onClick={handleStop}
                isLoading={isSubmitting}
                className="w-full sm:w-auto font-bold"
              >
                End & Record Work
              </Button>
            )}
          </div>
        </div>

        {isRunning && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Work Notes (Optional)
            </label>
            <input
              type="text"
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="e.g. Assembled rooftop railing; pulled 25m DC string cable..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
            />
          </div>
        )}

        {/* Previous Logged Sessions */}
        {workLogs.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Logged Work Sessions ({workLogs.length})</span>
            </h4>

            <div className="divide-y divide-slate-100">
              {workLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{log.totalHours} hrs logged</span>
                    <span className="text-slate-500 block text-[11px] truncate max-w-[280px]">
                      {log.notes || 'Installation labor'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {log.startTime ? new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WorkTimeTracker;

