import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { KeyRound, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffChangePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePassword, profile } = useStaffAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      // In this flow, we are already authenticated but forced to change password.
      // So we use our session token as the challenge token.
      const res = await changePassword(password);
      toast.success("Password changed successfully");
      navigate('/admin', { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-on-surface">Update Password</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            You are required to change your password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">New Password</label>
            <input 
              type="password" 
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="At least 12 characters"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2">Confirm New Password</label>
            <input 
              type="password" 
              required
              minLength={12}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-surface border border-outline-variant/50 p-3 text-sm focus:outline-none focus:border-primary transition-colors"
              placeholder="Repeat new password"
            />
          </div>
          
          <div className="p-4 bg-primary/5 text-primary text-xs space-y-1">
            <p className="font-bold uppercase tracking-widest text-[10px] mb-2">Password Policy:</p>
            <ul className="list-disc list-inside space-y-1 text-on-surface-variant opacity-80">
              <li>Minimum 12 characters</li>
              <li>Cannot be the same as your old/temporary password</li>
              <li>Cannot contain your email address</li>
            </ul>
          </div>

          <button 
            type="submit" 
            disabled={loading || password.length < 12 || password !== confirm}
            className="w-full bg-primary text-surface py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center h-12"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
