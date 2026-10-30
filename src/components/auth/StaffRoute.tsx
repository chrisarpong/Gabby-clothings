import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { AlertCircle } from 'lucide-react';
import IdleLogout from './IdleLogout';
import { getStaffRouteStep } from './staffRouteDecision';
import { getDefaultRouteForRole, getStaffAuthState } from './staffAuthState';

interface StaffRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const StaffRoute: React.FC<StaffRouteProps> = ({ children, allowedRoles }) => {
  const { token, profile, clearSession } = useStaffAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!token || profile !== undefined) return;
    const timer = window.setTimeout(() => setTimedOut(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [token, profile]);

  useEffect(() => {
    if (token && profile === null) clearSession();
  }, [token, profile, clearSession]);

  const next = `${location.pathname}${location.search}`;
  const loginUrl = `/staff/login?next=${encodeURIComponent(next)}`;
  const authState = getStaffAuthState(token, profile, timedOut);

  if (authState === 'loading' && timedOut) {
    return <div className="min-h-screen flex items-center justify-center bg-surface p-6"><div className="max-w-md text-center"><h1 className="text-xl font-semibold text-primary">Could not reach the server</h1><p className="mt-3 text-sm text-on-surface-variant">Your staff session could not be loaded. Check the dev server and try again.</p><div className="mt-6 flex gap-3"><button onClick={() => window.location.reload()} className="flex-1 bg-primary px-4 py-3 text-sm font-bold text-surface">Reload</button><button onClick={clearSession} className="flex-1 border border-outline-variant px-4 py-3 text-sm font-bold text-primary">Back to login</button></div></div></div>;
  }
  if (authState === 'loading') {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'anonymous') {
    // Not logged in
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
  }

  if (!profile) return null;

  const requiredStep = getStaffRouteStep(token, profile, location.pathname);

  if (requiredStep === 'change-password') {
    return <Navigate to="/staff/change-password" state={location.state} replace />;
  }

  if (requiredStep === 'setup-2fa') {
    return <Navigate to="/staff/setup-2fa" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // If a designer or salesperson visits the root /admin URL, seamlessly route them to their portal
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return <Navigate to={getDefaultRouteForRole(profile.role)} replace />;
    }

    const homeRoute = getDefaultRouteForRole(profile.role);
    const portalName = profile.role === 'designer' ? 'Designer Portal' : profile.role === 'sales' ? 'Sales Portal' : 'Workspace';

    // 403 Forbidden
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 p-8 flex flex-col items-center text-center">
          <AlertCircle className="w-16 h-16 text-error mb-4" />
          <h1 className="text-2xl font-bold uppercase tracking-widest text-on-surface mb-2">Access Denied</h1>
          <p className="text-on-surface-variant mb-6">
            You do not have the required permissions to view this page. Your current role is <span className="font-bold">{profile.role}</span>.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Link
              to={homeRoute}
              className="bg-primary text-surface px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors"
            >
              Go to {portalName}
            </Link>
            <button 
              onClick={() => window.history.back()}
              className="border border-outline-variant/40 text-on-surface px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-surface-variant/20 transition-colors"
            >
              Go Back
            </button>
          </div>
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
