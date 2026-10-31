import React, { useState, useEffect, useCallback } from 'react';
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
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import axiosInstance from '../../services/axiosInstance';
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
  const [loadingNotifs, setLoadingNotifs] = useState(false);

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

  // Fetch real notifications from backend API with fallback
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      const list = response.data?.data || response.data || [];
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch {
      // If error or unauthenticated, fallback to storageService
      const list = storageService.getAlerts();
      setNotifications(list || []);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Auto-poll notifications every 6 seconds so new access requests appear in real-time
    const interval = setInterval(() => {
      fetchNotifications();
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchNotifications, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.patch('/notifications/mark-all-read');
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (item) => {
    try {
      if (item.id && !item.is_read) {
        await axiosInstance.patch(`/notifications/${item.id}/read`);
      }
    } catch {
      // ignore
    }

    // Direct routing for user registrations or approvals
    if (item.event_type === 'USER_REGISTRATION' || item.title?.toLowerCase().includes('access request') || item.title?.toLowerCase().includes('pending')) {
      navigate('/admin/users');
    } else if (item.actionRoute) {
      navigate(item.actionRoute);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : notifications.length > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284C7]" />
                </span>
              ) : null}
            </button>
          }
        >
          <div className="w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    {unreadCount} unread
                  </span>
                )}
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-[#0284C7] font-semibold hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No unread notifications
                </div>
              ) : (
                notifications.slice(0, 10).map((item) => {
                  const isUserReg = item.event_type === 'USER_REGISTRATION';
                  const isPending = item.title?.toLowerCase().includes('pending') || item.title?.toLowerCase().includes('request');

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3 text-xs cursor-pointer flex gap-3 items-start transition ${
                        !item.is_read ? 'bg-sky-50/40 hover:bg-sky-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      {isUserReg || isPending ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <UserPlus className="w-4 h-4" />
                        </div>
                      ) : item.event_type === 'ACCOUNT_APPROVED' ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <UserCheck className="w-4 h-4" />
                        </div>
                      ) : item.severity === 'critical' ? (
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Info className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`font-semibold text-slate-900 truncate ${!item.is_read ? 'font-bold' : ''}`}>
                            {item.title}
                          </p>
                          {!item.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                          {item.message || item.description}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                          <span>
                            {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                          </span>
                          {(isUserReg || isPending) && (
                            <span className="inline-flex items-center gap-0.5 text-[#0284C7] font-bold hover:underline">
                              <span>Review & Approve</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className="text-[11px] font-bold text-[#0284C7] hover:underline"
                >
                  Go to User Management & Role Approvals →
                </button>
              </div>
            )}
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
