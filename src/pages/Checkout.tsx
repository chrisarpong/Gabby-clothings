import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Lock, Truck, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useQuery, useAction } from "@/hooks/useConvex";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { PaystackButton } from "react-paystack";
import { toast } from "sonner";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../utils/currency";
import { parseConvexError } from "../utils/errorParser";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { items, clearCart } = useCartStore();
  const { activeCurrency, rates } = useCurrencyStore();
  
  const allProducts = useQuery(api.products.getAll);
  const standardShippingRateObj = useQuery(api.settings.getByKey, { key: "standardShippingRate" });
  const convexMeasurements = useQuery(api.users.getMeasurements);

  const [shippingAddress, setShippingAddress] = useState({
    street: "", city: "", region: "", postalCode: "", country: "Ghana"
  });

  const [measurements, setMeasurements] = useState({
    chest: "", waist: "", hips: "", shoulder: "", sleeve: "", inseam: "", length: ""
  });
  
  const [hasValidMeasurements, setHasValidMeasurements] = useState(false);
  const [measurementsLinked, setMeasurementsLinked] = useState(false);
  
  // Accordion State
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

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
        toast.error(parseConvexError(e) || "Some items in your cart may no longer be available.");
      });
    }
  }, [items, navigate, isSuccess, user, softReserveItems]);

  React.useEffect(() => {
    // Smart Measurement Detection
    if (convexMeasurements) {
      setMeasurements(convexMeasurements as any);
      setHasValidMeasurements(true);
      setMeasurementsLinked(true);
    } else {
      const saved = localStorage.getItem("gabby_newluk_measurements");
      if (saved) {
        const parsed = JSON.parse(saved);
        setMeasurements(parsed);
        const required = ["chest", "waist", "hips", "shoulder", "sleeve", "inseam", "length"];
        if (required.every(field => parsed[field])) {
          setHasValidMeasurements(true);
        }
      }
    }
  }, [convexMeasurements]);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMeasurements = { ...measurements, [e.target.name]: e.target.value };
    setMeasurements(newMeasurements);
    setMeasurementsLinked(false); // If they manually change it, it's no longer the exact linked profile version
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
    if (!item.variantSku || item.variantSku === 'custom') return 99; 
    if (item.product?.variants && item.product.variants.length > 0) {
      const variant = item.product.variants.find((v: any) => v.sku === item.variantSku);
      return variant ? variant.stock : 0;
    }
    return 0;
  };

  const hasOutOfStockItems = cartItemsWithDetails.some((item: any) => item.quantity > getAvailableStock(item));

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item.product?.basePrice || 0) * item.quantity, 0);
  let discountAmount = appliedPromo?.discountAmount || 0;
  const shippingAmount = Number(standardShippingRateObj?.value ?? 50.00);
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
      toast.error(parseConvexError(e) || "Failed to apply promo code");
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
          measurements: (!i.variantSku || i.variantSku === "custom") ? measurements : undefined,
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
    text: "COMPLETE PURCHASE",
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  const isShippingValid = shippingAddress.street && shippingAddress.city && shippingAddress.region && shippingAddress.postalCode && shippingAddress.country;

  const proceedToMeasurements = () => {
    if (!isShippingValid) {
      toast.error("Please fill in your shipping details.");
      return;
    }
    setActiveStep(2);
  };

  const proceedToPayment = () => {
    if (hasCustomFit && !hasValidMeasurements) {
      toast.error("Please provide your measurements for your Custom Fit items.");
      return;
    }
    setActiveStep(3);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-5 md:px-12 bg-surface text-on-surface">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-primary tracking-wide">Secure Checkout</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-2">Complete your custom-fit order.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: Flow Accordion */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Step 1: Shipping */}
            <div className={`border transition-colors duration-300 ${activeStep === 1 ? 'border-primary' : 'border-outline-variant/50'} bg-surface`}>
              <div 
                className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveStep(1)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center font-serif text-sm transition-colors ${activeStep === 1 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                    1
                  </div>
                  <h2 className="font-serif text-2xl text-primary">Shipping Information</h2>
                </div>
                {isShippingValid && activeStep !== 1 && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              </div>
              
              <AnimatePresence>
                {activeStep === 1 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 md:p-8 pt-0 border-t border-outline-variant/30 mt-4">
                      <form className="space-y-6 pt-4">
                        <div>
                          <label className="block font-sans text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Street Address</label>
                          <input 
                            type="text" 
                            value={shippingAddress.street}
                            onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                            className="w-full bg-transparent border-b border-surface-variant py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                            placeholder="e.g. 123 Independence Ave"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block font-sans text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">City</label>
                            <input 
                              type="text" 
                              value={shippingAddress.city}
                              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                              className="w-full bg-transparent border-b border-surface-variant py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                              placeholder="e.g. Accra"
                              required
                            />
                          </div>
                          <div>
                            <label className="block font-sans text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Region/State</label>
                            <input 
                              type="text" 
                              value={shippingAddress.region}
                              onChange={(e) => setShippingAddress({...shippingAddress, region: e.target.value})}
                              className="w-full bg-transparent border-b border-surface-variant py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                              placeholder="e.g. Greater Accra"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block font-sans text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Postal Code</label>
                            <input 
                              type="text" 
                              value={shippingAddress.postalCode}
                              onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                              className="w-full bg-transparent border-b border-surface-variant py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                              placeholder="e.g. 00233"
                              required
                            />
                          </div>
                          <div>
                            <label className="block font-sans text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">Country</label>
                            <input 
                              type="text" 
                              value={shippingAddress.country}
                              onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                              className="w-full bg-transparent border-b border-surface-variant py-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                              placeholder="e.g. Ghana"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="pt-6">
                          <button 
                            type="button"
                            onClick={hasCustomFit ? proceedToMeasurements : () => setActiveStep(3)}
                            className="bg-primary text-on-primary px-8 py-4 font-label text-[10px] tracking-widest uppercase hover:bg-surface-tint transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Step 2: Measurements (Only if custom fit) */}
            {hasCustomFit && (
              <div className={`border transition-colors duration-300 ${activeStep === 2 ? 'border-primary' : 'border-outline-variant/50'} bg-surface`}>
                <div 
                  className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
                  onClick={() => isShippingValid && setActiveStep(2)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 flex items-center justify-center font-serif text-sm transition-colors ${activeStep === 2 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                      2
                    </div>
                    <h2 className="font-serif text-2xl text-primary">Measurements</h2>
                  </div>
                  {measurementsLinked && activeStep !== 2 ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 border border-green-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="font-label text-[10px] tracking-widest uppercase">Linked</span>
                    </div>
                  ) : hasValidMeasurements && activeStep !== 2 && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                
                <AnimatePresence>
                  {activeStep === 2 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 md:p-8 pt-0 border-t border-outline-variant/30 mt-4">
                        {measurementsLinked && (
                          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-500 font-sans text-sm flex gap-3 items-start">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold mb-1">Measurements Extracted from Profile</p>
                              <p>We found your custom-fit measurements saved in your profile. You can review them below or proceed directly to payment.</p>
                            </div>
                          </div>
                        )}
                        <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
                          Please provide your measurements (in inches). Our master tailors will use these to craft your custom-fit garments.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
                          {Object.keys(measurements).map((key) => (
                            <div key={key}>
                              <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2">{key}</label>
                              <input
                                type="number"
                                name={key}
                                value={measurements[key as keyof typeof measurements]}
                                onChange={handleMeasurementChange}
                                placeholder="in."
                                className="w-full bg-transparent border-b border-surface-variant py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="pt-10">
                          <button 
                            type="button"
                            onClick={proceedToPayment}
                            className="bg-primary text-on-primary px-8 py-4 font-label text-[10px] tracking-widest uppercase hover:bg-surface-tint transition-colors"
                          >
                            Confirm & Continue
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Step 3: Payment */}
            <div className={`border transition-colors duration-300 ${activeStep === 3 ? 'border-primary' : 'border-outline-variant/50'} bg-surface`}>
              <div 
                className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
                onClick={() => isShippingValid && (!hasCustomFit || hasValidMeasurements) && setActiveStep(3)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center font-serif text-sm transition-colors ${activeStep === 3 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                    {hasCustomFit ? '3' : '2'}
                  </div>
                  <h2 className="font-serif text-2xl text-primary">Payment</h2>
                </div>
              </div>
              
              <AnimatePresence>
                {activeStep === 3 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 md:p-8 pt-0 border-t border-outline-variant/30 mt-4">
                      
                      {!user ? (
                        <div className="text-center py-8">
                          <p className="font-serif text-xl text-primary mb-2">Sign In Required</p>
                          <p className="text-sm text-on-surface-variant mb-6">Please authenticate to finalize your purchase.</p>
                          <button disabled className="bg-surface-variant text-on-surface-variant px-8 py-4 font-label text-[10px] tracking-[0.2em] uppercase cursor-not-allowed border border-outline-variant w-full">
                            WAITING FOR AUTHENTICATION
                          </button>
                        </div>
                      ) : hasOutOfStockItems ? (
                        <div className="text-center py-8">
                          <p className="font-serif text-xl text-error mb-2">Inventory Error</p>
                          <p className="text-sm text-on-surface-variant mb-6">Some items in your cart exceed available stock.</p>
                          <button disabled className="bg-error/10 text-error px-8 py-4 font-label text-[10px] tracking-[0.2em] uppercase border border-error w-full">
                            ADJUST CART QUANTITIES
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-6 pt-4">
                          <div className="bg-surface-variant p-6 border border-outline-variant/30 flex items-start gap-4">
                            <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <h3 className="font-serif text-lg text-primary mb-1">Secure Transaction</h3>
                              <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
                                Gabby Atelier uses Paystack for 256-bit encrypted secure payments. Your payment details are never stored on our servers.
                              </p>
                              {activeCurrency !== 'GHS' && (
                                <div className="text-[10px] text-primary bg-primary/5 p-3 font-sans leading-relaxed border border-primary/20">
                                  <span className="font-bold block mb-1 uppercase tracking-widest text-[9px]">Billing Disclaimer</span>
                                  Transactions are securely processed in GHS. You will be billed the equivalent of <span className="font-bold">{formatPrice(totalAmount, activeCurrency, rates)}</span> by your bank based on current exchange rates.
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <PaystackButton 
                            {...componentProps} 
                            className="w-full bg-primary text-on-primary py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-all duration-300 shadow-[0_4px_20px_rgba(74,60,49,0.1)] hover:shadow-[0_8px_30px_rgba(74,60,49,0.2)]" 
                          />
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <h2 className="font-serif text-2xl text-primary mb-6">Summary</h2>
              <div className="bg-surface border border-outline-variant/50 p-6 md:p-8">
                
                {/* Cart Items List */}
                <div className="flex flex-col gap-6 mb-8 border-b border-outline-variant/30 pb-8">
                  {cartItemsWithDetails.map((item, idx) => (
                    <div key={item.cartItemId || idx} className="flex gap-4">
                      <div className="w-16 h-20 bg-surface-container shrink-0 border border-outline-variant/20">
                        <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <h3 className="font-serif text-base text-primary leading-tight">{item.product?.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-sans text-[10px] text-on-surface-variant uppercase tracking-wider bg-surface-variant px-1.5 py-0.5">
                              {item.variantSku === 'custom' || !item.variantSku ? 'Custom Fit' : item.variantSku}
                            </span>
                            <span className="font-sans text-xs text-on-surface-variant">Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-label text-[11px] tracking-widest text-primary">
                          {formatPrice(item.product?.basePrice ?? 0, activeCurrency, rates)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="mb-8 border-b border-outline-variant/30 pb-8">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo Code" 
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="flex-1 bg-transparent border-b border-surface-variant px-2 py-2 font-sans text-xs focus:outline-none focus:border-primary uppercase placeholder:normal-case placeholder:text-on-surface-variant/50 text-primary"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoCodeInput.trim()}
                      className="bg-transparent border border-outline-variant text-primary px-4 py-2 font-label text-[9px] tracking-widest uppercase hover:bg-surface-tint hover:text-on-primary transition-colors disabled:opacity-50"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                </div>

                {/* Totals */}
                <div className="flex flex-col gap-4 font-sans text-sm text-on-surface-variant mb-8">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-primary tracking-widest font-label text-xs">{formatPrice(subtotal, activeCurrency, rates)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Discount ({appliedPromo.code})</span>
                      <span className="font-label tracking-widest text-xs">-{formatPrice(discountAmount, activeCurrency, rates)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="text-primary tracking-widest font-label text-xs">{formatPrice(shippingAmount, activeCurrency, rates)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-6 border-t border-primary/20">
                  <span className="font-serif text-xl text-primary">Estimated Total</span>
                  <span className="font-label text-xl tracking-widest text-primary">{formatPrice(totalAmount, activeCurrency, rates)}</span>
                </div>

              </div>

              {/* Trust Badges */}
              <div className="flex flex-col gap-3 mt-6 ml-2">
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span className="font-sans text-[11px]">Secure Checkout. 256-bit encryption.</span>
                </div>
                <div className="flex items-center gap-3 text-on-surface-variant">
                  <Truck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span className="font-sans text-[11px]">Nationwide priority delivery.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
