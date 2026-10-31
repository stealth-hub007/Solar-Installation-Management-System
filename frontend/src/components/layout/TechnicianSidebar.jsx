import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardCheck,
  Wrench,
  CheckSquare,
  Boxes,
  Clock,
  User,
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';

export const technicianGroups = [
  {
    category: 'FIELD OPERATIONS',
    items: [
      {
        name: 'Field Dashboard',
        path: '/technician/dashboard',
        icon: LayoutDashboard,
        badge: 'Live',
      },
      {
        name: 'My Tasks',
        path: '/technician/tasks',
        icon: CheckSquare,
        badge: 'Unified',
      },
      {
        name: 'Assigned Surveys',
        path: '/technician/surveys',
        icon: ClipboardCheck,
      },
      {
        name: 'Installation Jobs',
        path: '/technician/installations',
        icon: Wrench,
      },
    ],
  },
  {
    category: 'COMPLIANCE & ACCOUNT',
    items: [
      {
        name: 'Field Hours & Profile',
        path: '/technician/profile',
        icon: Clock,
      },
    ],
  },
];

export const TechnicianSidebar = () => {
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 bg-[#F0F7FF]/60 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-card shrink-0">
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">SIMS</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                  Technician
                </span>
              </div>
              <span className="text-[11px] text-slate-500 truncate font-medium">Solar Field Engineering</span>
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
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {technicianGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {group.category}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/technician/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileSidebar}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150
                      ${
                        isActive
                          ? 'bg-[#E0F2FE] text-[#0284C7] shadow-sm font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0284C7]' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile Footer Status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">Field Unit Online</span>
          </div>
        </div>
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 shadow-subtle shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out select-none
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Brand Header Desktop */}
        {!isCollapsed ? (
          <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-100 bg-[#F0F7FF]/50 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-card shrink-0">
                <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>

              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-900 tracking-tight">SIMS</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                    Tech Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 truncate font-medium">Solar Field Operations</span>
              </div>
            </div>

            {/* Collapse Button */}
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg text-slate-500 bg-slate-100 hover:text-slate-800 hover:bg-slate-200 transition shrink-0 ml-1.5"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center px-2 border-b border-slate-100 bg-[#F0F7FF]/50 shrink-0">
            <button
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="relative group p-1.5 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-card hover:ring-2 hover:ring-[#0284C7]/30 transition"
              title="Click to expand sidebar"
            >
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] shadow">
                <ChevronRight className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {technicianGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 mb-1">
                {!isCollapsed ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.category}
                  </span>
                ) : (
                  <div className="w-4 h-0.5 bg-slate-200 mx-auto rounded" />
                )}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/technician/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`group flex items-center gap-3 rounded-xl text-xs font-semibold transition-all duration-150 relative
                      ${
                        isActive
                          ? 'bg-[#E0F2FE] text-[#0284C7] shadow-sm font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }
                      ${isCollapsed ? 'justify-center w-11 h-11 mx-auto px-0' : 'px-3 py-2.5'}
                    `}
                  >
                    {isActive && !isCollapsed && (
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
            </div>
          ))}
        </div>

        {/* Desktop Footer Card */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/60">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold text-slate-800">Technician Role</div>
                  <div className="text-[10px] text-slate-500">Field Level 3</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default TechnicianSidebar;
