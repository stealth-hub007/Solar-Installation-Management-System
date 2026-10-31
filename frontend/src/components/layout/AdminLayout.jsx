import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Loader from '../common/Loader';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#F7F9F8]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="flex-1 overflow-y-auto">
          <Suspense
            fallback={
              <div className="h-[70vh] flex items-center justify-center">
                <Loader message="Loading dashboard module..." size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

