import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  Bell,
  ChevronDown,
  LogOut,
  AlertTriangle,
  Boxes,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import PortalSwitcher from './PortalSwitcher';
import { logoutUser, selectCurrentUser, selectUserRole } from '../../features/auth/authSlice';

export const WarehouseHeader = () => {
  const { toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxUser = useSelector(selectCurrentUser);
  const reduxRole = useSelector(selectUserRole);

  const [notifications] = useState([
    { id: 1, title: 'Low Stock Alert', message: '4 sq.mm DC Cable drum is below reorder threshold', time: '10m ago', type: 'alert' },
    { id: 2, title: 'Pending Dispatch DSP-709', message: 'Kailash Yadav order staged and awaiting vehicle departure', time: '25m ago', type: 'dispatch' },
    { id: 3, title: 'Delivery Confirmed', message: 'DSP-708 delivered on-site to Sunita Agarwal', time: '1h ago', type: 'delivery' },
  ]);

  // Auth User check
  const authUser = reduxUser || (() => {
    try {
      const saved = localStorage.getItem('sims_auth_user');
      return saved ? JSON.parse(saved) : { name: 'Warehouse Officer', email: 'warehouse@sunpower.com', role: 'WAREHOUSE' };
    } catch {
      return { name: 'Warehouse Officer', email: 'warehouse@sunpower.com', role: 'WAREHOUSE' };
    }
  })();

  const role = (reduxRole || authUser.role || '').toUpperCase();
  const displayName = authUser.full_name || authUser.name || 'Warehouse Manager';
  const displayEmail = authUser.email || 'warehouse@sunpower.com';
  const displayRole = role === 'ADMIN' ? 'Super Administrator' : 'Warehouse Manager';
  const displayInitials = displayName.substring(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm shrink-0">
      {/* Left: Mobile Toggle & 1-Tap Portal Switcher */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 1-Tap Portal Switcher */}
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
          <span>Warehouse Live</span>
        </div>

        {/* Notifications */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Warehouse Notifications</span>
            <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 w-72">
            {notifications.map((n) => (
              <div key={n.id} className="p-3 hover:bg-slate-50 transition cursor-pointer text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                  {n.type === 'dispatch' && <Truck className="w-3.5 h-3.5 text-[#0284C7]" />}
                  {n.type === 'delivery' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{n.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</div>
                <div className="text-[9px] text-slate-400 mt-1">{n.time}</div>
              </div>
            ))}
          </div>
        </Dropdown>

        {/* Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {displayInitials}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{displayName}</div>
                <div className="text-[10px] text-slate-400 leading-tight">{displayRole}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-800">{displayName}</div>
            <div className="text-[11px] text-slate-500 truncate">{displayEmail}</div>
            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
              {displayRole}
            </span>
          </div>

          <DropdownItem
            onClick={() => navigate('/warehouse/dashboard')}
            className="text-xs flex items-center gap-2 py-2"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-400" />
            <span>Warehouse Console</span>
          </DropdownItem>

          <DropdownItem
            onClick={handleSignOut}
            className="text-xs flex items-center gap-2 py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};

export default WarehouseHeader;
