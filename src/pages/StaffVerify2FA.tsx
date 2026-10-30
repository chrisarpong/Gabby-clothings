import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { sanitizeStaffNext } from '../components/auth/staffAuthState';

export default function StaffVerify2FA() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { verify2FA } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const challengeToken = location.state?.challengeToken;

  if (!challengeToken) {
    return <Navigate to="/staff/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verify2FA(challengeToken, code, false);
      const from = sanitizeStaffNext(location.state?.next) || sanitizeStaffNext(location.state?.from?.pathname);
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <QrCode size={32} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-on-surface">Two-Factor Auth</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Authenticator Code</label>
            <input 
              type="text" 
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 p-3 text-center text-lg tracking-[0.5em] font-mono focus:outline-none focus:border-primary transition-colors"
              placeholder="000000"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || code.length !== 6}
            className="w-full bg-primary text-surface py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center h-12"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
