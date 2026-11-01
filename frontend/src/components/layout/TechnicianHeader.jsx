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
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import storageService from '../../services/storageService';
import PortalSwitcher from './PortalSwitcher';
import { logoutUser, selectCurrentUser, selectUserRole } from '../../features/auth/authSlice';

export const TechnicianHeader = () => {
  const { toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxUser = useSelector(selectCurrentUser);
  const reduxRole = useSelector(selectUserRole);
  const [notifications, setNotifications] = useState([]);

  // Auth User check
  const authUser = reduxUser || (() => {
    try {
      const saved = localStorage.getItem('sims_auth_user');
      return saved ? JSON.parse(saved) : { email: 'vikram.tech@sunpower.com', name: 'Vikram Singh', role: 'TECHNICIAN' };
    } catch {
      return { email: 'vikram.tech@sunpower.com', name: 'Vikram Singh', role: 'TECHNICIAN' };
    }
  })();

  const role = (reduxRole || authUser.role || '').toUpperCase();
  const displayName = authUser.full_name || authUser.name || 'Vikram Singh';
  const displayEmail = authUser.email || 'vikram.tech@sunpower.com';
  const displayRole = role === 'ADMIN' ? 'Super Administrator' : 'Field Technician (Lead)';
  const displayInitials = displayName.substring(0, 2).toUpperCase();

  useEffect(() => {
    const alerts = [
      { id: 'ALT-1', title: 'Survey scheduled at Civil Lines for 10:30 AM', time: '15m ago', type: 'info' },
      { id: 'ALT-2', title: 'ORD-8001 hardware delivered by warehouse', time: '1h ago', type: 'success' },
      { id: 'ALT-3', title: 'Customer sign-off confirmed on ORD-8003', time: 'Yesterday', type: 'success' },
    ];
    setNotifications(alerts);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 min-h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 sm:px-6 py-2 sm:py-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile Toggle & Top 1-Tap Portal Switcher */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition shrink-0"
          aria-label="Open technician sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* TOP 1-TAP PORTAL SWITCHER */}
        <div className="flex items-center min-w-0">
          <PortalSwitcher />
        </div>
      </div>

      {/* Right: Status Pill, Notifications, Technician Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
        {/* System Status Pill matching Admin */}
        <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#F0F7FF] border border-[#BAE6FD] text-[#0369A1] text-[11px] font-semibold tracking-wide shrink-0">
          <span>System Live</span>
        </div>

        {/* Notifications Dropdown */}
        <Dropdown
          trigger={
            <button
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
          }
          className="w-80"
        >
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800">Technician Alerts</span>
            <span className="text-[10px] text-[#0284C7] font-semibold">{notifications.length} New</span>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {notifications.map((item) => (
              <div key={item.id} className="p-3 hover:bg-slate-50 text-xs">
                <div className="font-medium text-slate-800">{item.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.time}</div>
              </div>
            ))}
          </div>
        </Dropdown>

        {/* Technician User Profile Menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {displayInitials}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                <span className="text-xs font-bold text-slate-800">{displayName}</span>
                <span className="text-[10px] text-slate-500">{displayRole}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>
          }
          className="w-56"
        >
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="text-xs font-bold text-slate-800">{displayName}</div>
            <div className="text-[11px] text-slate-500 truncate">{displayEmail}</div>
            <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-[#0284C7]">
              Field Lead
            </span>
          </div>

          <div className="p-1">
            <DropdownItem icon={User} onClick={() => navigate('/technician/profile')}>
              Technician Profile
            </DropdownItem>
            <DropdownItem icon={Wrench} onClick={() => navigate('/technician/installations')}>
              Installation Jobs
            </DropdownItem>
            <div className="my-1 border-t border-slate-100" />
            <DropdownItem icon={LogOut} danger onClick={handleSignOut}>
              Sign Out
            </DropdownItem>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default TechnicianHeader;
