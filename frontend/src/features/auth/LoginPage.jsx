import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sun,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import GoogleAuthModal from './GoogleAuthModal';
import {
  loginUser,
  googleLoginUser,
  clearAuthError,
  selectAuthLoading,
  selectAuthError,
} from './authSlice';
import { getDashboardForRole } from '../../components/auth/PublicRoute';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [email, setEmail] = useState('admin@sunpower.com');
  const [password, setPassword] = useState('Admin@12345Password');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSuccess = (user, accountStatus) => {
    const status = (accountStatus || user?.account_status || 'APPROVED').toUpperCase();
    if (status === 'PENDING') {
      navigate('/pending-approval');
    } else if (status === 'REJECTED') {
      navigate('/account-rejected');
    } else if (status === 'SUSPENDED') {
      navigate('/account-suspended');
    } else {
      navigate(getDashboardForRole(user?.role));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (!validateForm()) return;

    const result = await dispatch(
      loginUser({
        email: email.trim(),
        password,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      const { user, account_status } = result.payload;
      handleLoginSuccess(user, account_status);
    }
  };

  const handleGoogleSignIn = () => {
    dispatch(clearAuthError());
    setIsGoogleModalOpen(true);
  };

  const handleGoogleModalAuthenticate = async (googleEmail) => {
    const googleAuthKey = import.meta.env.VITE_GOOGLE_AUTH_KEY;
    const googlePayload = {
      credential: googleAuthKey || ('google_oauth_token_' + Date.now()),
      email: googleEmail,
    };

    const result = await dispatch(googleLoginUser(googlePayload));
    if (googleLoginUser.fulfilled.match(result)) {
      setIsGoogleModalOpen(false);
      const { user, account_status } = result.payload;
      handleLoginSuccess(user, account_status);
    }
  };

  // Quick-fill credentials helper for evaluation
  const setDemoAccount = (demEmail, demPass) => {
    setEmail(demEmail);
    setPassword(demPass);
    setFieldErrors({});
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0F7FF] to-[#E0F2FE] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200/90 overflow-hidden">
        {/* Brand Banner */}
        <div className="p-7 bg-gradient-to-r from-[#123C32] to-[#0D2D25] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sun className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Solar Management System</h1>
          <p className="text-xs text-emerald-100/80 mt-1">SIMS Enterprise Operational Cloud</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your corporate credentials or Google Workspace
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="name@sunpower.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    fieldErrors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#0284C7] focus:ring-sky-100'
                  }`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#0284C7] hover:text-[#0369A1] font-semibold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    fieldErrors.password
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#0284C7] focus:ring-sky-100'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 justify-center shadow-md font-semibold text-sm"
              disabled={loading}
              icon={loading ? Loader2 : ArrowRight}
            >
              {loading ? 'Authenticating...' : 'Sign In to SIMS'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition shadow-xs hover:border-slate-400 active:bg-slate-100"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Instant Demo Logins:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('admin@sunpower.com', 'admin123')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-left font-medium transition"
              >
                <div className="font-bold">Super Admin</div>
                <div className="text-[10px] text-emerald-600 truncate">All 4 Dashboards</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('sales@sunpower.com', 'sales123')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-left font-medium transition"
              >
                <div className="font-bold">Sales Lead</div>
                <div className="text-[10px] text-amber-600 truncate">Quotes & Enquiries</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('warehouse@sunpower.com', 'warehouse123')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-left font-medium transition"
              >
                <div className="font-bold">Warehouse</div>
                <div className="text-[10px] text-purple-600 truncate">Stock & Dispatch</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('vikram.tech@sunpower.com', 'tech123')}
                className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 text-left font-medium transition"
              >
                <div className="font-bold">Technician</div>
                <div className="text-[10px] text-sky-600 truncate">Field App & Tasks</div>
              </button>
            </div>
          </div>

          {/* Footer Register Link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onAuthenticate={handleGoogleModalAuthenticate}
        initialEmail={email}
        loading={loading}
        error={authError}
      />
    </div>
  );
};

export default LoginPage;
