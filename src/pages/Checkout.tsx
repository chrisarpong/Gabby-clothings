import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Lock, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useQuery, useAction } from "@/hooks/useConvex";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { PaystackButton } from "react-paystack";
import { toast } from "sonner";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../utils/currency";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { items, clearCart } = useCartStore();
  const { activeCurrency, rates } = useCurrencyStore();
  
  const allProducts = useQuery(api.products.getAll);
  const standardShippingRateObj = useQuery(api.settings.getByKey, { key: "standardShippingRate" });

  const [shippingAddress, setShippingAddress] = useState({
    street: "", city: "", region: "", postalCode: "", country: "Ghana"
  });

  const [measurements, setMeasurements] = useState({
    chest: "", waist: "", hips: "", shoulder: "", sleeve: "", inseam: "", length: ""
  });
  const [hasValidMeasurements, setHasValidMeasurements] = useState(false);

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ discountAmount: number, code: string } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const convex = useConvex();

  const [isSuccess, setIsSuccess] = useState(false);

  const softReserveItems = useMutation(api.inventory.softReserveItems);

  React.useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      navigate("/cart");
    } else if (items.length > 0 && !isSuccess) {
      // Trigger soft reserve
      const sessionId = localStorage.getItem("gabby_guest_session") || crypto.randomUUID();
      if (!localStorage.getItem("gabby_guest_session")) {
        localStorage.setItem("gabby_guest_session", sessionId);
      }
      const userId = user?.id || sessionId;

      softReserveItems({
        userId,
        items: items.map(i => ({
          productId: i.productId as any,
          variantSku: i.variantSku,
          quantity: i.quantity
        }))
      }).catch((e) => {
        toast.error(e.message || "Some items in your cart may no longer be available.");
      });
    }
  }, [items, navigate, isSuccess, user, softReserveItems]);

  React.useEffect(() => {
    const saved = localStorage.getItem("gabby_newluk_measurements");
    if (saved) {
      const parsed = JSON.parse(saved);
      setMeasurements(parsed);
      const required = ["chest", "waist", "hips", "shoulder", "sleeve", "inseam", "length"];
      if (required.every(field => parsed[field])) {
        setHasValidMeasurements(true);
      }
    }
  }, []);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMeasurements = { ...measurements, [e.target.name]: e.target.value };
    setMeasurements(newMeasurements);
    const required = ["chest", "waist", "hips", "shoulder", "sleeve", "inseam", "length"];
    if (required.every(field => newMeasurements[field as keyof typeof newMeasurements])) {
      setHasValidMeasurements(true);
      localStorage.setItem("gabby_newluk_measurements", JSON.stringify(newMeasurements));
    } else {
      setHasValidMeasurements(false);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return null;
  }

  const cartItemsWithDetails = allProducts === undefined ? [] : items.map(item => {
    const product = allProducts.find(p => p._id === item.productId);
    return { ...item, product };
  }).filter(i => i.product);

  const hasCustomFit = items.some(item => item.variantSku === "custom" || item.variantSku === undefined);

  const getAvailableStock = (item: any) => {
    if (item.variantSku === 'custom') return 99; // Custom fit doesn't have strict stock
    if (item.product?.variants && item.product.variants.length > 0) {
      const variant = item.product.variants.find((v: any) => v.sku === item.variantSku);
      return variant ? variant.stock : 0;
    }
    return item.product?.stock ?? 0;
  };

  const hasOutOfStockItems = cartItemsWithDetails.some((item: any) => item.quantity > getAvailableStock(item));

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item.product?.basePrice || 0) * item.quantity, 0);
  
  let discountAmount = appliedPromo?.discountAmount || 0;

  const shippingAmount = standardShippingRateObj?.value ?? 50.00;
  const totalAmount = subtotal - discountAmount + shippingAmount;

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setIsApplyingPromo(true);
    try {
      const result = await convex.mutation(api.promotions.applyPromoCode, { code: promoCodeInput.trim(), subtotal });
      if (result.valid) {
        setAppliedPromo({
          discountAmount: result.discountAmount,
          code: promoCodeInput.trim().toUpperCase(),
        });
        toast.success("Promo code applied!");
      } else {
        toast.error("Invalid or expired promo code");
        setAppliedPromo(null);
      }
      setPromoCodeInput("");
    } catch (e: any) {
      toast.error(e.message || "Failed to apply promo code");
      setAppliedPromo(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const createOrder = useAction(api.orders.verifyAndCreate);

  const handlePaystackSuccessAction = async (reference: any) => {
    if (!user) {
      toast.error("Please sign in to complete checkout.");
      return;
    }
    
    try {
      await createOrder({
        userId: user.id,
        customerDetails: {
          email: user.primaryEmailAddress?.emailAddress || "guest@gabby.com",
          firstName: user.firstName || "Guest",
          lastName: user.lastName || "User"
        },
        items: cartItemsWithDetails.map(i => ({
          productId: i.productId as any,
          variantSku: i.variantSku,
          quantity: i.quantity,
          productName: i.product?.name || i.productName || "Unknown Product",
        })),
        shippingAmount,
        paystackReference: reference.reference,
        shippingAddress,
        promoCode: appliedPromo?.code,
        baseTotalAmount: totalAmount,
        chargedCurrency: "GHS",
        chargedAmount: totalAmount,
        rateAtOrderTime: activeCurrency !== "GHS" && rates ? rates[activeCurrency] : undefined,
        displayCurrency: activeCurrency,
      });

      setIsSuccess(true);
      clearCart();
      navigate("/success");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong processing your order.");
    }
  };

  const handlePaystackCloseAction = () => {
    toast("Payment window closed.");
  };

  const componentProps = {
    email: user?.primaryEmailAddress?.emailAddress || "guest@gabby.com",
    amount: Math.round(totalAmount * 100),
    currency: "GHS",
    metadata: {
      name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`,
      custom_fields: []
    },
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    text: "PAY WITH PAYSTACK",
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  const isFormValid = shippingAddress.street && shippingAddress.city && shippingAddress.region && shippingAddress.postalCode && shippingAddress.country;

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface text-on-surface">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-primary tracking-wide mb-16 text-center">Checkout</h1>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-8">
            <h2 className="font-serif text-2xl text-primary mb-8">Shipping Information</h2>
            <form className="space-y-6">
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Street Address</label>
                <input 
                  type="text" 
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="w-full bg-surface border border-outline-variant p-4 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">City</label>
                  <input 
                    type="text" 
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full bg-surface border border-outline-variant p-4 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Region</label>
                  <input 
                    type="text" 
                    value={shippingAddress.region}
                    onChange={(e) => setShippingAddress({...shippingAddress, region: e.target.value})}
                    className="w-full bg-surface border border-outline-variant p-4 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Postal Code</label>
                  <input 
                    type="text" 
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                    className="w-full bg-surface border border-outline-variant p-4 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">Country</label>
                  <input 
                    type="text" 
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    className="w-full bg-surface border border-outline-variant p-4 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>
              </div>
            </form>
          </div>

          {hasCustomFit && (
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-primary mb-8 italic">Your Measurements</h2>
              <div className="bg-surface border border-outline-variant p-6 md:p-8">
                <p className="font-sans text-xs text-on-surface-variant mb-6 leading-relaxed">
                  You have Custom Fit items in your cart. Please confirm your measurements (in inches) before checking out.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Object.keys(measurements).map((key) => (
                    <div key={key}>
                      <label className="block text-[10px] uppercase tracking-widest text-outline mb-2">{key}</label>
                      <input
                        type="number"
                        name={key}
                        value={measurements[key as keyof typeof measurements]}
                        onChange={handleMeasurementChange}
                        placeholder="in."
                        className="w-full bg-transparent border-b border-surface-variant py-2 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="lg:col-span-4 mt-12 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-32 bg-surface-container/50 backdrop-blur-md border border-surface-variant p-8 md:p-12 mb-8"
            >
              <h2 className="font-serif text-2xl text-primary italic mb-8">Order Summary</h2>
              
              <div className="flex flex-col gap-4 font-sans text-sm text-on-surface-variant mb-8 border-b border-outline-variant/30 pb-8">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-primary tracking-widest font-label">{formatPrice(subtotal, activeCurrency, rates)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-label tracking-widest">-{formatPrice(discountAmount, activeCurrency, rates)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingAmount, activeCurrency, rates)}</span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mb-8">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Promo Code" 
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 bg-surface border border-outline-variant px-4 py-3 font-sans text-xs focus:outline-none focus:border-primary uppercase placeholder:normal-case"
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoCodeInput.trim()}
                    className="bg-transparent border border-outline-variant text-primary px-6 py-3 font-label text-[10px] tracking-widest uppercase hover:bg-surface-tint hover:text-on-primary transition-colors disabled:opacity-50"
                  >
                    {isApplyingPromo ? "..." : "Apply"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="font-serif text-lg text-primary">Estimated Total</span>
                <span className="font-label text-lg tracking-widest text-primary">{formatPrice(totalAmount, activeCurrency, rates)}</span>
              </div>

              {!user ? (
                 <p className="text-sm text-brand-espresso mb-8 border border-outline-variant p-4 text-center w-full block">Please Sign In to Checkout</p>
              ) : !(shippingAddress.street && shippingAddress.city && shippingAddress.region && shippingAddress.postalCode && shippingAddress.country) ? (
                 <button disabled className="w-full bg-surface-variant text-on-surface-variant py-5 font-label text-[11px] tracking-[0.2em] uppercase mb-8 cursor-not-allowed">
                   FILL SHIPPING ADDRESS
                 </button>
              ) : (hasCustomFit && !hasValidMeasurements) ? (
                 <button disabled className="w-full bg-surface-variant text-on-surface-variant py-5 font-label text-[11px] tracking-[0.2em] uppercase mb-8 cursor-not-allowed">
                   ENTER MEASUREMENTS
                 </button>
              ) : hasOutOfStockItems ? (
                 <button disabled className="w-full bg-surface-variant text-error border border-error py-5 font-label text-[11px] tracking-[0.2em] uppercase mb-8 cursor-not-allowed">
                   SOME ITEMS ARE OUT OF STOCK
                 </button>
              ) : (
                <div className="flex flex-col w-full gap-2 mb-8">
                  {activeCurrency !== 'GHS' && (
                    <div className="text-[10px] text-on-surface-variant bg-surface-variant p-3 font-sans leading-relaxed border border-outline-variant">
                      <span className="font-bold text-primary block mb-1">Billing Disclaimer</span>
                      Transactions are securely processed in GHS. You will be billed the equivalent of <span className="font-bold">{formatPrice(totalAmount, activeCurrency, rates)}</span> by your bank.
                    </div>
                  )}
                  <PaystackButton 
                    {...componentProps} 
                    className="w-full bg-primary text-on-primary py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors" 
                  />
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <Lock className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span className="font-sans text-xs">Secure Checkout. 256-bit encryption.</span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <Truck className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span className="font-sans text-xs">Nationwide priority delivery.</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
