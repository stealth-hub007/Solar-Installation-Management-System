import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectAccountStatus,
  selectUserRole,
} from '../../features/auth/authSlice';

// Helper to resolve the correct landing dashboard for an approved user
export const getDashboardForRole = (role) => {
  const normalized = (role || '').toUpperCase();
  switch (normalized) {
    case 'ADMIN':
    case 'SUPER ADMINISTRATOR':
      return '/admin/dashboard';
    case 'SALES':
    case 'SALES EXECUTIVE':
    case 'SR. SALES OFFICER':
      return '/sales/dashboard';
    case 'WAREHOUSE':
    case 'WAREHOUSE MANAGER':
      return '/warehouse/dashboard';
    case 'TECHNICIAN':
    case 'FIELD TECHNICIAN':
      return '/technician/dashboard';
    default:
      return '/admin/dashboard';
  }
};

/**
 * Public Route wrapper:
 * If user is already authenticated, redirects away from Login/Register according to their account status.
 */
export const PublicRoute = ({ children }) => {
  const reduxIsAuth = useSelector(selectIsAuthenticated);
  const reduxStatus = useSelector(selectAccountStatus);
  const reduxRole = useSelector(selectUserRole);

  const token = localStorage.getItem('sims_auth_token');
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('sims_auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const isAuthenticated = reduxIsAuth || Boolean(token);
  const accountStatus = (reduxStatus || storedUser?.account_status || (token ? 'APPROVED' : null))?.toUpperCase();
  const role = (reduxRole || storedUser?.role || '')?.toUpperCase();

  if (isAuthenticated) {
    if (accountStatus === 'PENDING') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (accountStatus === 'REJECTED') {
      return <Navigate to="/account-rejected" replace />;
    }
    if (accountStatus === 'SUSPENDED') {
      return <Navigate to="/account-suspended" replace />;
    }
    return <Navigate to={getDashboardForRole(role)} replace />;
  }

  return children ? children : <Outlet />;
};

/**
 * Root Redirector for "/":
 * Directs guest to /login and authenticated user to their respective dashboard or status page.
 */
export const RootRedirect = () => {
  const reduxIsAuth = useSelector(selectIsAuthenticated);
  const reduxStatus = useSelector(selectAccountStatus);
  const reduxRole = useSelector(selectUserRole);

  const token = localStorage.getItem('sims_auth_token');
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('sims_auth_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const isAuthenticated = reduxIsAuth || Boolean(token);
  const accountStatus = (reduxStatus || storedUser?.account_status || (token ? 'APPROVED' : null))?.toUpperCase();
  const role = (reduxRole || storedUser?.role || '')?.toUpperCase();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (accountStatus === 'PENDING') {
    return <Navigate to="/pending-approval" replace />;
  }
  if (accountStatus === 'REJECTED') {
    return <Navigate to="/account-rejected" replace />;
  }
  if (accountStatus === 'SUSPENDED') {
    return <Navigate to="/account-suspended" replace />;
  }

  return <Navigate to={getDashboardForRole(role)} replace />;
};

export default PublicRoute;
