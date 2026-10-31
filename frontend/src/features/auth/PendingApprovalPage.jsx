import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Clock,
  RefreshCw,
  LogOut,
  User,
  Mail,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Sun,
} from 'lucide-react';
import Button from '../../components/common/Button';
import {
  refreshAccountStatus,
  logoutUser,
  selectCurrentUser,
  selectAccountStatus,
} from './authSlice';
import { getDashboardForRole } from '../../components/auth/PublicRoute';

export const PendingApprovalPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector(selectCurrentUser);
  const accountStatus = useSelector(selectAccountStatus);

  const [refreshing, setRefreshing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('info'); // 'info' | 'success' | 'warning'

  const storedPending = (() => {
    try {
      const p = localStorage.getItem('sims_pending_user') || localStorage.getItem('sims_auth_user');
      return p ? JSON.parse(p) : null;
    } catch {
      return null;
    }
  })();
  const user = currentUser || storedPending;
  const userEmail = user?.email || 'Registered User';
  const userName = user?.full_name || user?.name || 'SIMS Team Member';

  // Check if status is already approved on initial load or transition
  useEffect(() => {
    if (accountStatus === 'APPROVED') {
      navigate(getDashboardForRole(currentUser?.role));
    } else if (accountStatus === 'REJECTED') {
      navigate('/account-rejected');
    } else if (accountStatus === 'SUSPENDED') {
      navigate('/account-suspended');
    }
  }, [accountStatus, currentUser, navigate]);

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    setFeedbackMessage('');

    try {
      const result = await dispatch(refreshAccountStatus());

      if (refreshAccountStatus.fulfilled.match(result)) {
        const { account_status, role } = result.payload;
        const normalized = (account_status || '').toUpperCase();

        if (normalized === 'APPROVED') {
          setFeedbackType('success');
          setFeedbackMessage('Great news! Your account has been approved by the Administrator. Redirecting to your dashboard...');
          setTimeout(() => {
            navigate(getDashboardForRole(role));
          }, 1200);
        } else if (normalized === 'REJECTED') {
          navigate('/account-rejected');
        } else if (normalized === 'SUSPENDED') {
          navigate('/account-suspended');
        } else {
          setFeedbackType('info');
          setFeedbackMessage('Status checked: Your account is still under administrative review. Please check back shortly.');
        }
      } else {
        setFeedbackType('warning');
        setFeedbackMessage(result.payload || 'Could not verify status. Please ensure server connectivity.');
      }
    } catch {
      setFeedbackType('warning');
      setFeedbackMessage('Connection issue while checking status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0FDF4] to-[#EFF6FF] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden text-center">
        {/* Top Decorative Header */}
        <div className="p-8 bg-gradient-to-r from-[#123C32] to-[#0A2620] text-white relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/30 backdrop-blur flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Clock className="w-9 h-9 text-amber-400 animate-pulse" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
            Pending Approval
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Acceptance Pending from Admin
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-sm mx-auto">
            Your SIMS account has been successfully created and submitted for verification.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* User Profile Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-left space-y-2.5">
            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Registered Profile Details
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0284C7]/10 text-[#0284C7] flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-slate-900 truncate">{userName}</div>
                <div className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{userEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Message */}
          <div className="text-left p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 leading-relaxed space-y-2">
            <div className="font-bold text-sky-950 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#0284C7]" />
              Account Review in Progress
            </div>
            <p>
              Your registration has been completed successfully. Your account is currently under review. The administrator will review your profile and assign the appropriate access role. You will be able to access the SIMS dashboard once your account is approved.
            </p>
          </div>

          {/* Dynamic Status Feedback Banner */}
          {feedbackMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 text-left animate-fadeIn ${
                feedbackType === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : feedbackType === 'warning'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {feedbackType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{feedbackMessage}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm font-bold shadow-md h-11"
              onClick={handleRefreshStatus}
              disabled={refreshing}
              icon={RefreshCw}
            >
              {refreshing ? 'Checking Approval Status...' : 'Refresh Status'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full justify-center text-slate-600 hover:text-slate-900 border-slate-200"
              onClick={handleLogout}
              icon={LogOut}
            >
              Sign Out & Return to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
