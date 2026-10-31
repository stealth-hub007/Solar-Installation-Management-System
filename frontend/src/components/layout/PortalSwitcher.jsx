import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, TrendingUp, Boxes, Wrench } from 'lucide-react';

/**
 * Top-bar Segmented One-Tap Portal Switcher
 * Supports instantaneous switching between Admin, Sales, Warehouse, and Technician portals.
 */
export const PortalSwitcher = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isAdmin = currentPath.startsWith('/admin');
  const isSales = currentPath.startsWith('/sales');
  const isWarehouse = currentPath.startsWith('/warehouse');
  const isTechnician = currentPath.startsWith('/technician');

  const portals = [
    {
      id: 'admin',
      name: 'Admin',
      path: '/admin/dashboard',
      isActive: isAdmin,
      icon: Shield,
      title: '1-tap switch to Admin Console',
    },
    {
      id: 'sales',
      name: 'Sales',
      path: '/sales/dashboard',
      isActive: isSales,
      icon: TrendingUp,
      title: '1-tap switch to Sales Operations',
    },
    {
      id: 'warehouse',
      name: 'Warehouse',
      path: '/warehouse/dashboard',
      isActive: isWarehouse,
      icon: Boxes,
      title: 'Warehouse Manager Portal (Future Role)',
    },
    {
      id: 'technician',
      name: 'Technician',
      path: '/technician/dashboard',
      isActive: isTechnician,
      icon: Wrench,
      title: 'Technician Field Portal (Future Role)',
    },
  ];

  return (
    <div
      className={`inline-flex items-center p-0.5 sm:p-1 bg-slate-100/90 border border-slate-200/90 rounded-xl shadow-inner select-none ${className}`}
      role="tablist"
      aria-label="Panel Selector"
    >
      {portals.map((p) => {
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
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap
              ${
                p.isActive
                  ? 'bg-white text-[#0284C7] shadow-sm font-extrabold cursor-default ring-1 ring-slate-900/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 font-medium'
              }
            `}
            title={p.title}
          >
            <Icon
              className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                p.isActive ? 'text-[#0284C7] fill-[#0284C7]/15' : 'text-slate-400'
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
