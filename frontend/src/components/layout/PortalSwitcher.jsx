import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Shield, TrendingUp, Boxes, Wrench } from 'lucide-react';
import { selectUserRole, selectUserPermissions } from '../../features/auth/authSlice';

/**
 * Top-bar Segmented One-Tap Portal Switcher
 * - Admin has authorized access to switch across all four portals: Admin, Sales, Warehouse, and Technician.
 * - Non-admin users are restricted to their authorized role tab only (unauthorized tabs are hidden).
 */
export const PortalSwitcher = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const reduxRole = useSelector(selectUserRole);
  const reduxPermissions = useSelector(selectUserPermissions);

  const storedUser = (() => {
    try {
      const u = localStorage.getItem('sims_auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const role = (reduxRole || storedUser?.role || '')?.toUpperCase();
  const permissions = reduxPermissions?.length > 0 ? reduxPermissions : (storedUser?.permissions || []);

  const isAdmin = role === 'ADMIN' || permissions.includes('admin.dashboard');

  const currentPath = location.pathname;
  const isCurrentAdmin = currentPath.startsWith('/admin');
  const isCurrentSales = currentPath.startsWith('/sales');
  const isCurrentWarehouse = currentPath.startsWith('/warehouse');
  const isCurrentTechnician = currentPath.startsWith('/technician');

  const allPortals = [
    {
      id: 'admin',
      name: 'Admin',
      path: '/admin/dashboard',
      isActive: isCurrentAdmin,
      icon: Shield,
      title: '1-tap switch to Admin Console',
      permission: 'admin.dashboard',
      role: 'ADMIN',
    },
    {
      id: 'sales',
      name: 'Sales',
      path: '/sales/dashboard',
      isActive: isCurrentSales,
      icon: TrendingUp,
      title: '1-tap switch to Sales Operations',
      permission: 'sales.dashboard',
      role: 'SALES',
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      path: '/warehouse/dashboard',
      isActive: isCurrentWarehouse,
      icon: Boxes,
      title: 'Warehouse Manager Portal',
      permission: 'warehouse.dashboard',
      role: 'WAREHOUSE',
    },
    {
      id: 'technician',
      name: 'Technician',
      path: '/technician/dashboard',
      isActive: isCurrentTechnician,
      icon: Wrench,
      title: '1-tap switch to Technician Field Operations',
      permission: 'technician.dashboard',
      role: 'TECHNICIAN',
    },
  ];

  // If Admin, show all 4 portals. If ordinary user, filter only to their authorized role.
  const visiblePortals = isAdmin
    ? allPortals
    : allPortals.filter((p) => role === p.role || permissions.includes(p.permission));

  // If no portals match or only 1 portal exists, render it cleanly
  if (visiblePortals.length === 0) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center p-1 sm:p-1.5 bg-slate-100 border border-slate-200/90 rounded-xl shadow-xs select-none shrink-0 gap-1 ${className}`}
      role="tablist"
      aria-label="Panel Selector"
    >
      {visiblePortals.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={p.isActive}
            onClick={() => {
              if (!p.isActive) navigate(p.path);
            }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer
              ${
                p.isActive
                  ? 'bg-white text-[#0284C7] shadow-sm font-bold ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 font-medium'
              }
            `}
            title={p.title}
          >
            <Icon
              className={`w-4 h-4 transition-colors shrink-0 ${
                p.isActive ? 'text-[#0284C7]' : 'text-slate-400'
              }`}
            />
            <span className="leading-none">{p.name}</span>
            {p.isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] hidden md:inline-block ml-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PortalSwitcher;
