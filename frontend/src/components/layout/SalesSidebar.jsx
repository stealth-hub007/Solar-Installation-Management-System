import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquareMore,
  PhoneCall,
  ClipboardCheck,
  FileText,
  ShoppingCart,
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';

export const salesNavigationItems = [
  {
    name: 'Sales Dashboard',
    path: '/sales/dashboard',
    icon: LayoutDashboard,
    badge: 'Live',
  },
  {
    name: 'Customer Management',
    path: '/sales/customers',
    icon: Users,
  },
  {
    name: 'Enquiry Pipeline',
    path: '/sales/enquiries',
    icon: MessageSquareMore,
  },
  {
    name: 'Follow-ups & Tasks',
    path: '/sales/follow-ups',
    icon: PhoneCall,
  },
  {
    name: 'Site Surveys',
    path: '/sales/surveys',
    icon: ClipboardCheck,
  },
  {
    name: 'Quotations & BOQ',
    path: '/sales/quotations',
    icon: FileText,
  },
  {
    name: 'Order Tracking',
    path: '/sales/orders',
    icon: ShoppingCart,
  },
];

export const SalesSidebar = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl flex flex-col bg-white border-r border-slate-200
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header Mobile */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-[#F0F7FF]/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-card shrink-0">
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">SIMS</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                  Sales Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-500 truncate font-medium">Solar Sales Operations</span>
            </div>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {salesNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative
                  ${
                    isActive
                      ? 'bg-[#E0F2FE] text-[#0284C7] shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#0284C7] rounded-r-full" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#0284C7]' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Close / Sign out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              closeMobileSidebar();
              localStorage.removeItem('sims_auth_token');
              navigate('/login');
            }}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-100 transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 shadow-subtle shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-100 bg-[#F0F7FF]/50 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-card shrink-0">
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">SIMS</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                    Sales Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 truncate font-medium">Solar Sales Operations</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button placed on the right side of SIMS logo */}
          <button
            onClick={toggleSidebar}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 bg-slate-100 hover:text-slate-800 hover:bg-slate-200 transition shrink-0 ml-1.5"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-2">
            {!isCollapsed ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sales Pipeline
              </span>
            ) : (
              <div className="w-4 h-0.5 bg-slate-200 mx-auto rounded" />
            )}
          </div>

          {salesNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative
                  ${
                    isActive
                      ? 'bg-[#E0F2FE] text-[#0284C7] shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#0284C7] rounded-r-full" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#0284C7]' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* Quick Target Micro Widget */}
          {!isCollapsed && (
            <div className="mt-6 mx-1 p-3 rounded-xl bg-gradient-to-b from-[#F0F7FF] to-white border border-[#BAE6FD]/60 shadow-subtle">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span className="flex items-center gap-1 text-[#0284C7]">
                  <TrendingUp className="w-3.5 h-3.5" /> Monthly Target
                </span>
                <span className="text-emerald-600 font-bold">80.8%</span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2 mb-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#0284C7] to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: '80.8%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Achieved: ₹48.5L</span>
                <span>Target: ₹60L</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2 shrink-0">
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center w-full py-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xs font-medium"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <div className="flex items-center gap-1.5">
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px]">Collapse Menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SalesSidebar;
