import React from 'react';

export const PageContainer = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 ${className}`}>
      {children}
    </main>
  );
};

export default PageContainer;

