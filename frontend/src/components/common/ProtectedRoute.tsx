import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Authenticating EcoSort AI terminal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not allowed, redirect to their role-specific dashboard
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <Navigate to="/dashboard/super-admin" replace />;
      case 'ADMIN':
        return <Navigate to="/dashboard/admin" replace />;
      case 'GARBAGE_COLLECTOR':
        return <Navigate to="/dashboard/collector" replace />;
      case 'MUNICIPALITY_MONITOR':
        return <Navigate to="/dashboard/monitor" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

