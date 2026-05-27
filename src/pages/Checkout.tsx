import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Lock, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useQuery, useMutation } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { PaystackButton } from "react-paystack";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { items, clearCart } = useCartStore();
  
  const allProducts = useQuery(api.products.getAll);

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const cartItemsWithDetails = allProducts === undefined ? [] : items.map(item => {
    const product = allProducts.find(p => p._id === item.productId);
    return { ...item, product };
  }).filter(i => i.product);

  const subtotal = cartItemsWithDetails.reduce((sum, item) => sum + (item.product?.basePrice || 0) * item.quantity, 0);
  const shippingAmount = 150.00;
  const totalAmount = subtotal + shippingAmount;

  const createOrder = useMutation(api.orders.create);

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
        items: items.map(i => ({
          productId: i.productId as any,
          variantSku: i.variantSku,
          quantity: i.quantity,
        })),
        shippingAmount,
        paymentStatus: "paid",
        paystackReference: reference.reference,
        shippingAddress
      });

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
    metadata: {
      name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`,
      custom_fields: []
    },
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    text: "PAY WITH PAYSTACK",
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  const isFormValid = shippingAddress.street && shippingAddress.city && shippingAddress.state && shippingAddress.zip && shippingAddress.country;

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
                  <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">State / Region</label>
                  <input 
                    type="text" 
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="w-full bg-surface border border-outline-variant p-4 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-on-surface-variant mb-2">ZIP Code</label>
                  <input 
                    type="text" 
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
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

          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-32 bg-surface-container/50 backdrop-blur-md border border-surface-variant p-8 md:p-12 mb-8"
            >
              <h2 className="font-serif text-2xl text-primary italic mb-8">Order Summary</h2>
              
              <div className="flex flex-col gap-4 font-sans text-sm text-on-surface-variant mb-8 border-b border-outline-variant/30 pb-8">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-primary tracking-widest font-label">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span>GH₵{shippingAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="font-serif text-lg text-primary">Estimated Total</span>
                <span className="font-label text-lg tracking-widest text-primary">GH₵{totalAmount.toFixed(2)}</span>
              </div>

              {!user ? (
                 <p className="text-sm text-brand-espresso mb-8 border border-outline-variant p-4 text-center w-full block">Please Sign In to Checkout</p>
              ) : !isFormValid ? (
                 <button disabled className="w-full bg-surface-variant text-on-surface-variant py-5 font-label text-[11px] tracking-[0.2em] uppercase mb-8 cursor-not-allowed">
                   FILL SHIPPING ADDRESS
                 </button>
              ) : (
                <PaystackButton 
                  {...componentProps} 
                  className="w-full bg-primary text-on-primary py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors mb-8" 
                />
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
