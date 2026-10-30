import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAction } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { ArrowRight, ArrowLeft, Loader2, LockKeyhole, Smartphone, Info } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo_transparent.png';

export default function StaffForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const requestSms = useAction(api.staffAuthNode.requestStaffPasswordSms);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setServerMessage(null);
    try {
      const res = await requestSms({ email: email.trim() });
      setServerMessage(res.message);
      setCountdown(120);
    } catch (err: any) {
      // Never reveal details or error status that would leak account presence
      setServerMessage("If this account can use SMS reset, a temporary password has been sent.");
      setCountdown(120);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#17110f] text-[#f4e9e2] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl min-h-[620px] grid md:grid-cols-[1.05fr_0.95fr] overflow-hidden border border-[#6f554a]/40 bg-[#241916] shadow-2xl">
        <section
          className="relative hidden md:flex flex-col justify-between p-12 bg-[#1d1412] bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: "linear-gradient(135deg, rgba(29,20,18,0.94), rgba(29,20,18,0.72)), url('/assets/parallax-bg.jpg')" }}
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#ad8774]/20" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#ad8774]/20" />
          <div className="relative z-10">
            <img src={logo} alt="Gabby Newluk" className="h-20 w-20 object-contain" />
            <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-[#c7a99c]">Gabby Newluk Atelier</p>
            <h2 className="mt-4 max-w-sm font-serif text-5xl leading-[1.05] text-[#f4e9e2]">Password recovery.</h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#bfa9a0]">
              Receive a one-time temporary password on your registered phone number to regain access to your workspace.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a98b7e]">
            <LockKeyhole size={15} /> Secure recovery
          </div>
        </section>

        <section className="flex items-center p-7 sm:p-12">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-9 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eadbd3] text-[#241916]">
                <Smartphone size={25} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#b99687]">Staff authentication</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f4e9e2]">Reset password</h1>
                <p className="mt-2 text-sm text-[#bfa9a0]">Enter your email to receive a temporary password by SMS.</p>
              </div>
            </div>

            {serverMessage && (
              <div className="mb-6 p-4 border border-[#ad8774]/40 bg-[#1d1412] text-sm text-[#eadbd3] flex items-start gap-3">
                <Info size={18} className="shrink-0 mt-0.5 text-[#d1aa96]" />
                <div className="leading-relaxed">{serverMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#c7a99c] font-bold">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[#76594d] bg-[#17110f] px-4 py-3.5 text-sm text-[#f4e9e2] outline-none transition-colors placeholder:text-[#806b62] focus:border-[#d1aa96]"
                  placeholder="name@gabbynewluk.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading || countdown > 0}
                className="group flex h-13 w-full items-center justify-center gap-3 bg-[#eadbd3] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#241916] transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : countdown > 0 ? (
                  `Wait ${countdown}s`
                ) : (
                  <>
                    Send temporary password <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[#6f554a]/40 pt-5 space-y-3">
              <div>
                <Link
                  to="/staff/login"
                  className="text-xs uppercase tracking-wider text-[#d1aa96] hover:text-[#f4e9e2] transition-colors underline underline-offset-4 flex items-center gap-2"
                >
                  <ArrowRight size={14} /> I have a temporary password
                </Link>
              </div>
              <div>
                <Link
                  to="/staff/login"
                  className="text-xs uppercase tracking-wider text-[#a98b7e] hover:text-[#f4e9e2] transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
