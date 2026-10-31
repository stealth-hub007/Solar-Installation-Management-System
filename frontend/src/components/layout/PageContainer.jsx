import React from 'react';

export const PageContainer = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 p-3.5 sm:p-5 lg:p-6 w-full max-w-[1600px] mx-auto space-y-5 sm:space-y-6 ${className}`}>
      {children}
    </main>
  );
};

export default PageContainer;

