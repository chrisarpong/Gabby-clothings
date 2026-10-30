import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo_transparent.png';

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
    <div className="min-h-screen bg-[#17110f] text-[#f4e9e2] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl min-h-[620px] grid md:grid-cols-[1.05fr_0.95fr] overflow-hidden border border-[#6f554a]/40 bg-[#241916] shadow-2xl">
        <section className="relative hidden md:flex flex-col justify-between p-12 bg-[#1d1412] overflow-hidden">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#ad8774]/20" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#ad8774]/20" />
          <div className="relative z-10">
            <img src={logo} alt="Gabby Newluk" className="h-20 w-20 object-contain" />
            <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-[#c7a99c]">Gabby Newluk Atelier</p>
            <h2 className="mt-4 max-w-sm font-serif text-5xl leading-[1.05] text-[#f4e9e2]">Crafted with precision.</h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#bfa9a0]">A private workspace for the people shaping every fitting, order, and client experience.</p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a98b7e]">
            <LockKeyhole size={15} /> Secure staff access
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-9 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eadbd3] text-[#241916]">
                <ShieldCheck size={25} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#b99687]">Internal workspace</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f4e9e2]">Staff portal</h1>
                <p className="mt-2 text-sm text-[#bfa9a0]">Sign in to continue to your workspace.</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#c7a99c] font-bold">Email address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#76594d] bg-[#17110f] px-4 py-3.5 text-sm text-[#f4e9e2] outline-none transition-colors placeholder:text-[#806b62] focus:border-[#d1aa96]"
              placeholder="name@gabbynewluk.com"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-[#c7a99c] font-bold">Password</label>
              <span className="text-[10px] uppercase tracking-wider text-[#806b62]">Protected account</span>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#76594d] bg-[#17110f] px-4 py-3.5 text-sm text-[#f4e9e2] outline-none transition-colors placeholder:text-[#806b62] focus:border-[#d1aa96]"
              placeholder="••••••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="group flex h-13 w-full items-center justify-center gap-3 bg-[#eadbd3] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#241916] transition-colors hover:bg-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign in <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>}
          </button>
            </form>

            <div className="mt-8 border-t border-[#6f554a]/40 pt-5">
              <p className="text-sm font-medium text-[#e5d2c8]">Need to reset your password?</p>
              <p className="mt-1 text-xs leading-5 text-[#a98b7e]">Staff password resets are issued by an authorized CEO from Team &amp; Roles. Contact your manager so the reset can be logged securely.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
