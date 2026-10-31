import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  AlertTriangle,
  Building2,
  ShoppingCart,
  ArrowDownToLine,
  History,
  QrCode,
  ArrowLeftRight,
  Lock,
  Clock,
  Truck,
  CheckCircle2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useSidebar } from '../../context/SidebarContext';

export const warehouseNavigationGroups = [
  {
    groupTitle: 'Core Inventory',
    items: [
      { name: 'Dashboard Overview', path: '/warehouse/dashboard', icon: LayoutDashboard },
      { name: 'Product Catalog', path: '/warehouse/products', icon: Package },
      { name: 'Stock & Inventory', path: '/warehouse/inventory', icon: Boxes },
      { name: 'Low Stock Alerts', path: '/warehouse/alerts', icon: AlertTriangle, badge: 'Alerts' },
    ],
  },
  {
    groupTitle: 'Procurement & Receipts',
    items: [
      { name: 'Suppliers Management', path: '/warehouse/suppliers', icon: Building2 },
      { name: 'Purchase Orders', path: '/warehouse/purchases', icon: ShoppingCart },
      { name: 'Stock Receipts (GRN)', path: '/warehouse/receipts', icon: ArrowDownToLine },
      { name: 'Warehouse Transfers', path: '/warehouse/transfers', icon: ArrowLeftRight },
    ],
  },
  {
    groupTitle: 'Fulfillment & Dispatch',
    items: [
      { name: 'Stock Reservations', path: '/warehouse/reservations', icon: Lock },
      { name: 'Pending Dispatch', path: '/warehouse/pending-dispatch', icon: Clock },
      { name: 'Delivery Orders', path: '/warehouse/delivery-orders', icon: Truck },
      { name: 'Delivery Confirmations', path: '/warehouse/delivery-confirmations', icon: CheckCircle2 },
    ],
  },
  {
    groupTitle: 'Auditing & Intelligence',
    items: [
      { name: 'Stock Movement Ledger', path: '/warehouse/stock-movements', icon: History },
      { name: 'Serial Number Traceability', path: '/warehouse/serial-numbers', icon: QrCode },
      { name: 'Warehouse Reports', path: '/warehouse/reports', icon: BarChart3 },
    ],
  },
];

export const WarehouseSidebar = () => {
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 select-none border-r border-slate-200 shadow-sm">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-3 bg-white border-b border-slate-100 shrink-0">
        <div
          onClick={() => navigate('/warehouse/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                SIMS <span className="text-[10px] px-1.5 py-0.5 font-semibold bg-[#E0F2FE] text-[#0284C7] rounded">Warehouse</span>
              </span>
              <p className="text-[11px] text-slate-400 truncate">Inventory & Logistics</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={toggleSidebar}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-500 bg-slate-100 hover:text-slate-800 hover:bg-slate-200 transition shrink-0 ml-1.5"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
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

      {/* Navigation Groups List - Independent Scroll Container */}
      <div className="flex-1 overflow-y-auto overscroll-contain py-3 px-3 space-y-4 scrollbar-thin">
        {warehouseNavigationGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-0.5">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {group.groupTitle}
              </h4>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/warehouse/dashboard' && location.pathname.startsWith(item.path));

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
                      {item.name}
                    </span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#0284C7] text-white'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {item.badge}
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
      {/* Desktop Persistent Sidebar with fixed height and independent scroll */}
      <aside
        className={`hidden lg:block transition-all duration-300 ease-in-out shrink-0 h-screen sticky top-0 z-30 ${
          isCollapsed ? 'w-18' : 'w-64'
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

export default WarehouseSidebar;
