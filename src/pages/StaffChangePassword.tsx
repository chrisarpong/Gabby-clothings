import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { ArrowRight, Check, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { parseConvexError } from '../utils/errorParser';

export default function StaffChangePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { changePassword, profile } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const arrivedWithTempPassword = Boolean(location.state?.tempPassword || profile?.mustChangePassword);

  const checks = useMemo(() => {
    const emailLocal = profile?.email?.split('@')[0]?.toLowerCase() || '';
    const nameParts = (profile?.name || '').toLowerCase().split(/\s+/).filter((part) => part.length > 3);
    const lower = password.toLowerCase();
    return [
      { label: 'At least 12 characters', valid: password.length >= 12 },
      { label: 'Does not contain your email', valid: !emailLocal || !lower.includes(emailLocal) },
      { label: 'Does not contain your name', valid: nameParts.every((part) => !lower.includes(part)) },
      { label: 'Not a commonly used password', valid: !['password123', 'qwerty', 'admin123', 'gabbynewluk'].some((blocked) => lower.includes(blocked)) },
    ];
  }, [password, profile?.email, profile?.name]);

  const passwordValid = checks.every((check) => check.valid);
  const passwordsMatch = password.length > 0 && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) {
      toast.error(!passwordsMatch ? "Passwords do not match" : "Please meet every password requirement");
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
      toast.error(parseConvexError(err, "Failed to change password. Please ensure it meets all requirements."));
    } finally {
      setLoading(false);
    }
  };

  if (profile === undefined) {
    return <div className="min-h-screen flex items-center justify-center bg-[#17110f]"><Loader2 className="animate-spin text-[#eadbd3]" size={32} /></div>;
  }
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#17110f] px-4 py-8 text-[#f4e9e2] sm:px-8 lg:flex lg:items-center lg:justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden border border-[#6f554a]/40 bg-[#241916] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden min-h-[680px] flex-col justify-between overflow-hidden bg-cover bg-center p-12 lg:flex" style={{ backgroundImage: "linear-gradient(135deg, rgba(29,20,18,0.93), rgba(29,20,18,0.74)), url('/assets/parallax-bg.jpg')" }}>
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#ad8774]/20" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#ad8774]/20" />
          <div className="relative z-10">
            <img src="/assets/logo.png" alt="Gabby Newluk" className="h-16 w-16 object-contain" />
            <p className="mt-12 text-[10px] uppercase tracking-[0.35em] text-[#c7a99c]">Secure first access</p>
            <h2 className="mt-4 max-w-sm font-serif text-5xl leading-[1.04] text-[#f4e9e2]">A password made for your workspace.</h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#bfa9a0]">Choose a private password you can remember. Your account will continue to 2FA setup once it is saved.</p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a98b7e]"><ShieldCheck size={15} /> Protected staff access</div>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eadbd3] text-[#241916]"><KeyRound size={23} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#b99687]">Account security</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your password</h1>
              <p className="mt-2 text-sm text-[#bfa9a0]">
                {arrivedWithTempPassword
                  ? "You signed in with a temporary password. Choose a new password."
                  : "A new password is required before you enter the workspace."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7a99c]">New password</label>
              <div className="relative"><input id="new-password" type={showPassword ? 'text' : 'password'} required minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-[#76594d] bg-[#17110f] px-4 py-3.5 pr-14 text-sm text-[#f4e9e2] outline-none transition-colors focus:border-[#d1aa96]" placeholder="Create a strong password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#a98b7e] hover:text-[#f4e9e2]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7a99c]">Confirm password</label>
              <div className="relative"><input id="confirm-password" type={showConfirm ? 'text' : 'password'} required minLength={12} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border border-[#76594d] bg-[#17110f] px-4 py-3.5 pr-14 text-sm text-[#f4e9e2] outline-none transition-colors focus:border-[#d1aa96]" placeholder="Repeat your password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm((visible) => !visible)} aria-label={showConfirm ? 'Hide confirmation' : 'Show confirmation'} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#a98b7e] hover:text-[#f4e9e2]">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {confirm && <p className={`mt-2 text-xs ${passwordsMatch ? 'text-[#a8d5b0]' : 'text-[#e59b8f]'}`}>{passwordsMatch ? 'Passwords match.' : 'Passwords do not match.'}</p>}
            </div>

            <div className="border border-[#6f554a]/50 bg-[#1d1412] p-5"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#eadbd3]">Password checklist</p><ul className="space-y-2">{checks.map((check) => <li key={check.label} className={`flex items-center gap-2 text-xs ${check.valid ? 'text-[#a8d5b0]' : 'text-[#bfa9a0]'}`}>{check.valid ? <Check size={15} /> : <X size={15} />}<span>{check.label}</span></li>)}</ul><p className="mt-4 border-t border-[#6f554a]/40 pt-3 text-xs leading-5 text-[#a98b7e]">Your new password must also be different from the temporary password. This is checked securely when you submit.</p></div>

            <button type="submit" disabled={loading || !passwordValid || !passwordsMatch} className="group flex h-13 w-full items-center justify-center gap-3 bg-[#eadbd3] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#241916] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <Loader2 className="animate-spin" size={20} /> : <>Set password <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
