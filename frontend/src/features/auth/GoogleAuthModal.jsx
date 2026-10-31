import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

export const GoogleAuthModal = ({ isOpen, onClose, onAuthenticate, initialEmail = '', loading = false, error = null }) => {
  const [googleEmail, setGoogleEmail] = useState(initialEmail);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setGoogleEmail(initialEmail);
      setValidationError('');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const validateEmail = (val) => {
    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'Enter an email or phone number';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Enter a valid Google email address';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const err = validateEmail(googleEmail);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');
    onAuthenticate(googleEmail.trim().toLowerCase());
  };

  const handleQuickSelect = (email) => {
    setGoogleEmail(email);
    setValidationError('');
    onAuthenticate(email.toLowerCase());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleIn">
        {/* Top Header with Google Branding */}
        <div className="px-6 pt-7 pb-4 text-center relative border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Google 4-Color SVG Logo */}
          <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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
          </div>

          <h3 className="text-xl font-medium text-slate-800 tracking-tight">
            Sign in with Google
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Choose an account or enter your email to continue to <span className="font-semibold text-slate-700">SunPower SIMS</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Google-style Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Google Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="email"
                  value={googleEmail}
                  onChange={(e) => {
                    setGoogleEmail(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="name@gmail.com or corporate email"
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 transition ${
                    validationError
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-[#1a73e8] focus:ring-blue-100'
                  }`}
                />
              </div>
              {validationError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                  {validationError}
                </p>
              )}
            </div>

            {/* Quick Demo Google Accounts */}
            <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Or select an active corporate Google account:
              </span>
              <div className="space-y-1.5">
                {[
                  { email: 'admin@sunpower.com', name: 'Chief Solar Officer', role: 'Admin' },
                  { email: 'vikram.tech@sunpower.com', name: 'Vikram Singh', role: 'Technician' },
                  { email: 'sales@sunpower.com', name: 'Rohan Verma', role: 'Sales' },
                  { email: 'warehouse@sunpower.com', name: 'Anil Sharma', role: 'Warehouse' },
                ].map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickSelect(acc.email)}
                    disabled={loading}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-[#1a73e8] hover:bg-blue-50/50 text-left transition group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-[#1a73e8] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-blue-100 group-hover:text-[#1a73e8] text-slate-600">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Footer */}
        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Google OAuth Key
          </span>
          <span>SunPower SIMS v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;

