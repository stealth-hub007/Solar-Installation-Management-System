import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import SalesSidebar from './SalesSidebar';
import SalesHeader from './SalesHeader';
import Loader from '../common/Loader';

export const SalesLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sales Sidebar Navigation */}
      <SalesSidebar />

      {/* Main Sales Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <SalesHeader />

        <main className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="h-[70vh] flex items-center justify-center">
                <Loader message="Loading Sales Module..." size="lg" />
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

export default SalesLayout;

