import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.status === '2fa_required') {
        navigate('/staff/2fa-verify', { state: { challengeToken: res.token } });
      } else {
        const from = location.state?.from?.pathname;
        if (from && from.startsWith('/admin') || from?.startsWith('/designer') || from?.startsWith('/sales')) {
          navigate(from, { replace: true });
        } else {
          // Note: The actual redirect should depend on the role. But since we just got the token,
          // the profile might not be fully loaded in the next tick. However, useStaffAuth's profile
          // will load shortly. We can just redirect to /staff and let StaffRoute handle it or go to admin.
          navigate('/admin', { replace: true }); // Admin route will redirect if needed, or we can just go to admin.
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary text-surface rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-on-surface">Staff Portal</h1>
          <p className="text-on-surface-variant text-sm mt-2">Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="name@gabbynewluk.com"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-surface py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center h-12"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
