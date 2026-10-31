import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import WarehouseSidebar from './WarehouseSidebar';
import WarehouseHeader from './WarehouseHeader';
import Loader from '../common/Loader';

export const WarehouseLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Warehouse Sidebar Navigation with independent scroll container */}
      <WarehouseSidebar />

      {/* Main Content Area: Independent scroll container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <WarehouseHeader />

        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Suspense
            fallback={
              <div className="h-[70vh] flex items-center justify-center">
                <Loader message="Loading Warehouse Module..." size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default WarehouseLayout;
