import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Shield,
  LogOut,
  AlertTriangle,
  Info,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import storageService from '../../services/storageService';
import PortalSwitcher from './PortalSwitcher';
import { logoutUser, selectCurrentUser } from '../../features/auth/authSlice';

export const Header = () => {
  const { toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxUser = useSelector(selectCurrentUser);
  const [notifications, setNotifications] = useState([]);

  // Retrieve authenticated user with redux fallback to local storage
  const currentUser = reduxUser || (() => {
    try {
      const stored = localStorage.getItem('sims_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })() || {
    full_name: 'Admin User',
    name: 'Admin User',
    email: 'admin@sunpower.com',
    role: 'ADMIN',
  };

  const displayName = currentUser.full_name || currentUser.name || 'Admin User';
  const displayEmail = currentUser.email || 'admin@sunpower.com';
  const displayRole = currentUser.role === 'ADMIN' ? 'Super Administrator' : currentUser.role;

  useEffect(() => {
    const list = storageService.getAlerts();
    setNotifications(list);
  }, [location.pathname]);

  const handleMarkAllRead = () => {
    setNotifications([]);
  };

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & 1-Tap Panel Switcher */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 1-Tap Panel Switcher (Admin <-> Sales <-> Warehouse <-> Technician) */}
        <div className="hidden sm:block shrink-0">
          <PortalSwitcher />
        </div>
      </div>

      {/* Right Controls: System Status, Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Switcher */}
        <div className="sm:hidden">
          <PortalSwitcher />
        </div>

        {/* System Status Pill */}
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
          <div className="w-72 sm:w-80 max-w-[calc(100vw-2rem)]">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white font-semibold text-xs flex items-center justify-center shadow-xs uppercase">
                {displayName.slice(0, 2)}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {displayRole}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
          </div>
          <DropdownItem icon={User} onClick={() => navigate('/admin/profile')}>
            Profile Overview
          </DropdownItem>
          <DropdownItem icon={UserCheck} onClick={() => navigate('/admin/users')}>
            User Management & Approvals
          </DropdownItem>
          <DropdownItem icon={Shield} onClick={() => navigate('/admin/roles-permissions')}>
            Roles & Permissions
          </DropdownItem>
          <DropdownItem icon={TrendingUp} onClick={() => navigate('/sales/dashboard')}>
            Switch to Sales Portal
          </DropdownItem>
          <div className="border-t border-slate-100 my-1" />
          <DropdownItem icon={LogOut} danger onClick={handleSignOut}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
