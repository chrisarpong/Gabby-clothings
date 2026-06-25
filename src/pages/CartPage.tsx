import { Link, useNavigate } from "react-router-dom";
import { Lock, Truck, Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "../store/cartStore";
import { useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { Doc } from '../../convex/_generated/dataModel';
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../utils/currency";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { items, removeItem, updateQuantity } = useCartStore();
  const { activeCurrency, rates } = useCurrencyStore();
  
  const allProducts = useQuery(api.products.getAll);

  // Wait until products load
  const cartItemsWithDetails = allProducts === undefined ? [] : items.map((item: any) => {
    const product = allProducts.find((p: Doc<"products">) => p._id === item.productId);
    let size = item.variantSku || "Custom Fit";
    return {
      ...item,
      product,
      size,
    };
  }).filter((i: any) => i.product);

  const subtotal = cartItemsWithDetails.reduce((sum: number, item: any) => sum + (item.product?.basePrice || 0) * item.quantity, 0);
  const shippingAmount = 150.00; // Flat fee for example
  const totalAmount = subtotal + shippingAmount;

  const getAvailableStock = (item: any) => {
    if (item.variantSku === 'custom') return 99; // Custom fit doesn't have strict stock
    if (item.product?.variants && item.product.variants.length > 0) {
      const variant = item.product.variants.find((v: any) => v.sku === item.variantSku);
      return variant ? variant.stock : 0;
    }
    return item.product?.stock ?? 0;
  };

  const hasOutOfStockItems = cartItemsWithDetails.some((item: any) => item.quantity > getAvailableStock(item));

  return (
    <main className="min-h-screen bg-surface text-on-surface flex flex-col pt-32 md:pt-40 pb-24">
      <div className="max-w-[1536px] mx-auto px-5 md:px-20 w-full flex-1">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 md:mb-16"
        >
          <h1 className="font-serif text-4xl md:text-6xl text-primary italic">Your Selection</h1>
        </motion.div>

        {items.length > 0 && allProducts === undefined ? (
           <div className="text-center py-20 animate-pulse text-on-surface-variant font-sans text-sm">
             Loading cart items...
           </div>
        ) : cartItemsWithDetails.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-serif text-2xl text-primary mb-4 italic">Your cart is empty</h2>
            <Link to="/shop" className="text-primary hover:underline uppercase tracking-widest text-xs font-label">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <div className="flex border-b border-surface-variant pb-4 mb-4">
                <span className="font-label text-[11px] tracking-widest uppercase text-outline">Product</span>
              </div>

              {cartItemsWithDetails.map((item: any, index: number) => {
                const currentSize = item.product?.variants?.find((v: any) => v.sku === item.variantSku)?.size || "Custom Fit";
                return (
                <motion.div 
                  key={item.cartItemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10 border-b border-outline-variant/30 pb-8"
                >
                  <div className="w-[100px] sm:w-[120px] shrink-0 aspect-[3/4] bg-surface-container overflow-hidden">
                    <img src={item.product?.images?.[0] || "/assets/1.jpg"} alt={item.product?.name || "Product"} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-serif text-xl md:text-2xl text-primary mb-2">{item.product?.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="font-sans text-sm text-on-surface-variant">Size:</span>
                          <select 
                            className="bg-transparent border border-surface-variant text-primary font-sans text-sm py-1 px-2 pr-8 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                            value={item.variantSku || "custom"}
                            onChange={(e) => {
                              const newSku = e.target.value === "custom" ? undefined : e.target.value;
                              useCartStore.getState().updateItemSize(item.cartItemId, newSku);
                            }}
                          >
                            {item.product?.variants?.map((v: any) => (
                              <option key={v.sku} value={v.sku}>{v.size}</option>
                            ))}
                            <option value="custom">Custom Fit</option>
                          </select>
                        </div>
                      </div>
                      <span className="font-label text-sm tracking-widest text-primary hidden sm:block">{formatPrice(item.product?.basePrice ?? 0, activeCurrency, rates)}</span>
                    </div>

                    <div className="flex items-center justify-between mt-4 sm:mt-6">
                      {/* Quantity Selector */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center border border-outline-variant w-fit">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
                          >
                            <Minus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                          <span className="w-10 font-label text-sm text-center text-primary">{item.quantity}</span>
                          <button 
                            onClick={() => {
                              const stock = getAvailableStock(item);
                              if (item.quantity >= stock) {
                                toast.error("Maximum stock reached", { description: `Only ${stock} available.` });
                              } else {
                                updateQuantity(item.cartItemId, item.quantity + 1);
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
                          >
                            <Plus className="w-3 h-3" strokeWidth={1.5} />
                          </button>
                        </div>
                        {item.quantity > getAvailableStock(item) ? (
                          <span className="text-[10px] text-error font-label uppercase tracking-widest">
                            Only {getAvailableStock(item)} available
                          </span>
                        ) : getAvailableStock(item) <= 5 && getAvailableStock(item) > 0 ? (
                          <span className="text-[10px] text-error font-label uppercase tracking-widest flex items-center gap-1">
                            Low Stock! Only {getAvailableStock(item)} left
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <span className="font-label text-sm tracking-widest text-primary sm:hidden mb-2">{formatPrice(item.product?.basePrice ?? 0, activeCurrency, rates)}</span>
                        <button 
                          onClick={() => removeItem(item.cartItemId)}
                          className="font-label text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors flex items-center gap-1 border-b border-transparent hover:border-primary pb-px"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )})}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="sticky top-32 bg-surface-container/50 backdrop-blur-md border border-surface-variant p-8 md:p-12 mb-8"
              >
                <h2 className="font-serif text-2xl text-primary italic mb-8">Order Summary</h2>
                
                <div className="flex flex-col gap-4 font-sans text-sm text-on-surface-variant mb-8 border-b border-outline-variant/30 pb-8">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-primary tracking-widest font-label">{formatPrice(subtotal, activeCurrency, rates)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span>{formatPrice(shippingAmount, activeCurrency, rates)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-10">
                  <span className="font-serif text-lg text-primary">Estimated Total</span>
                  <span className="font-label text-lg tracking-widest text-primary">{formatPrice(totalAmount, activeCurrency, rates)}</span>
                </div>

                {!user ? (
                   <p className="text-sm text-brand-espresso mb-8 border border-outline-variant p-4 text-center w-full block">Please Sign In to Checkout</p>
                ) : hasOutOfStockItems ? (
                  <p className="text-xs text-error font-label tracking-widest uppercase mb-8 border border-error p-4 text-center w-full block">Please adjust quantities before checkout</p>
                ) : (
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-primary text-on-primary py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors mb-8" 
                >
                  Proceed to Checkout
                </button>
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
        )}
      </div>
    </main>
  );
}
