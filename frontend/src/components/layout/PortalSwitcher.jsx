import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, TrendingUp } from 'lucide-react';

/**
 * Top-bar Segmented One-Tap Portal Switcher
 * Operates like a Light/Dark mode toggle to switch instantly between Admin and Sales panels in 1 tap.
 */
export const PortalSwitcher = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');
  const isSales = location.pathname.startsWith('/sales');

  const handleSwitchToAdmin = () => {
    if (!isAdmin) {
      navigate('/admin/dashboard');
    }
  };

  const handleSwitchToSales = () => {
    if (!isSales) {
      navigate('/sales/dashboard');
    }
  };

  return (
    <div
      className={`inline-flex items-center p-0.5 sm:p-1 bg-slate-100/90 border border-slate-200/90 rounded-xl shadow-inner select-none ${className}`}
      role="tablist"
      aria-label="Panel Selector"
    >
      {/* Admin Panel Button */}
      <button
        type="button"
        role="tab"
        aria-selected={isAdmin}
        onClick={handleSwitchToAdmin}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
          ${
            isAdmin
              ? 'bg-white text-[#0284C7] shadow-sm font-extrabold cursor-default ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 font-medium'
          }
        `}
        title="1-tap switch to Admin Dashboard"
      >
        <Shield
          className={`w-3.5 h-3.5 transition-colors ${
            isAdmin ? 'text-[#0284C7] fill-[#0284C7]/15' : 'text-slate-400'
          }`}
        />
        <span className="leading-none">Admin</span>
        {isAdmin && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] hidden sm:inline-block ml-0.5" />
        )}
      </button>

      {/* Sales Panel Button */}
      <button
        type="button"
        role="tab"
        aria-selected={isSales}
        onClick={handleSwitchToSales}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
          ${
            isSales
              ? 'bg-white text-[#0284C7] shadow-sm font-extrabold cursor-default ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 font-medium'
          }
        `}
        title="1-tap switch to Sales Dashboard"
      >
        <TrendingUp
          className={`w-3.5 h-3.5 transition-colors ${
            isSales ? 'text-[#0284C7]' : 'text-slate-400'
          }`}
        />
        <span className="leading-none">Sales</span>
        {isSales && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] hidden sm:inline-block ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default PortalSwitcher;
