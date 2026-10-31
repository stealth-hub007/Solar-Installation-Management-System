import React, { useState } from 'react';
import {
  AlertTriangle,
  XCircle,
  AlertOctagon,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import userAPI from './userAPI';

export const StatusChangeModal = ({ isOpen, onClose, user, actionType, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const isReject = actionType === 'reject';
  const isSuspend = actionType === 'suspend';
  const isReactivate = actionType === 'reactivate';

  const title = isReject
    ? 'Reject User Application'
    : isSuspend
    ? 'Suspend User Account'
    : 'Reactivate User Account';

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      if (isReject) {
        await userAPI.rejectUser(user.id, {
          reason: reason.trim() || 'Application rejected by administrator.',
        });
      } else if (isSuspend) {
        await userAPI.suspendUser(user.id, {
          reason: reason.trim() || 'Account suspended by administrator.',
        });
      } else if (isReactivate) {
        await userAPI.reactivateUser(user.id);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            isReject
              ? 'bg-rose-700'
              : isSuspend
              ? 'bg-amber-600'
              : 'bg-emerald-700'
          }`}
        >
          <div className="flex items-center gap-3">
            {isReject && <XCircle className="w-6 h-6 text-rose-200" />}
            {isSuspend && <AlertOctagon className="w-6 h-6 text-amber-200" />}
            {isReactivate && <CheckCircle2 className="w-6 h-6 text-emerald-200" />}
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-white/80">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-white/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600 leading-relaxed">
            {isReject &&
              `Are you sure you want to reject the registration application for ${user.full_name || user.email}? The user will be unable to access any SIMS dashboard.`}
            {isSuspend &&
              `Are you sure you want to suspend ${user.full_name || user.email}? Their credentials will be deactivated and active sessions terminated.`}
            {isReactivate &&
              `Reactivating ${user.full_name || user.email} will restore their previous operational role and dashboard access immediately.`}
          </p>

          {(isReject || isSuspend) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason / Internal Justification (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter justification for audit log..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-[#0284C7] transition"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isReject || isSuspend ? 'danger' : 'primary'}
            size="md"
            onClick={handleConfirm}
            disabled={loading}
            icon={loading ? Loader2 : null}
          >
            {loading ? 'Processing...' : `Confirm ${actionType}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
