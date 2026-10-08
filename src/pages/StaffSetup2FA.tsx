import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StaffSetup2FA() {
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { setup2FA, verify2FA, profile, token } = useStaffAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await setup2FA();
        setSetupData(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load 2FA setup");
      }
    }
    load();
  }, [setup2FA]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const res = await verify2FA(token || "", code, true);
      toast.success("2FA enabled successfully");
      navigate('/admin', { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="max-w-md w-full bg-surface-container border border-outline-variant/30 p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <QrCode size={32} />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-on-surface">Setup 2FA</h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Scan the QR code with your authenticator app to enable Two-Factor Authentication.
          </p>
        </div>

        {!setupData ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface p-4 border border-outline-variant/30 flex justify-center">
              {/* Note: we should render a real QR code using a library like qrcode.react, but for now we'll just show the URI/Secret */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Manual Entry Code:</p>
                <code className="text-lg font-mono bg-surface-container px-2 py-1 select-all">{setupData.secret}</code>
              </div>
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
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify & Enable"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
