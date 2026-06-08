import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';

export default function PromotionsTab() {
  const promos = useQuery(api.promotions.getPromoCodes) || [];
  const createPromo = useMutation(api.promotions.createPromoCode);
  const sendBroadcast = useAction(api.email.sendPromoBroadcast);
  
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 10,
    isActive: true
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) return;
    
    try {
      await createPromo({
        code: formData.code.toUpperCase(),
        discountType: "percentage",
        discountValue: Number(formData.discountPercentage),
        isActive: formData.isActive
      });
      toast.success("Promo code created successfully");
      setFormData({ code: '', discountPercentage: 10, isActive: true });
    } catch (e) {
      toast.error("Failed to create promo code");
    }
  };

  const handleBroadcast = async (promoCode: string, discountValue: number) => {
    const conf = window.confirm(`Are you sure you want to email ALL users about ${promoCode}?`);
    if (!conf) return;
    
    setIsBroadcasting(true);
    toast.info(`Sending broadcast for ${promoCode}...`);
    try {
      const result = await sendBroadcast({ promoCode, discountValue });
      toast.success(result);
    } catch (error) {
      toast.error("Failed to send broadcast");
      console.error(error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full flex flex-col overflow-y-auto">
      <div className="flex justify-between items-end mb-8 border-b border-brand-charcoal/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-brand-espresso mb-1">Promotions</h2>
          <p className="text-sm text-brand-charcoal/70">Manage seasonal discounts and VIP codes.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <table className="w-full text-left border-collapse bg-white border border-brand-espresso/10">
            <thead>
              <tr className="bg-brand-bone border-b border-brand-espresso/10">
                <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Code</th>
                <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Discount</th>
                <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-brand-charcoal/50 italic text-sm">No promo codes active.</td>
                </tr>
              )}
              {promos.map((promo: Doc<"promotions">) => (
                <tr key={promo._id} className="border-b border-brand-espresso/5 hover:bg-brand-bone/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-brand-espresso">{promo.code}</td>
                  <td className="p-4 text-sm text-brand-charcoal">{promo.discountValue}%</td>
                  <td className="p-4 flex items-center gap-4">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {promo.isActive && (
                      <button 
                        disabled={isBroadcasting}
                        onClick={() => handleBroadcast(promo.code, promo.discountValue)}
                        className="text-[10px] tracking-widest uppercase px-3 py-1 bg-brand-espresso text-white hover:bg-brand-charcoal transition-colors ml-auto disabled:opacity-50"
                      >
                        {isBroadcasting ? 'Sending...' : 'Broadcast'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="bg-white border border-brand-espresso/10 p-6">
             <h3 className="font-serif text-xl text-brand-espresso mb-6">Create New Code</h3>
             <form onSubmit={handleSubmit} className="flex flex-col gap-4">
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 block mb-1">Promo Code</label>
                 <input 
                   type="text" 
                   required
                   value={formData.code}
                   onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                   className="w-full bg-brand-bone border border-brand-espresso/10 p-3 text-sm focus:outline-none focus:border-brand-espresso uppercase font-mono"
                   placeholder="E.g. VIP20"
                 />
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 block mb-1">Discount %</label>
                 <input 
                   type="number" 
                   min="1"
                   max="100"
                   required
                   value={formData.discountPercentage}
                   onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})}
                   className="w-full bg-brand-bone border border-brand-espresso/10 p-3 text-sm focus:outline-none focus:border-brand-espresso"
                 />
               </div>
               <div className="flex items-center gap-2 mt-2">
                 <input 
                   type="checkbox" 
                   checked={formData.isActive}
                   onChange={e => setFormData({...formData, isActive: e.target.checked})}
                   className="w-4 h-4 border-brand-espresso/20 text-brand-espresso focus:ring-0 rounded-none cursor-pointer"
                 />
                 <label className="text-sm text-brand-charcoal cursor-pointer">Active immediately</label>
               </div>

               <button type="submit" className="mt-4 w-full bg-brand-espresso text-white text-[11px] uppercase tracking-widest py-3 hover:bg-brand-charcoal transition-colors">
                 Generate Code
               </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
