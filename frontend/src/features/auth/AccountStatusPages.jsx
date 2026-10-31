import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  XCircle,
  AlertOctagon,
  ShieldAlert,
  LogOut,
  ArrowLeft,
  Mail,
  Home,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { logoutUser, selectCurrentUser, selectUserRole } from './authSlice';
import { getDashboardForRole } from '../../components/auth/PublicRoute';

/**
 * Account Rejected View
 */
export const AccountRejectedPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#FFF1F2] to-[#FFE4E6] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-rose-200 overflow-hidden text-center">
        <div className="p-8 bg-gradient-to-r from-rose-700 to-rose-900 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <XCircle className="w-9 h-9 text-rose-200" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/30 text-rose-100 border border-rose-400/30 mb-2">
            Access Rejected
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Registration Denied
          </h1>
          <p className="text-xs text-rose-100 mt-1">
            Your application for SIMS access was not approved by the administrator.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-left text-xs text-rose-900 space-y-2">
            <div className="font-bold">Reason Provided:</div>
            <p className="text-rose-700 italic">
              {currentUser?.rejection_reason ||
                'The administrator determined that your profile does not meet current organizational verification requirements or lacks departmental authorization.'}
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            If you believe this was an error, please reach out directly to your organization&apos;s SIMS Administrator or IT Support team.
          </p>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-center text-sm font-semibold border-slate-200 h-11"
            onClick={handleLogout}
            icon={LogOut}
          >
            Sign Out & Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Account Suspended View
 */
export const AccountSuspendedPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#FFFBEB] to-[#FEF3C7] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-amber-200 overflow-hidden text-center">
        <div className="p-8 bg-gradient-to-r from-amber-600 to-amber-800 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <AlertOctagon className="w-9 h-9 text-amber-200" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/30 text-amber-100 border border-amber-400/30 mb-2">
            Account Suspended
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Access Temporarily Disabled
          </h1>
          <p className="text-xs text-amber-100 mt-1">
            Your credentials have been placed on administrative hold.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-left text-xs text-amber-900 space-y-2">
            <div className="font-bold">Administrative Notice:</div>
            <p className="text-amber-800">
              Your account access has been suspended by the system administrator. During suspension, API tokens and portal capabilities are deactivated.
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Please contact SIMS Operations Security or your departmental head to request review and account reactivation.
          </p>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full justify-center text-sm font-semibold border-slate-200 h-11"
            onClick={handleLogout}
            icon={LogOut}
          >
            Sign Out & Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Unauthorized / 403 Forbidden View
 */
export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);

  const handleReturnToDashboard = () => {
    navigate(getDashboardForRole(role));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-center">
        <div className="p-8 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <ShieldAlert className="w-9 h-9 text-rose-400" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/30 mb-2">
            403 - Access Denied
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Unauthorized Module
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            You do not possess the required security permissions to access this section.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Your role does not grant permission to view this portal. Normal accounts may only view their assigned functional module. If you require higher operational permissions, contact your System Administrator.
          </p>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm font-semibold shadow-md h-11"
              onClick={handleReturnToDashboard}
              icon={Home}
            >
              Go to Your Authorized Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default {
  AccountRejectedPage,
  AccountSuspendedPage,
  UnauthorizedPage,
};
