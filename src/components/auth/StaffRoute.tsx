import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { AlertCircle } from 'lucide-react';
import IdleLogout from './IdleLogout';

interface StaffRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const StaffRoute: React.FC<StaffRouteProps> = ({ children, allowedRoles }) => {
  const { token, profile } = useStaffAuth();
  const location = useLocation();

  if (profile === undefined) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || profile === null) {
    // Not logged in
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  if (profile.mustChangePassword && location.pathname !== '/staff/change-password') {
    // Force password change
    return <Navigate to="/staff/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // 403 Forbidden
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-16 h-16 text-error mb-4" />
          <h1 className="text-2xl font-bold uppercase tracking-widest text-on-surface mb-2">Access Denied</h1>
          <p className="text-on-surface-variant mb-6">
            You do not have the required permissions to view this page. Your current role is <span className="font-bold">{profile.role}</span>.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-surface px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <IdleLogout />
      {children}
    </>
  );
};
