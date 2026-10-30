import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { ArrowLeft, ArrowRight, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../assets/logo_transparent.png';
import { getDefaultRouteForRole, sanitizeStaffNext } from '../components/auth/staffAuthState';
import { parseConvexError } from '../utils/errorParser';

const CODE_LENGTH = 6;

export default function StaffVerify2FA() {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const submitGuardRef = useRef(false);
  const { verify2FA, profile } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const storedChallenge = (() => {
    try { return JSON.parse(sessionStorage.getItem('staff2faChallenge') || 'null'); } catch { return null; }
  })();
  const challengeToken = location.state?.challengeToken || storedChallenge?.token;
  const nextPath = location.state?.next || storedChallenge?.next;

  // Auto-focus first input on mount
  useEffect(() => {
    if (!useRecovery) {
      inputRefs.current[0]?.focus();
    }
  }, [useRecovery]);

  const getCode = useCallback(() => digits.join(''), [digits]);

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Move back on backspace when current is empty
      inputRefs.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;

    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < CODE_LENGTH; i++) {
        next[i] = pasted[i] || '';
      }
      return next;
    });

    // Focus the input after the last pasted digit
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitGuardRef.current || loading) return;
    const code = useRecovery ? recoveryCode.trim() : getCode();

    if (!useRecovery && code.length !== CODE_LENGTH) {
      toast.error("Please enter all 6 digits");
      return;
    }
    if (useRecovery && !code) {
      toast.error("Please enter a recovery code");
      return;
    }

    submitGuardRef.current = true;
    setLoading(true);
    try {
      const res = await verify2FA(challengeToken, code, useRecovery);
      sessionStorage.removeItem('staff2faChallenge');
      const from = sanitizeStaffNext(nextPath) || sanitizeStaffNext(location.state?.from?.pathname);
      const targetRole = res?.role || location.state?.role || storedChallenge?.role || profile?.role;
      navigate(from || getDefaultRouteForRole(targetRole), { replace: true });
    } catch (err: any) {
      const message = parseConvexError(err, "Invalid code");
      if (/Invalid or expired challenge|Invalid session|Session expired/i.test(message)) {
        sessionStorage.removeItem('staff2faChallenge');
        toast.error("Your verification window expired. Please sign in again.");
        navigate('/staff/login', { replace: true });
        return;
      }
      toast.error(message);
      if (!useRecovery) {
        // Clear digits and refocus first input on failure
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
      submitGuardRef.current = false;
    }
  };

  if (!challengeToken) {
    return <Navigate to="/staff/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#17110f] text-[#f4e9e2] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl min-h-[620px] grid md:grid-cols-[1.05fr_0.95fr] overflow-hidden border border-[#6f554a]/40 bg-[#241916] shadow-2xl">
        {/* Left panel — decorative */}
        <section
          className="relative hidden md:flex flex-col justify-between p-12 bg-[#1d1412] bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: "linear-gradient(135deg, rgba(29,20,18,0.94), rgba(29,20,18,0.72)), url('/assets/parallax-bg.jpg')" }}
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#ad8774]/20" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#ad8774]/20" />
          <div className="relative z-10">
            <img src={logo} alt="Gabby Newluk" className="h-20 w-20 object-contain" />
            <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-[#c7a99c]">Gabby Newluk Atelier</p>
            <h2 className="mt-4 max-w-sm font-serif text-5xl leading-[1.05] text-[#f4e9e2]">One more step.</h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#bfa9a0]">
              Two-factor authentication keeps your workspace secure. Enter the code from your authenticator app to continue.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a98b7e]">
            <LockKeyhole size={15} /> Protected by 2FA
          </div>
        </section>

        {/* Right panel — form */}
        <section className="flex items-center p-7 sm:p-12">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-9 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eadbd3] text-[#241916]">
                <ShieldCheck size={25} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#b99687]">Verification</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f4e9e2]">Two-factor auth</h1>
                <p className="mt-2 text-sm text-[#bfa9a0]">
                  {useRecovery
                    ? "Enter one of your saved recovery codes."
                    : "Enter the 6-digit code from your authenticator app."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!useRecovery ? (
                <div>
                  <label className="mb-3 block text-[10px] uppercase tracking-[0.2em] text-[#c7a99c] font-bold">
                    Authenticator code
                  </label>
                  <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
                    {digits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-14 border border-[#76594d] bg-[#17110f] text-center text-xl font-mono text-[#f4e9e2] outline-none transition-all focus:border-[#d1aa96] focus:ring-1 focus:ring-[#d1aa96]/40 placeholder:text-[#806b62]/40"
                        placeholder="·"
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-center text-xs text-[#a98b7e]">
                    Open your authenticator app (e.g. Google Authenticator) to get your code.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#c7a99c] font-bold">
                    Recovery code
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full border border-[#76594d] bg-[#17110f] px-4 py-3.5 text-sm font-mono text-[#f4e9e2] outline-none transition-colors placeholder:text-[#806b62] focus:border-[#d1aa96]"
                    placeholder="XXXXX-XXXXX"
                    autoFocus
                  />
                  <p className="mt-2 text-xs text-[#a98b7e]">
                    Each recovery code can only be used once.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!useRecovery && getCode().length !== CODE_LENGTH) || (useRecovery && !recoveryCode.trim())}
                className="group flex h-13 w-full items-center justify-center gap-3 bg-[#eadbd3] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#241916] transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Verify <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[#6f554a]/40 pt-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setUseRecovery((prev) => !prev);
                  setRecoveryCode('');
                  setDigits(Array(CODE_LENGTH).fill(''));
                }}
                className="text-xs uppercase tracking-wider text-[#d1aa96] hover:text-[#f4e9e2] transition-colors underline underline-offset-4"
              >
                {useRecovery ? "Use authenticator code instead" : "Use a recovery code"}
              </button>
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
