import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute: Only accessible by logged-in users.
 * Redirects to /login if not authenticated.
 */
export const ProtectedRoute = ({ 
  children, 
  roles, 
  adminOnly = false 
}: { 
  children?: React.ReactNode, 
  roles?: string[],
  adminOnly?: boolean
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle adminOnly shortcut
  if (adminOnly && user && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Handle specific roles array
  if (roles && user && !roles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin_dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * GuestRoute: Only accessible by users who are NOT logged in.
 * Redirects to /dashboard (or /admin_dashboard) if already authenticated.
 */
export const GuestRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin_dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
