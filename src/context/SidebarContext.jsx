import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(undefined);

export const SidebarProvider = ({ children }) => {
  // Desktop sidebar collapsed state (default expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sims_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Mobile sidebar drawer state (open/closed)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Layout preference (compact density toggle)
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sims_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // Ignore storage errors
    }
  }, [isCollapsed]);

  // Close mobile sidebar on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const toggleCompactLayout = () => {
    setIsCompact((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        isMobileOpen,
        setIsMobileOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        isCompact,
        toggleCompactLayout,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;

