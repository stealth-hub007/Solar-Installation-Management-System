import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectAccountStatus,
  selectUserRole,
  selectUserPermissions,
} from '../../features/auth/authSlice';

/**
 * Route guard that ensures the user is logged in, has an APPROVED account status,
 * and possesses the necessary role/permissions to view the requested route.
 * Admins have permission to access all 4 dashboards.
 */
export const ProtectedRoute = ({ requiredRole, requiredPermission, children }) => {
  const location = useLocation();
  const reduxIsAuth = useSelector(selectIsAuthenticated);
  const reduxStatus = useSelector(selectAccountStatus);
  const reduxRole = useSelector(selectUserRole);
  const reduxPermissions = useSelector(selectUserPermissions);

  // Fallback to localStorage in case of page reload before Redux initialization
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
  const accountStatus = (reduxStatus || storedUser?.account_status || (token ? 'PENDING' : null))?.toUpperCase();
  const role = (reduxRole || storedUser?.role || '')?.toUpperCase();
  const permissions = reduxPermissions?.length > 0 ? reduxPermissions : (storedUser?.permissions || []);

  // 1. Unauthenticated -> Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Account Status Gates
  if (accountStatus === 'PENDING') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (accountStatus === 'REJECTED') {
    return <Navigate to="/account-rejected" replace />;
  }

  if (accountStatus === 'SUSPENDED') {
    return <Navigate to="/account-suspended" replace />;
  }

  // 3. Admin has authorized access to all four modules
  const isAdmin = role === 'ADMIN' || permissions.includes('admin.dashboard');

  if (requiredRole || requiredPermission) {
    // If user is Admin, they have access to all 4 dashboards
    if (isAdmin) {
      return children ? children : <Outlet />;
    }

    // Role check for non-admin
    const normalizedRequiredRole = requiredRole?.toUpperCase();
    const hasRoleMatch = normalizedRequiredRole && role === normalizedRequiredRole;
    const hasPermissionMatch = requiredPermission && permissions.includes(requiredPermission);

    if (!hasRoleMatch && !hasPermissionMatch) {
      // User is authenticated and approved, but not authorized for this specific module
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
