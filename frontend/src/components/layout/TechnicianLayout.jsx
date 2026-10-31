import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import TechnicianSidebar from './TechnicianSidebar';
import TechnicianHeader from './TechnicianHeader';
import Loader from '../common/Loader';

export const TechnicianLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Technician Sidebar Navigation */}
      <TechnicianSidebar />

      {/* Main Technician Field Operations Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TechnicianHeader />

        <main className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="h-[70vh] flex items-center justify-center">
                <Loader message="Loading Technician Module..." size="lg" />
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

export default TechnicianLayout;

