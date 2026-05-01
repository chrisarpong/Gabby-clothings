import React, { useState } from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-32 max-w-3xl">
        <h1 className="text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#220b09] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          VIP Promotions & Incentives
        </h1>
        <p className="text-[16px] tracking-[0.01em] text-[#504443] max-w-xl" style={{ fontFamily: "'Jost', sans-serif" }}>
          Curate and manage exclusive offers for our distinguished clientele. Precision in every detail, from fabric to incentive.
        </p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Promotions & History */}
        <div className="lg:col-span-8 flex flex-col gap-32">

          {/* Active Promotions Grid */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-[#827472]/20 pb-4">
              <h2 className="text-[32px] font-normal leading-[1.2] text-[#220b09]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Active Promotions
              </h2>
            </div>

            {promoCodes === undefined ? (
              <p className="text-[13px] text-[#504443] italic">Loading promotions...</p>
            ) : activePromos.length === 0 ? (
              <p className="text-[13px] text-[#504443] italic">No active promotions.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePromos.map((promo) => (
                  <Card key={promo._id} className="border border-[#827472]/20 p-6 flex flex-col bg-[#faf9f7] hover:bg-[#ffffff] transition-colors duration-300 group rounded-none shadow-none">
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-[11px] font-semibold tracking-[0.15em] text-[#220b09] bg-[#220b09]/5 px-2 py-1 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                        Active
                      </span>
                      <button
                        onClick={() => handleToggle(promo._id, promo.isActive)}
                        className="text-[#504443] hover:text-[#220b09] transition-colors"
                        title="Deactivate"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-[32px] font-normal leading-[1.2] text-[#220b09] tracking-wider uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {promo.code}
                      </h3>
                      <div className="text-[16px] tracking-[0.01em] text-[#504443] mt-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                        {promo.discountPercentage > 0
                          ? `${promo.discountPercentage}% OFF ALL COLLECTIONS`
                          : 'FREE SHIPPING'}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-auto pt-6 border-t border-[#827472]/10">
                      <div>
                        <div className="text-[10px] tracking-[0.05em] text-[#504443] uppercase mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Discount
                        </div>
                        <div className="text-[24px] font-normal leading-none text-[#220b09]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {promo.discountPercentage > 0 ? `${promo.discountPercentage}%` : '—'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] tracking-[0.05em] text-[#504443] uppercase mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Created
                        </div>
                        <div className="text-[16px] tracking-[0.01em] text-[#220b09]" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {new Date(promo._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Archived History Table */}
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-[#827472]/20 pb-4">
              <h2 className="text-[32px] font-normal leading-[1.2] text-[#220b09]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Archived History
              </h2>
            </div>
            <div className="w-full">
              {/* Grid-based header to match HTML */}
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#827472]/10 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                <div className="col-span-3">Code</div>
                <div className="col-span-3">Value</div>
                <div className="col-span-2">Discount</div>
                <div className="col-span-4 text-right">Status</div>
              </div>

              {archivedPromos.length === 0 ? (
                <div className="py-8 text-center text-[#504443] italic text-sm">No archived promotions.</div>
              ) : (
                archivedPromos.map((promo) => (
                  <div key={promo._id} className="grid grid-cols-12 gap-4 py-6 border-b border-[#827472]/10 items-center hover:bg-[#ffffff] transition-colors">
                    <div className="col-span-3 text-[18px] text-[#220b09] uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {promo.code}
                    </div>
                    <div className="col-span-3 text-[16px] tracking-[0.01em] text-[#504443]" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {promo.discountPercentage > 0 ? `${promo.discountPercentage}% Off` : 'Free Shipping'}
                    </div>
                    <div className="col-span-2 text-[18px] text-[#220b09]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {promo.discountPercentage > 0 ? `${promo.discountPercentage}%` : '—'}
                    </div>
                    <div className="col-span-4 text-right">
                      <button
                        onClick={() => handleToggle(promo._id, promo.isActive)}
                        className="text-[10px] tracking-[0.05em] text-[#ba1a1a] uppercase hover:text-[#220b09] transition-colors cursor-pointer"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        Deactivated — Reactivate?
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Generate Code Form */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-12 border border-[#827472]/20 p-8 bg-[#ffffff]">
            <h2 className="text-[24px] font-normal text-[#220b09] mb-8 border-b border-[#827472]/20 pb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Generate Code
            </h2>
            <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
              {/* Code Name */}
              <div className="relative">
                <label className="block text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Code Name
                </label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-transparent border-0 border-b border-[#827472]/30 px-0 py-2 text-[20px] text-[#220b09] focus:ring-0 focus:border-[#220b09] placeholder:text-[#827472]/30 uppercase tracking-wider transition-colors outline-none"
                  placeholder="e.g. VIPEXCLUSIVE"
                  type="text"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                />
              </div>

              {/* Discount Type */}
              <div className="relative">
                <label className="block text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  className="w-full bg-transparent border-0 border-b border-[#827472]/30 px-0 py-2 text-[16px] tracking-[0.01em] text-[#220b09] focus:ring-0 focus:border-[#220b09] transition-colors appearance-none cursor-pointer outline-none"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (GHS)</option>
                  <option value="shipping">Free Shipping</option>
                </select>
                <ChevronDown className="absolute right-0 bottom-3 w-4 h-4 text-[#827472]/50 pointer-events-none" />
              </div>

              {/* Value */}
              {formData.discountType !== 'shipping' && (
                <div className="relative">
                  <label className="block text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Value
                  </label>
                  <input
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-[#827472]/30 px-0 py-2 text-[20px] text-[#220b09] focus:ring-0 focus:border-[#220b09] placeholder:text-[#827472]/30 transition-colors outline-none"
                    placeholder="20"
                    type="number"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ code: '', discountType: 'percentage', value: '' })}
                  className="w-full border border-[#220b09]/20 text-[#220b09] text-[11px] font-semibold tracking-[0.15em] uppercase py-4 hover:bg-[#220b09]/5 transition-colors"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full bg-[#220b09] text-white text-[11px] font-semibold tracking-[0.15em] uppercase py-4 hover:bg-[#220b09]/90 transition-colors"
                  style={{ fontFamily: "'Jost', sans-serif" }}
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
