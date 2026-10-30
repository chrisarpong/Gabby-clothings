import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import logo from '../assets/logo_transparent.png';

export default function StaffSetup2FA() {
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [codesSaved, setCodesSaved] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setup2FA, verify2FA, profile, token } = useStaffAuth();
  const setupStarted = useRef(false);
  const navigationStarted = useRef(false);
  const setupActionRef = useRef(setup2FA);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setupActionRef.current = setup2FA;
  }, [setup2FA]);

  useEffect(() => {
    if (setupStarted.current || !token) return;
    setupStarted.current = true;
    async function load() {
      try {
        const data = await setupActionRef.current();
        setSetupData(data);
      } catch (err: any) {
        const message = err.message || "Failed to load 2FA setup";
        setSetupError(message);
        toast.error(message);
      }
    }
    load();
  }, [token]);

  useEffect(() => {
    if (profile?.totpEnabled && setupComplete && codesSaved && !navigationStarted.current && location.pathname !== '/admin') {
      navigationStarted.current = true;
      navigate('/admin', { replace: true });
    }
  }, [location.pathname, navigate, profile?.totpEnabled, setupComplete, codesSaved]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verify2FA(token || "", code, true);
      if (res.status !== 'success') throw new Error('2FA verification did not complete');
      setRecoveryCodes(res.recoveryCodes ?? []);
      setSetupComplete(true);
      toast.success("2FA enabled successfully");
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#17110f] px-4 py-8 text-[#f4e9e2] sm:px-8 lg:flex lg:items-center lg:justify-center">
      <div className="grid w-full max-w-5xl overflow-hidden border border-[#6f554a]/40 bg-[#241916] shadow-2xl lg:grid-cols-[0.82fr_1.18fr]">
        <section className="relative hidden min-h-[680px] flex-col justify-between overflow-hidden bg-cover bg-center p-12 lg:flex" style={{ backgroundImage: "linear-gradient(135deg, rgba(29,20,18,0.93), rgba(29,20,18,0.74)), url('/assets/parallax-bg.jpg')" }}>
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#ad8774]/20" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-[#ad8774]/20" />
          <div className="relative z-10"><img src={logo} alt="Gabby Newluk" className="h-16 w-16 object-contain" /><p className="mt-12 text-[10px] uppercase tracking-[0.35em] text-[#c7a99c]">Secure first access</p><h2 className="mt-4 max-w-sm font-serif text-5xl leading-[1.04] text-[#f4e9e2]">Protect your workspace.</h2><p className="mt-6 max-w-sm text-sm leading-7 text-[#bfa9a0]">Connect your authenticator app once. You will use its six-digit code each time you sign in.</p></div>
          <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a98b7e]"><QrCode size={15} /> Authenticator setup</div>
        </section>

        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eadbd3] text-[#241916]"><QrCode size={23} /></div><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#b99687]">Account security</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#f4e9e2]">Set up 2FA</h1><p className="mt-2 text-sm leading-6 text-[#bfa9a0]">Scan the code with Google Authenticator, 1Password, Authy, or another TOTP app.</p></div></div>

          {setupError ? (
            <div className="space-y-4 border border-[#a9554b]/60 bg-[#3a211e] p-5 text-sm text-[#f4e9e2]"><p className="font-semibold text-[#ffb4a9]">We could not start 2FA setup.</p><p className="leading-6 text-[#e8c9bf]">{setupError}</p><button type="button" onClick={() => window.location.reload()} className="w-full bg-[#eadbd3] py-3 text-sm font-bold uppercase tracking-widest text-[#241916] hover:bg-white">Try again</button></div>
          ) : !setupData ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-[#bfa9a0]"><Loader2 className="animate-spin text-[#eadbd3]" size={32} /><span>Preparing your secure setup…</span></div>
          ) : (
            <div className="space-y-6">
              <div className="border border-[#6f554a]/50 bg-[#17110f] p-6"><p className="mb-5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7a99c]">1. Scan this QR code</p><p className="mb-4 text-center text-sm font-semibold text-[#fff1e9]">Do not reload this page; scan the code now.</p><div className="flex justify-center"><QRCodeSVG value={setupData.uri} size={210} includeMargin className="rounded bg-white p-2" /></div><p className="mt-5 text-center text-xs leading-5 text-[#bfa9a0]">If you cannot scan it, enter the setup key manually in your authenticator app.</p><div className="mt-3 rounded border border-[#6f554a]/50 bg-[#2c201d] px-4 py-3 text-center"><code className="select-all break-all font-mono text-sm font-semibold tracking-wider text-[#fff1e9]">{setupData.secret}</code></div></div>
              {recoveryCodes ? <div className="space-y-4 border border-[#6f554a]/50 bg-[#2c201d] p-6"><h2 className="text-lg font-semibold text-[#fff1e9]">Save your recovery codes</h2><p className="text-sm text-[#e8c9bf]">Store these codes somewhere safe. Each can be used once if you lose your authenticator.</p><div className="grid grid-cols-2 gap-2 rounded bg-[#17110f] p-4 font-mono text-sm text-[#fff1e9]">{recoveryCodes.map((item) => <code key={item}>{item}</code>)}</div><label className="flex items-center gap-3 text-sm text-[#fff1e9]"><input type="checkbox" checked={codesSaved} onChange={(e) => setCodesSaved(e.target.checked)} /> I saved my recovery codes</label><button type="button" disabled={!codesSaved} onClick={() => navigate('/admin', { replace: true })} className="w-full bg-[#eadbd3] py-3 text-sm font-bold uppercase tracking-widest text-[#241916] disabled:opacity-40">Continue</button></div> : <form onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="authenticator-code" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c7a99c]">2. Enter your 6-digit code</label><input id="authenticator-code" type="text" inputMode="numeric" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full border border-[#76594d] bg-[#17110f] p-4 text-center font-mono text-2xl font-semibold tracking-[0.5em] text-[#fff1e9] outline-none placeholder:text-[#806b62] focus:border-[#eadbd3]" placeholder="000000" autoComplete="one-time-code" /></div><button type="submit" disabled={loading || code.length !== 6} className="flex h-13 w-full items-center justify-center bg-[#eadbd3] py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#241916] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & enable'}</button></form>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
