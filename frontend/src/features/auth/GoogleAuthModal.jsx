import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/* ─── Realistic Google "Choose an account" picker ──────────────────────────
   Mimics the exact layout of the real Google OAuth account-selection screen:
   • Google logo + app name header
   • Avatar-based account tiles
   • "Use another account" expander with email input
   • Footer with Privacy / Terms links
   ─────────────────────────────────────────────────────────────────────────── */

const GOOGLE_ACCOUNTS = [
  {
    email: 'admin@sunpower.com',
    name: 'Chief Solar Officer',
    initials: 'CS',
    avatarBg: '#1a73e8',
    role: 'Admin',
  },
  {
    email: 'vikram.tech@sunpower.com',
    name: 'Vikram Singh',
    initials: 'VS',
    avatarBg: '#34a853',
    role: 'Technician',
  },
  {
    email: 'sales@sunpower.com',
    name: 'Rohan Verma',
    initials: 'RV',
    avatarBg: '#fbbc04',
    role: 'Sales',
  },
  {
    email: 'warehouse@sunpower.com',
    name: 'Anil Sharma',
    initials: 'AS',
    avatarBg: '#ea4335',
    role: 'Warehouse',
  },
];

/* Google coloured "G" logo */
const GoogleG = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

/* Google wordmark SVG */
const GoogleWordmark = () => (
  <svg height="24" viewBox="0 0 74 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.94 1.08 11.98 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.9 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24z"/>
    <path fill="#EA4335" d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z"/>
    <path fill="#FBBC05" d="M53.58 7.49h-.09c-.57-.68-1.67-1.3-3.06-1.3C47.53 6.19 45 8.72 45 12c0 3.26 2.53 5.81 5.43 5.81 1.39 0 2.49-.62 3.06-1.32h.09v.81c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.53-1.12-2.93-2.07l-2.22.92c.64 1.54 2.33 3.43 5.15 3.43 2.99 0 5.52-1.76 5.52-6.05V6.49h-2.42v1zm-2.93 8.03c-1.76 0-3.1-1.5-3.1-3.52 0-2.05 1.34-3.52 3.1-3.52 1.74 0 3.1 1.5 3.1 3.54.01 2.03-1.36 3.5-3.1 3.5z"/>
    <path fill="#34A853" d="M38 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z"/>
    <path fill="#4285F4" d="M58 .24h2.51v17.57H58z"/>
    <path fill="#EA4335" d="M68.26 15.52c-1.3 0-2.22-.59-2.82-1.76l7.77-3.21-.26-.66c-.48-1.3-1.96-3.7-4.97-3.7-2.99 0-5.48 2.35-5.48 5.81 0 3.26 2.46 5.81 5.76 5.81 2.66 0 4.2-1.63 4.84-2.57l-1.98-1.32c-.66.96-1.56 1.6-2.86 1.6zm-.18-7.15c1.03 0 1.91.53 2.2 1.28l-5.25 2.17c0-2.44 1.73-3.45 3.05-3.45z"/>
  </svg>
);

export const GoogleAuthModal = ({
  isOpen,
  onClose,
  onAuthenticate,
  initialEmail = '',
  loading = false,
  error = null,
}) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [signingIn, setSigningIn] = useState(null); // which account is being signed in

  useEffect(() => {
    if (isOpen) {
      setShowEmailInput(false);
      setCustomEmail(initialEmail || '');
      setEmailError('');
      setSigningIn(null);
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleAccountClick = (email) => {
    setSigningIn(email);
    onAuthenticate(email);
  };

  const handleCustomEmailSubmit = (e) => {
    e.preventDefault();
    const trimmed = customEmail.trim();
    if (!trimmed) {
      setEmailError('Enter an email or phone number');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address');
      return;
    }
    setEmailError('');
    setSigningIn(trimmed);
    onAuthenticate(trimmed.toLowerCase());
  };

  return (
    /* ── Overlay ── */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in with Google"
    >
      {/* ── Card ── */}
      <div
        className="relative bg-white overflow-hidden"
        style={{
          width: 400,
          borderRadius: 28,
          boxShadow: '0 2px 6px 2px rgba(60,64,67,.15), 0 1px 2px rgba(60,64,67,.3)',
          fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
        }}
      >
        {/* ── Top bar: Google logo ── */}
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <GoogleWordmark />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 400, color: '#202124', margin: '0 0 8px', lineHeight: 1.3333 }}>
            Choose an account
          </h1>
          <p style={{ fontSize: 14, color: '#5f6368', margin: '0 0 20px', lineHeight: 1.5 }}>
            to continue to{' '}
            <span style={{ fontWeight: 500, color: '#202124' }}>SunPower SIMS</span>
          </p>

          {/* Error banner */}
          {error && (
            <div style={{
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 8,
              background: '#fce8e6',
              color: '#c5221f',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* ── Account list ── */}
        <div style={{ paddingBottom: 8 }}>
          {GOOGLE_ACCOUNTS.map((acc) => {
            const isThisLoading = loading && signingIn === acc.email;
            return (
              <button
                key={acc.email}
                type="button"
                disabled={loading}
                onClick={() => handleAccountClick(acc.email)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  cursor: loading ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s',
                  gap: 16,
                  opacity: loading && signingIn !== acc.email ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#f8f9fa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: acc.avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}>
                  {isThisLoading
                    ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    : acc.initials}
                </div>

                {/* Name / email */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#202124',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }}>
                    {acc.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#5f6368',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }}>
                    {acc.email}
                  </div>
                </div>

                {/* Role badge */}
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#5f6368',
                  background: '#f1f3f4',
                  borderRadius: 12,
                  padding: '2px 10px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {acc.role}
                </div>
              </button>
            );
          })}

          {/* ── Use another account ── */}
          <button
            type="button"
            disabled={loading}
            onClick={() => { setShowEmailInput((v) => !v); setEmailError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              gap: 16,
              textAlign: 'left',
              transition: 'background 0.1s',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#f8f9fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            {/* person-add icon */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid #dadce0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg height="20" width="20" viewBox="0 0 24 24" fill="#5f6368">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>
              Use another account
            </div>
          </button>

          {/* ── Inline email input (expands when "Use another account" clicked) ── */}
          {showEmailInput && (
            <form onSubmit={handleCustomEmailSubmit} style={{ padding: '4px 24px 16px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  autoFocus
                  type="email"
                  value={customEmail}
                  onChange={(e) => { setCustomEmail(e.target.value); setEmailError(''); }}
                  placeholder="Email or phone"
                  disabled={loading}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '13px 16px',
                    fontSize: 16,
                    border: emailError ? '2px solid #d93025' : '1px solid #dadce0',
                    borderRadius: 4,
                    outline: 'none',
                    color: '#202124',
                    fontFamily: 'inherit',
                    background: '#fff',
                  }}
                  onFocus={(e) => { if (!emailError) e.target.style.border = '2px solid #1a73e8'; }}
                  onBlur={(e) => { if (!emailError) e.target.style.border = '1px solid #dadce0'; }}
                />
                {emailError && (
                  <p style={{ fontSize: 12, color: '#d93025', margin: '4px 0 0 4px' }}>{emailError}</p>
                )}
              </div>

              <p style={{ fontSize: 13, color: '#5f6368', margin: '12px 0', lineHeight: 1.5 }}>
                Not your computer? Use a Private Window to sign in.{' '}
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#1a73e8', textDecoration: 'none' }}>
                  Learn more
                </a>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ fontSize: 14, fontWeight: 500, color: '#1a73e8', textDecoration: 'none' }}
                >
                  Create account
                </a>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    style={{
                      padding: '0 24px',
                      height: 36,
                      borderRadius: 4,
                      border: 'none',
                      background: 'none',
                      color: '#1a73e8',
                      fontWeight: 500,
                      fontSize: 14,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '0 24px',
                      height: 36,
                      borderRadius: 4,
                      border: 'none',
                      background: '#1a73e8',
                      color: '#fff',
                      fontWeight: 500,
                      fontSize: 14,
                      cursor: loading ? 'default' : 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading && signingIn === customEmail.trim() ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : null}
                    Next
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer: Privacy / Terms ── */}
        <div style={{
          borderTop: '1px solid #e8eaed',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12, color: '#5f6368', textDecoration: 'none' }}>English (India)</a>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12, color: '#5f6368', textDecoration: 'none' }}>Help</a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12, color: '#5f6368', textDecoration: 'none' }}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 12, color: '#5f6368', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </div>

      {/* Spin keyframes injected inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GoogleAuthModal;
