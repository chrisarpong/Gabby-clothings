import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TIMEOUTS: Record<string, number> = {
  sales: 5 * 60 * 1000,
  admin: 15 * 60 * 1000,
  designer: 15 * 60 * 1000,
  ceo: 30 * 60 * 1000,
};

const WARNING_TIME = 60 * 1000;
const HEARTBEAT_INTERVAL = 30 * 1000;

export default function IdleLogout() {
  const { token, profile, logout } = useStaffAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_TIME / 1000);
  
  const lastActivity = useRef<number>(Date.now());
  const lastHeartbeat = useRef<number>(Date.now());
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const location = useLocation();
  const logoutTimer = useRef<any>(null);
  const countdownInterval = useRef<any>(null);

  const resetTimers = useCallback(() => {
    if (showWarning) return; // Don't auto-dismiss warning
    
    lastActivity.current = Date.now();
    
    // Throttle heartbeat to the server and other tabs
    if (Date.now() - lastHeartbeat.current > HEARTBEAT_INTERVAL) {
      lastHeartbeat.current = Date.now();
      // Inform other tabs
      broadcastChannel.current?.postMessage({ type: 'activity', time: Date.now() });
      
      // Heartbeat to server (could hit an endpoint if needed, but for now we just use it to sync client-side across tabs)
      // Convex actually tracks lastActivityAt on the server on many mutations, but let's keep it lightweight.
    }
  }, [showWarning]);

  useEffect(() => {
    if (!token || !profile) return;

    broadcastChannel.current = new BroadcastChannel('gabby_staff_auth');
    broadcastChannel.current.onmessage = (event) => {
      if (event.data.type === 'activity' && !showWarning) {
        lastActivity.current = event.data.time;
      }
      if (event.data.type === 'logout') {
        logout();
      }
    };

    const events = ['click', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetTimers();
    
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    
    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      broadcastChannel.current?.close();
    };
  }, [token, profile, resetTimers, showWarning, logout]);

  useEffect(() => {
    if (!token || !profile) return;

    const timeout = TIMEOUTS[profile.role] || TIMEOUTS.admin;
    const warningThreshold = timeout - WARNING_TIME;

    const checkIdle = setInterval(() => {
      if (showWarning) return;
      
      const idleTime = Date.now() - lastActivity.current;
      if (idleTime >= warningThreshold) {
        setShowWarning(true);
        setTimeLeft(Math.floor((timeout - idleTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(checkIdle);
  }, [token, profile, showWarning]);

  useEffect(() => {
    if (showWarning) {
      countdownInterval.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            broadcastChannel.current?.postMessage({ type: 'logout' });
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    }
    
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [showWarning, logout]);

  const handleDismissWarning = () => {
    setShowWarning(false);
    lastActivity.current = Date.now();
    broadcastChannel.current?.postMessage({ type: 'activity', time: Date.now() });
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-surface border-2 border-error p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <AlertTriangle className="w-16 h-16 text-error mb-4" />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-on-surface mb-2">Are you still there?</h2>
        <p className="text-on-surface-variant mb-6">
          Your session will expire in <span className="font-bold text-error text-xl">{timeLeft}</span> seconds due to inactivity.
        </p>
        <button
          onClick={handleDismissWarning}
          className="bg-primary text-surface px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors w-full"
        >
          I'm still here
        </button>
      </div>
    </div>
  );
}
