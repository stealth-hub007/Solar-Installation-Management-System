import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sun,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import Button from '../../components/common/Button';
import {
  registerUser,
  clearAuthError,
  selectAuthLoading,
  selectAuthError,
} from './authSlice';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score <= 4) return { score, label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-600' };
    return { score, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = calculatePasswordStrength(formData.password);

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Corporate Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid corporate email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (!validate()) return;

    const result = await dispatch(
      registerUser({
        full_name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      // Registration complete: account status is PENDING, route to pending approval
      navigate('/pending-approval');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F0F7FF] to-[#E0F2FE] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-elevated border border-slate-200/90 overflow-hidden">
        {/* Brand Banner */}
        <div className="p-6 bg-gradient-to-r from-[#123C32] to-[#0D2D25] text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
            <Sun className="w-7 h-7 text-amber-400 fill-amber-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Create SIMS Account</h1>
          <p className="text-xs text-emerald-100/80 mt-1">Solar Installation Management System</p>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Staff & Partner Registration</h2>
            <p className="text-xs text-slate-500 mt-1">
              New accounts require Admin approval and role assignment before dashboard activation.
            </p>
          </div>

          {/* Backend Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{authError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: null });
                  }}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    fieldErrors.fullName
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#0284C7] focus:ring-sky-100'
                  }`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="name@sunpower.com"
                  className={`w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
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

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="Minimum 8 characters"
                  className={`w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
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

              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${strength.text}`}>
                    {strength.label}
                  </span>
                </div>
              )}

              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    if (fieldErrors.confirmPassword)
                      setFieldErrors({ ...fieldErrors, confirmPassword: null });
                  }}
                  placeholder="Re-type your password"
                  className={`w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                    fieldErrors.confirmPassword
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#0284C7] focus:ring-sky-100'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Notice Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                Account approval is verified manually by the Admin. You will not have dashboard access until your role is assigned.
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 justify-center shadow-md font-semibold text-sm"
              disabled={loading}
              icon={loading ? Loader2 : ArrowRight}
            >
              {loading ? 'Submitting Registration...' : 'Register Account'}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#0284C7] hover:text-[#0369A1] hover:underline"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
