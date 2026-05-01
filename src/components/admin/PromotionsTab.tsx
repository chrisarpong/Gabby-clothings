import { useState } from 'react';
import { ChevronDown, Tag, Archive } from 'lucide-react';
import { toast } from 'sonner';

interface PromotionsTabProps {
  promoCodes: any[];
  createPromoCode: any;
  togglePromoCode: any;
}

export const PromotionsTab = ({
  promoCodes,
  createPromoCode,
  togglePromoCode,
}: PromotionsTabProps) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed' | 'shipping',
    value: '',
  });

  const activePromos = promoCodes?.filter(p => p.isActive) || [];
  const archivedPromos = promoCodes?.filter(p => !p.isActive) || [];

  const handleGenerate = async () => {
    if (!formData.code.trim()) {
      toast.error('Please enter a code name.');
      return;
    }
    if (formData.discountType !== 'shipping' && !formData.value) {
      toast.error('Please enter a discount value.');
      return;
    }

    const discountPercentage = formData.discountType === 'shipping'
      ? 0
      : parseFloat(formData.value);

    try {
      await createPromoCode({
        code: formData.code.toUpperCase(),
        discountPercentage,
        isActive: true,
      });
      toast.success(`Promo code "${formData.code.toUpperCase()}" generated!`);
      setFormData({ code: '', discountType: 'percentage', value: '' });
    } catch (error) {
      toast.error('Failed to create promo code.');
    }
  };

  const handleToggle = (promoId: string, currentStatus: boolean) => {
    toast.promise(
      togglePromoCode({ promoId: promoId as any, isActive: !currentStatus }),
      {
        loading: 'Updating...',
        success: currentStatus ? 'Promo deactivated' : 'Promo reactivated',
        error: 'Failed to update status',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Promotions
        </h2>
        <p className="text-sm text-[#3a1f1d]/60 mt-1">Create and manage discount codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-base font-semibold text-[#2C1816] mb-4">Active Promotions</h3>
            {promoCodes === undefined ? (
              <p className="text-sm text-[#3a1f1d]/40">Loading promotions...</p>
            ) : activePromos.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#3a1f1d]/8 p-8 text-center">
                <Tag className="w-8 h-8 text-[#3a1f1d]/20 mx-auto mb-3" />
                <p className="text-sm text-[#3a1f1d]/40">No active promotions. Create one to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePromos.map((promo) => (
                  <div key={promo._id} className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-5 group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                      <button
                        onClick={() => handleToggle(promo._id, promo.isActive)}
                        className="text-xs text-[#3a1f1d]/40 hover:text-[#3a1f1d] transition-colors"
                      >
                        Deactivate
                      </button>
                    </div>
                    <h4 className="text-lg font-mono font-semibold text-[#2C1816] tracking-wider uppercase mb-2">
                      {promo.code}
                    </h4>
                    <p className="text-sm text-[#3a1f1d]/60 mb-4">
                      {promo.discountPercentage > 0
                        ? `${promo.discountPercentage}% OFF ALL COLLECTIONS`
                        : 'FREE SHIPPING'}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-[#3a1f1d]/8">
                      <div>
                        <span className="text-xs text-[#3a1f1d]/40">Discount</span>
                        <p className="text-lg font-semibold text-[#2C1816]">
                          {promo.discountPercentage > 0 ? `${promo.discountPercentage}%` : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#3a1f1d]/40">Created</span>
                        <p className="text-sm text-[#3a1f1d]/70">
                          {new Date(promo._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {archivedPromos.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-[#2C1816] mb-4">Archived</h3>
              <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
                <div className="divide-y divide-[#3a1f1d]/5">
                  {archivedPromos.map((promo) => (
                    <div key={promo._id} className="flex items-center justify-between p-4 hover:bg-[#FDFBF9] transition-colors">
                      <div className="flex items-center gap-4">
                        <Archive className="w-4 h-4 text-[#3a1f1d]/30" />
                        <div>
                          <span className="font-mono font-medium text-[#2C1816] uppercase">{promo.code}</span>
                          <p className="text-xs text-[#3a1f1d]/50 mt-0.5">
                            {promo.discountPercentage > 0 ? `${promo.discountPercentage}% Off` : 'Free Shipping'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(promo._id, promo.isActive)}
                        className="text-xs font-medium text-[#3a1f1d] hover:text-[#2C1816] transition-colors"
                      >
                        Reactivate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6 sticky top-6">
            <h3 className="text-base font-semibold text-[#2C1816] mb-5">Generate Code</h3>
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Code Name</label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm font-mono text-[#2C1816] uppercase tracking-wider focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                  placeholder="VIPEXCLUSIVE"
                  type="text"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Discount Type</label>
                <div className="relative">
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors cursor-pointer appearance-none outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (GHS)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a1f1d]/30 pointer-events-none" />
                </div>
              </div>

              {formData.discountType !== 'shipping' && (
                <div>
                  <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Value</label>
                  <input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                    placeholder="20"
                    type="number"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ code: '', discountType: 'percentage', value: '' })}
                  className="flex-1 border border-[#3a1f1d]/15 text-[#3a1f1d] text-sm font-medium py-2.5 rounded-lg hover:bg-[#3a1f1d]/5 transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="flex-1 bg-[#3a1f1d] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#2C1816] transition-colors"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
