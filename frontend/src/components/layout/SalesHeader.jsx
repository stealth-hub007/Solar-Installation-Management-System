import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
  Briefcase,
  Target,
  Plus,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import storageService from '../../services/storageService';
import PortalSwitcher from './PortalSwitcher';

export const SalesHeader = ({ onQuickEnquiry }) => {
  const { toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Auth User check
  const authUser = (() => {
    try {
      const saved = localStorage.getItem('sims_auth_user');
      return saved ? JSON.parse(saved) : { email: 'admin@solar-sims.com', role: 'Super Administrator' };
    } catch {
      return { email: 'admin@solar-sims.com', role: 'Super Administrator' };
    }
  })();

  const isAdminUser =
    !authUser.email?.toLowerCase().includes('sales') ||
    authUser.email?.toLowerCase().includes('admin') ||
    authUser.role?.toLowerCase().includes('admin');
  const displayName = isAdminUser ? (authUser.name || 'Admin User') : (authUser.name || 'Sales Officer');
  const displayEmail = authUser.email || (isAdminUser ? 'admin@solar-sims.com' : 'sales@solar-sims.com');
  const displayRole = isAdminUser ? 'Super Administrator' : 'Sr. Sales Officer';
  const displayInitials = isAdminUser ? 'AD' : 'SO';

  // Generate breadcrumb from current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.map((part) =>
    part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
  );

  useEffect(() => {
    // Sales notifications from activities
    const alerts = storageService.getAlerts();
    setNotifications(alerts.slice(0, 4));
  }, [location.pathname]);

  const handleMarkAllRead = () => {
    setNotifications([]);
  };

  const handleSignOut = () => {
    localStorage.removeItem('sims_auth_token');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle, Breadcrumb & Top 1-Tap Portal Switcher */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Open sales sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 truncate">
          <span className="text-[#0284C7] font-bold">SIMS Sales</span>
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className="text-slate-300">/</span>
              <span
                className={
                  idx === breadcrumb.length - 1
                    ? 'text-slate-800 font-semibold truncate'
                    : 'text-slate-500 hover:text-slate-700 cursor-pointer hidden md:inline truncate'
                }
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* TOP 1-TAP PORTAL SWITCHER */}
        <div className="pl-2 border-l border-slate-200 hidden sm:block">
          <PortalSwitcher />
        </div>
      </div>

      {/* Right: Quick Action, Search, Notifications, Sales Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile 1-Tap Switcher */}
        <div className="sm:hidden">
          <PortalSwitcher />
        </div>

        {/* Quick Action: New Lead */}
        <button
          onClick={() => {
            if (onQuickEnquiry) {
              onQuickEnquiry();
            } else {
              navigate('/sales/enquiries?create=true');
            }
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Lead</span>
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`w-full h-9 pl-9 pr-4 text-xs font-medium rounded-lg border bg-slate-50 transition-all outline-none
              ${
                isSearchFocused
                  ? 'bg-white border-[#0284C7] ring-2 ring-[#E0F2FE]'
                  : 'border-slate-200 hover:border-slate-300'
              }
            `}
          />
        </div>

        {/* Notifications Dropdown */}
        <Dropdown
          trigger={
            <button
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="Sales Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0284C7] ring-2 ring-white" />
              )}
            </button>
          }
          align="right"
          className="w-80"
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-800">Sales Alerts & Leads</span>
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#0284C7] hover:underline font-medium"
              >
                Mark read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div key={item.id} className="p-3 hover:bg-slate-50 transition flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {item.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Info className="w-4 h-4 text-[#0284C7]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-800">{item.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No new sales alerts right now
              </div>
            )}
          </div>
        </Dropdown>

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition">
              <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] font-bold text-xs flex items-center justify-center border border-[#BAE6FD]">
                {displayInitials}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">{displayName}</span>
                <span className="text-[10px] text-slate-500 font-medium">{displayRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          }
          align="right"
          className="w-60"
        >
          <div className="p-3 border-b border-slate-100 bg-[#F0F7FF]/50">
            <p className="text-xs font-bold text-slate-800">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-full inline-flex">
              <Briefcase className="w-3 h-3" /> {isAdminUser ? 'Full System Access' : 'Commercial Sales Representative'}
            </div>
          </div>

          <div className="py-1">
            <DropdownItem icon={Target} onClick={() => navigate('/sales/dashboard')}>
              Sales Targets & KPIs
            </DropdownItem>
            <DropdownItem icon={Shield} onClick={() => navigate('/admin/dashboard')}>
              Switch to Admin Portal
            </DropdownItem>
          </div>

          <div className="border-t border-slate-100 py-1">
            <DropdownItem icon={LogOut} danger onClick={handleSignOut}>
              Sign Out
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default SalesHeader;

