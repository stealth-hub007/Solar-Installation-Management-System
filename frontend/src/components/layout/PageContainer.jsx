import React from 'react';

/**
 * Standardized Page Container for SIMS Portals
 * Provides uniform margins, generous responsive padding, and vertical spacing.
 */
export const PageContainer = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1680px] mx-auto space-y-6 sm:space-y-8 pb-12 sm:pb-16 ${className}`}>
      {children}
    </main>
  );
};

export default PageContainer;
