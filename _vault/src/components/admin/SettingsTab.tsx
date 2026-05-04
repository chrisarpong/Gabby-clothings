import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function SettingsTab() {
  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);
  const allUsers = useQuery(api.users.getAllUsers) || [];
  const revokeAdminMutation = useMutation(api.settings.revokeAdmin);

  const adminUsers = allUsers.filter(u => u.role === 'admin');

  const [formData, setFormData] = useState({
    shippingRate: '50.00',
    expeditedRate: '150.00',
    taxRate: '8.5',
    bannerText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        shippingRate: settings.shippingRate?.toString() || '50.00',
        expeditedRate: settings.expeditedRate?.toString() || '150.00',
        taxRate: settings.taxRate?.toString() || '8.5',
        bannerText: settings.bannerText || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSettings({
        shippingRate: parseFloat(formData.shippingRate),
        expeditedRate: parseFloat(formData.expeditedRate),
        taxRate: parseFloat(formData.taxRate),
        bannerText: formData.bannerText
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (userId: any) => {
    if (confirm("Revoke executive access for this user?")) {
      try {
        await revokeAdminMutation({ userId });
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl w-full"
    >
      <header className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">System Directives</h2>
            <h1 className="font-serif text-3xl md:text-4xl">Atelier Governance</h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-16">
        {/* Fiscal Rules */}
        <section>
          <h3 className="font-serif text-2xl mb-8">Fiscal Rules</h3>
          <div className="space-y-8 bg-white border border-espresso/10 p-6 md:p-10 shadow-none rounded-none">
            <div className="flex items-end justify-between border-b border-espresso/10 pb-4">
              <div className="w-full sm:w-1/2">
                <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Standard Shipping Rate (₵)</label>
                <input 
                  type="number" 
                  value={formData.shippingRate}
                  onChange={(e) => setFormData({...formData, shippingRate: e.target.value})}
                  className="w-full bg-transparent border-none py-2 outline-none font-serif text-2xl text-espresso disabled:opacity-50" 
                />
              </div>
            </div>
            
            <div className="flex items-end justify-between border-b border-espresso/10 pb-4">
              <div className="w-full sm:w-1/2">
                <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Expedited Courier Rate (₵)</label>
                <input 
                  type="number" 
                  value={formData.expeditedRate}
                  onChange={(e) => setFormData({...formData, expeditedRate: e.target.value})}
                  className="w-full bg-transparent border-none py-2 outline-none font-serif text-2xl text-espresso disabled:opacity-50" 
                />
              </div>
            </div>

            <div className="flex items-end justify-between border-b border-espresso/10 pb-4">
              <div className="w-full sm:w-1/2">
                <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Domestic Tax Valuation (%)</label>
                <input 
                  type="number" 
                  value={formData.taxRate}
                  onChange={(e) => setFormData({...formData, taxRate: e.target.value})}
                  className="w-full bg-transparent border-none py-2 outline-none font-serif text-2xl text-espresso disabled:opacity-50" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Public Announcements */}
        <section>
          <h3 className="font-serif text-2xl mb-8">Announcements</h3>
          <div className="space-y-8 bg-white border border-espresso/10 p-6 md:p-10 shadow-none rounded-none">
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Storefront Banner Dictation</label>
              <textarea 
                value={formData.bannerText}
                onChange={(e) => setFormData({...formData, bannerText: e.target.value})}
                placeholder="ENTER STOREFRONT ANNOUNCEMENT..."
                rows={3} 
                className="w-full bg-transparent border border-espresso/20 p-4 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none uppercase text-espresso transition-colors resize-none leading-relaxed disabled:opacity-50" 
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-espresso text-white py-3 px-8 font-sans text-[9px] uppercase tracking-[0.4em] hover:bg-espresso/90 transition-colors shadow-none rounded-none disabled:opacity-50"
              >
                {isSubmitting ? 'Codifying...' : 'Codify Rules'}
              </button>
            </div>
          </div>
        </section>

        {/* Personnel Management */}
        <section>
          <h3 className="font-serif text-2xl mb-8">Personnel Roster</h3>
          <div className="bg-white border border-espresso/10 p-6 md:p-10 shadow-none rounded-none">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50">Active Executive Staff</h4>
              </div>
            </div>
            
            <div className="space-y-6">
              {adminUsers.map((admin: any) => (
                <div key={admin._id} className="flex justify-between items-center border-b border-espresso/10 pb-4">
                  <div>
                    <div className="font-serif tracking-wide text-espresso text-lg">{admin.firstName} {admin.lastName}</div>
                    <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-espresso/50 mt-1">{admin.email}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/40">Executive</span>
                    {adminUsers.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRevoke(admin._id)}
                        className="font-sans text-[9px] uppercase tracking-[0.4em] text-red-800/60 hover:text-red-900 border-b border-red-900/10 hover:border-red-900 pb-1 transition-all"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </form>
    </motion.div>
  );
}
