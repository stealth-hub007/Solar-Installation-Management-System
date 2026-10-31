import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  ArrowRight,
  Plus,
  Check,
} from 'lucide-react';
import Card, { CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import Skeleton from '../../../components/common/Skeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import AlertModal from './modals/AlertModal';
import { formatRelativeTime } from '../../../utils/formatDate';

export const OperationalAlerts = ({
  alerts = [],
  filterSeverity = 'all',
  onFilterChange,
  isLoading = false,
  error = null,
  onRetry,
  onCreateAlert,
  onDismissAlert,
}) => {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filterTabs = [
    { label: 'All', value: 'all' },
    { label: 'Critical', value: 'critical' },
    { label: 'Warning', value: 'warning' },
    { label: 'Info', value: 'info' },
  ];

  const severityIconMap = {
    critical: <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />,
  };

  const severityBorderMap = {
    critical: 'border-l-4 border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/60',
    warning: 'border-l-4 border-l-amber-500 bg-amber-50/30 hover:bg-amber-50/60',
    info: 'border-l-4 border-l-sky-500 bg-sky-50/30 hover:bg-sky-50/60',
  };

  const severityBadgeMap = {
    critical: 'critical',
    warning: 'warning',
    info: 'info',
  };

  const handleCreateSubmit = async (formData) => {
    if (onCreateAlert) {
      await onCreateAlert(formData);
      setIsCreateOpen(false);
    }
  };

  const tabsSelector = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange && onFilterChange(tab.value)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              filterSeverity === tab.value
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Button
        variant="forestOutline"
        size="xs"
        icon={Plus}
        onClick={() => setIsCreateOpen(true)}
      >
        Broadcast Alert
      </Button>
    </div>
  );

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        icon={AlertTriangle}
        title="Operational Action Alerts"
        subtitle="Critical system events requiring administrative attention"
        action={tabsSelector}
      />

      <div className="space-y-3 mt-1 flex-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))
        ) : error ? (
          <ErrorMessage message={error} onRetry={onRetry} />
        ) : alerts.length === 0 ? (
          <EmptyState
            title="All clear! No alerts"
            description="There are no operational alerts matching the selected severity."
          />
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border border-slate-200/80 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  severityBorderMap[alert.severity] || 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {severityIconMap[alert.severity] || <Info className="w-4 h-4 text-slate-500" />}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                        {alert.title}
                      </h4>
                      <Badge
                        variant={severityBadgeMap[alert.severity] || 'neutral'}
                        size="sm"
                        dot
                      >
                        {alert.severity ? alert.severity.toUpperCase() : 'INFO'}
                      </Badge>
                      {alert.module && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {alert.module}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(alert.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {onDismissAlert && (
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="Mark as resolved / dismiss"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {alert.actionRoute && (
                    <button
                      onClick={() => navigate(alert.actionRoute)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] px-2.5 py-1.5 rounded-md hover:bg-white/80 border border-transparent hover:border-slate-200 transition"
                    >
                      <span>Resolve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast Alert Modal */}
      {isCreateOpen && (
        <AlertModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
    </Card>
  );
};

export default OperationalAlerts;
