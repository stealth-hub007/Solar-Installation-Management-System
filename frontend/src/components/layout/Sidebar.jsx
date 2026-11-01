import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquareMore,
  ClipboardCheck,
  Package,
  FileText,
  ShoppingCart,
  CreditCard,
  Boxes,
  Truck,
  Wrench,
  ShieldCheck,
  Shield,
  Headphones,
  DollarSign,
  BarChart3,
  History,
  Settings,
  Sun,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';

export const navigationItems = [
  {
    category: 'CORE OPERATIONS',
    items: [
      {
        name: 'Dashboard',
        shortName: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Customers',
        shortName: 'Customers',
        path: '/admin/customers',
        icon: Users,
      },
      {
        name: 'Enquiries',
        shortName: 'Enquiries',
        path: '/admin/enquiries',
        icon: MessageSquareMore,
      },
      {
        name: 'Surveys',
        shortName: 'Surveys',
        path: '/admin/surveys',
        icon: ClipboardCheck,
      },
    ],
  },
  {
    category: 'COMMERCIAL & SALES',
    items: [
      {
        name: 'Products',
        shortName: 'Products',
        path: '/admin/products',
        icon: Package,
      },
      {
        name: 'Quotations',
        shortName: 'Quotations',
        path: '/admin/quotations',
        icon: FileText,
      },
      {
        name: 'Orders',
        shortName: 'Orders',
        path: '/admin/orders',
        icon: ShoppingCart,
      },
      {
        name: 'Payments',
        shortName: 'Payments',
        path: '/admin/payments',
        icon: CreditCard,
      },
    ],
  },
  {
    category: 'SUPPLY CHAIN & EXECUTION',
    items: [
      {
        name: 'Inventory',
        shortName: 'Inventory',
        path: '/admin/inventory',
        icon: Boxes,
      },
      {
        name: 'Dispatch',
        shortName: 'Dispatch',
        path: '/admin/dispatch',
        icon: Truck,
      },
      {
        name: 'Installations',
        shortName: 'Installations',
        path: '/admin/installations',
        icon: Wrench,
      },
    ],
  },
  {
    category: 'POST-INSTALL & QUALITY',
    items: [
      {
        name: 'Warranty',
        shortName: 'Warranty',
        path: '/admin/warranty',
        icon: ShieldCheck,
      },
      {
        name: 'Service Tickets',
        shortName: 'Service Tickets',
        path: '/admin/service-tickets',
        icon: Headphones,
      },
    ],
  },
  {
    category: 'ANALYTICS & ADMINISTRATION',
    items: [
      {
        name: 'Finance',
        shortName: 'Finance',
        path: '/admin/finance',
        icon: DollarSign,
      },
      {
        name: 'Reports',
        shortName: 'Reports',
        path: '/admin/reports',
        icon: BarChart3,
      },
      {
        name: 'Audit Logs',
        shortName: 'Audit Logs',
        path: '/admin/audit-logs',
        icon: History,
      },
      {
        name: 'Roles',
        shortName: 'Roles',
        path: '/admin/roles-permissions',
        icon: Shield,
      },
      {
        name: 'Users & Approvals',
        shortName: 'Users',
        path: '/admin/users',
        icon: UserCheck,
      },
      {
        name: 'Settings',
        shortName: 'Settings',
        path: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 select-none border-r border-slate-200 shadow-sm">
      {/* Brand Header */}
      {!isCollapsed ? (
        <div className="flex items-center justify-between h-16 px-3 bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300 animate-[spin_20s_linear_infinite]" />
            </div>
            <div className="truncate">
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                SIMS <span className="text-[10px] px-1.5 py-0.5 font-semibold bg-[#E0F2FE] text-[#0284C7] rounded">Solar</span>
              </span>
              <p className="text-[11px] text-slate-400 truncate">Solar Management System</p>
            </div>
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 bg-slate-100 hover:text-slate-800 hover:bg-slate-200 transition shrink-0 ml-1.5"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Mobile close button */}
          <button
            onClick={closeMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-center px-2 bg-white border-b border-slate-100 shrink-0">
          <button
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="relative group p-2 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white shadow-sm hover:ring-2 hover:ring-[#0284C7]/30 transition flex items-center justify-center"
            title="Click to expand sidebar"
          >
            <Sun className="w-5 h-5 text-amber-300 fill-amber-300 animate-[spin_20s_linear_infinite]" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] shadow">
              <ChevronRight className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>
      )}

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 space-y-5 scrollbar-thin">
        {navigationItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {group.category}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/admin/roles-permissions' && location.pathname === '/admin/roles');

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      closeMobileSidebar();
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#E0F2FE] text-[#0284C7] font-semibold border-l-4 border-[#0284C7]'
                      : 'text-slate-600 hover:bg-[#F0F7FF] hover:text-[#0284C7]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#0284C7]' : 'text-slate-400 group-hover:text-[#0284C7]'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1">
                      {item.shortName || item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block transition-all duration-300 ease-in-out shrink-0 h-screen sticky top-0 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
