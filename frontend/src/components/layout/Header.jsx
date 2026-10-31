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
  TrendingUp,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import storageService from '../../services/storageService';
import PortalSwitcher from './PortalSwitcher';

export const Header = () => {
  const { toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Generate breadcrumb from current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathParts.map((part) =>
    part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
  );

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const list = storageService.getAlerts();
    setNotifications(list);
  }, [location.pathname]);

  const handleMarkAllRead = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 truncate">
          <span className="text-[#0284C7] font-bold">SIMS</span>
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <span className="text-slate-300">/</span>
              <span className={idx === breadcrumb.length - 1 ? 'text-slate-900 font-semibold truncate' : 'hover:text-slate-700'}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* 1-Tap Panel Switcher (Admin <-> Sales) */}
        <div className="pl-2 border-l border-slate-200 hidden sm:block">
          <PortalSwitcher />
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className={`relative w-full transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-[#0284C7] rounded-lg' : ''}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search projects, customers, serial numbers..."
            className="w-full pl-9 pr-12 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none transition-colors"
          />
          <kbd className="hidden lg:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls: System Status, Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Switcher */}
        <div className="sm:hidden">
          <PortalSwitcher />
        </div>

        {/* System Status Pill (Dot Removed as requested) */}
        <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#F0F7FF] border border-[#BAE6FD] text-[#0369A1] text-[11px] font-semibold tracking-wide">
          <span>System Live</span>
        </div>

        {/* Notifications Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]" />
                </span>
              )}
            </button>
          }
        >
          <div className="w-72 sm:w-80">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                Notifications ({notifications.length} active)
              </span>
              {notifications.length > 0 && (
                <span
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-[#0284C7] font-medium cursor-pointer hover:underline"
                >
                  Mark all read
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No unread notifications
                </div>
              ) : (
                notifications.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.actionRoute) navigate(item.actionRoute);
                    }}
                    className="p-3 hover:bg-slate-50 text-xs cursor-pointer flex gap-2.5 items-start"
                  >
                    {item.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : item.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                      <p className="text-slate-500 text-[11px] line-clamp-2">{item.description}</p>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Dropdown>

        {/* User Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition focus:outline-none text-left">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                AD
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">Admin User</div>
                <div className="text-[10px] text-slate-400 leading-tight">Super Administrator</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900">Admin Account</p>
            <p className="text-[11px] text-slate-500 truncate">admin@solar-sims.com</p>
          </div>
          <DropdownItem icon={User} onClick={() => navigate('/admin/profile')}>
            Profile Overview
          </DropdownItem>
          <DropdownItem icon={Shield} onClick={() => navigate('/admin/roles-permissions')}>
            Roles & Permissions
          </DropdownItem>
          <DropdownItem icon={TrendingUp} onClick={() => navigate('/sales/dashboard')}>
            Switch to Sales Portal
          </DropdownItem>
          <div className="border-t border-slate-100 my-1" />
          <DropdownItem icon={LogOut} danger onClick={() => navigate('/login')}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
