import { useState } from 'react';
import { motion } from 'motion/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function PromotionsTab() {
  const promos = useQuery(api.promotions.getPromoCodes) || [];
  const createPromo = useMutation(api.promotions.createPromoCode);
  const togglePromoMutation = useMutation(api.promotions.togglePromoCode);

  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountPercentage || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPromo({
        code: formData.code.toUpperCase(),
        discountPercentage: parseFloat(formData.discountPercentage),
        isActive: formData.isActive
      });
      setFormData({ code: '', discountPercentage: '', isActive: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (promoId: string) => {
    try {
      await togglePromoMutation({ id: promoId as any });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl w-full"
    >
      <header className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">Exclusivity Tools</h2>
            <h1 className="font-serif text-3xl md:text-4xl">Promo Manifest</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
        {/* Left Column: Generate Incentive */}
        <div className="w-full lg:w-1/3 shrink-0">
          <h3 className="font-serif text-2xl mb-8">Bespoke Incentive</h3>
          <form className="bg-white border border-espresso/10 p-8 shadow-none rounded-none space-y-8" onSubmit={handleSubmit}>
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Code Nomenclature</label>
              <input 
                type="text" 
                placeholder="E.G. SUMMERGALA" 
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors" 
              />
            </div>
            
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Discount Valuation (%)</label>
              <input 
                type="number" 
                placeholder="10" 
                value={formData.discountPercentage}
                onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors" 
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded-none accent-espresso border-espresso/20" 
              />
              <label htmlFor="isActive" className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso cursor-pointer">Immediately Active</label>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-espresso text-white py-4 font-sans text-[10px] uppercase tracking-[0.4em] hover:bg-espresso/90 transition-colors shadow-none rounded-none mt-4 disabled:opacity-50"
            >
              {isSubmitting ? 'Forging...' : 'Forge Incentive'}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Promos */}
        <div className="flex-1 w-full lg:w-auto">
          <h3 className="font-serif text-2xl mb-8">Circulating Codes</h3>
          <div className="space-y-4">
            {promos.length > 0 ? promos.map((p: any) => (
              <div key={p._id} className={`border border-espresso/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center transition-colors shadow-none rounded-none gap-6 md:gap-0 ${p.isActive ? 'bg-white' : 'bg-bone/50 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 w-full md:w-auto">
                  <div className="w-full sm:w-32">
                    <div className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Code</div>
                    <div className="font-serif text-2xl tracking-widest truncate">{p.code}</div>
                  </div>
                  <div>
                    <div className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Discount</div>
                    <div className="font-serif text-2xl">{p.discountPercentage}%</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto pt-4 border-t border-espresso/10 md:border-t-0 md:pt-0">
                  <span className={`font-sans text-[9px] uppercase tracking-[0.4em] border px-3 py-1 ${p.isActive ? 'text-emerald-900 border-emerald-900/20 bg-emerald-50' : 'text-red-900 border-red-900/20 bg-red-50'}`}>
                    {p.isActive ? 'ACTIVE' : 'DORMANT'}
                  </span>
                  <button 
                    onClick={() => handleToggle(p._id)}
                    className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 hover:text-espresso border-b border-espresso/10 hover:border-espresso pb-1 transition-all"
                  >
                    {p.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center text-espresso/50 border border-dashed border-espresso/20">
                <p className="font-serif text-xl italic mb-2">No active codes.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
