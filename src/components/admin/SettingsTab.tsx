import React, { useState, useEffect } from 'react';
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Save, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsTab() {
  const settingsRecords = useQuery(api.settings.getAll);
  const setSetting = useMutation(api.settings.setSetting);
  
  const [formData, setFormData] = useState({
    storeName: 'Gabby Newluk',
    contactEmail: 'contact@gabbynewluk.com',
    standardShippingRate: 50,
    maintenanceMode: false,
    isBannerActive: true,
    announcementBannerText: 'Complimentary shipping on all bespoke suiting orders.',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync db state to local state
  useEffect(() => {
    if (settingsRecords) {
      const dbSettings = settingsRecords.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);
      
      setFormData(prev => ({
        ...prev,
        ...dbSettings
      }));
    }
  }, [settingsRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Loop over the keys and update them using the convex API
      const promises = Object.entries(formData).map(([key, value]) => {
        return setSetting({ key, value });
      });
      
      await Promise.all(promises);
      toast.success('Storefront configuration synced.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to sync storefront configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof formData]
    }));
  };

  if (settingsRecords === undefined) {
    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="flex justify-center items-center py-20 text-brand-charcoal/50 font-sans">
          Loading storefront configurations...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-8 border-b border-brand-espresso/10 bg-brand-bone/50 sticky top-0 z-10 flex justify-between items-end">
        <div>
          <h1 className="font-serif text-3xl text-brand-espresso tracking-wide">Storefront Settings</h1>
          <p className="font-sans text-brand-charcoal/70 text-sm mt-2">Manage the live state and public preferences of the CMS.</p>
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 bg-brand-gold text-brand-espresso px-8 py-3 font-sans text-xs tracking-widest uppercase hover:bg-brand-gold/80 transition-colors border border-transparent rounded-none disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Synchronizing...' : 'Save Configuration'}
        </button>
      </div>

      <div className="p-8 overflow-y-auto flex-1 max-w-4xl">
        <form className="flex flex-col gap-12" id="settings-form">
          
          {/* General Information */}
          <section>
            <h2 className="font-serif text-xl border-b border-brand-espresso/10 pb-4 mb-6 text-brand-espresso flex items-center gap-2">
              <Settings className="w-5 h-5 opacity-50" />
              General Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-brand-charcoal/70 mb-2">Store Name</label>
                <input 
                  type="text" 
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-4 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors placeholder:text-brand-charcoal/30"
                />
              </div>
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-brand-charcoal/70 mb-2">Contact Email</label>
                <input 
                  type="email" 
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-4 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors placeholder:text-brand-charcoal/30"
                />
              </div>
            </div>
          </section>

          {/* Operational Metrics */}
          <section>
             <h2 className="font-serif text-xl border-b border-brand-espresso/10 pb-4 mb-6 text-brand-espresso">Commercials</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-sans text-[10px] uppercase tracking-widest text-brand-charcoal/70 mb-2">Standard Shipping Rate (GH₵)</label>
                <input 
                  type="number" 
                  value={formData.standardShippingRate}
                  onChange={(e) => setFormData({...formData, standardShippingRate: parseFloat(e.target.value)})}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-4 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors"
                />
              </div>
             </div>
          </section>

          {/* Storefront Layout & Flags */}
          <section>
            <h2 className="font-serif text-xl border-b border-brand-espresso/10 pb-4 mb-6 text-brand-espresso">Storefront State</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-6 border border-brand-espresso/10 bg-brand-bone/30">
                <div>
                  <h3 className="font-sans text-sm uppercase tracking-widest text-brand-espresso mb-1">Maintenance Mode</h3>
                  <p className="font-sans text-xs text-brand-charcoal/60">Take the storefront offline. Only administrators can bypass this.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`w-14 h-7 rounded-full flex items-center transition-colors duration-300 ${formData.maintenanceMode ? 'bg-red-900 border-red-900' : 'bg-brand-bone border border-brand-espresso/20'}`}
                >
                  <span className={`block w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${formData.maintenanceMode ? 'translate-x-8 bg-white' : 'translate-x-1 bg-brand-charcoal/30'}`} />
                </button>
              </div>

              <div className="p-6 border border-brand-espresso/10 bg-brand-bone/30 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-sm uppercase tracking-widest text-brand-espresso mb-1">Top Announcement Banner</h3>
                    <p className="font-sans text-xs text-brand-charcoal/60">Display a global alert at the top of the storefront.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleToggle('isBannerActive')}
                    className={`w-14 h-7 rounded-full flex items-center transition-colors duration-300 ${formData.isBannerActive ? 'bg-green-800' : 'bg-brand-bone border border-brand-espresso/20'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ${formData.isBannerActive ? 'translate-x-8 bg-white' : 'translate-x-1 bg-brand-charcoal/30'}`} />
                  </button>
                </div>

                <div className={`transition-opacity duration-300 ${formData.isBannerActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <label className="block font-sans text-[10px] uppercase tracking-widest text-brand-charcoal/70 mb-2">Banner Copy</label>
                  <input 
                    type="text" 
                    value={formData.announcementBannerText}
                    onChange={(e) => setFormData({...formData, announcementBannerText: e.target.value})}
                    className="w-full bg-white border border-brand-espresso/20 p-4 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors text-center"
                    placeholder="Enter announcement text..."
                  />
                </div>
              </div>
            </div>
            
          </section>

        </form>
      </div>
    </div>
  );
}
