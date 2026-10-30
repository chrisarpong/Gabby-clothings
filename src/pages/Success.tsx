import { Check, Download, Printer } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice, CurrencyCode } from "../utils/currency";
import { useCartStore } from "../store/cartStore";

export default function Success() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const currentOrder = useQuery(api.orders.getMyOrderByReference, reference ? { reference } : "skip");
  const allProducts = useQuery(api.products.getAll, {});
  const storeInfo = useQuery(api.settings.getByKey, { key: "storeInfo" });
  const { activeCurrency, rates } = useCurrencyStore();
  const clearCart = useCartStore(state => state.clearCart);
  const clearedReference = useRef<string | null>(null);
  
  const waiting = Boolean(reference && !currentOrder);
  const [showSupport, setShowSupport] = useState(false);
  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => setShowSupport(true), 60_000);
    return () => window.clearTimeout(timer);
  }, [waiting]);
  useEffect(() => {
    const paidReference = reference ? sessionStorage.getItem('gabby_last_paid_reference') : null;
    if (currentOrder && reference && paidReference === reference && clearedReference.current !== reference) {
      clearCart();
      clearedReference.current = reference;
    }
  }, [currentOrder, reference, clearCart]);

  const displayCurrency = (currentOrder?.displayCurrency as CurrencyCode) || activeCurrency;
  const displayRates = currentOrder?.rateAtOrderTime ? { [displayCurrency]: currentOrder.rateAtOrderTime } : rates;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="flex-1 w-full min-h-screen bg-surface flex flex-col items-center pt-32 pb-32 px-5">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-container, #receipt-container * {
              visibility: visible;
            }
            #receipt-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              box-shadow: none !important;
              padding: 20px !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-3xl flex flex-col gap-8"
      >
        <div className="flex flex-col items-center text-center no-print mb-8">
          <div className="w-16 h-16 rounded-full border border-primary/20 flex items-center justify-center mb-6 text-primary">
            <Check className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-primary italic mb-4">
            Payment Successful
          </h1>
          <p className="font-sans text-on-surface-variant text-lg leading-relaxed">
            Your order has been received and our studio will begin preparation immediately.
          </p>
        </div>

        {waiting ? (
          <div className="text-center text-on-surface-variant">
            <p>Confirming your payment…</p>
            {showSupport && <p className="mt-4 text-sm">Still waiting? Contact {String((storeInfo as any)?.value?.email || (storeInfo as any)?.value?.phone || "our support team")} and include your payment reference.</p>}
          </div>
        ) : currentOrder && allProducts ? (
          <div id="receipt-container" className="bg-surface-container border border-surface-variant p-8 md:p-12 shadow-sm relative">
            
            <button 
              onClick={handlePrint}
              className="no-print absolute top-8 right-8 text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-label text-[10px] tracking-widest uppercase"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </button>

            <div className="flex justify-between items-start border-b border-surface-variant pb-8 mb-8">
              <div>
                <h2 className="font-serif text-3xl text-primary italic mb-2">Gabby Newluk</h2>
                <p className="font-label text-xs tracking-widest text-on-surface-variant uppercase">Official Receipt</p>
              </div>
              <div className="text-right mt-12 md:mt-0">
                <p className="font-sans text-sm text-on-surface-variant mb-1">Date: {new Date(currentOrder._creationTime).toLocaleDateString()}</p>
                <p className="font-sans text-sm text-on-surface-variant mb-1">Order #: {currentOrder.orderId || currentOrder._id.slice(-8).toUpperCase()}</p>
                <p className="font-sans text-sm text-on-surface-variant">Ref: {currentOrder.paystackReference || reference}</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-label text-xs tracking-widest text-outline uppercase border-b border-surface-variant pb-2 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="font-sans text-sm font-medium text-primary mb-1">Billed To</p>
                  <p className="font-sans text-sm text-on-surface-variant">{currentOrder.customerDetails?.firstName} {currentOrder.customerDetails?.lastName}</p>
                  <p className="font-sans text-sm text-on-surface-variant">{currentOrder.customerDetails?.email}</p>
                </div>
                <div>
                  <p className="font-sans text-sm font-medium text-primary mb-1">Shipping Address</p>
                  <p className="font-sans text-sm text-on-surface-variant">{currentOrder.shippingAddress?.street}</p>
                  <p className="font-sans text-sm text-on-surface-variant">{currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.region}</p>
                  <p className="font-sans text-sm text-on-surface-variant">{currentOrder.shippingAddress?.country} - {currentOrder.shippingAddress?.postalCode}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-label text-xs tracking-widest text-outline uppercase border-b border-surface-variant pb-2 mb-4">Order Items</h3>
              <div className="flex flex-col gap-4">
                {currentOrder.items.map((item: any, index: number) => {
                  const product = allProducts.find(p => p._id === item.productId);
                  const displayPrice = item.priceAtPurchase ?? product?.basePrice ?? 0;
                  return (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-serif text-lg text-primary">{item.productName || product?.name || "Custom Item"}</span>
                          <span className="font-sans text-xs text-on-surface-variant mt-1">Size: {item.variantSku || "Custom Fit"} &times; {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-sans text-sm text-primary font-medium">{formatPrice(displayPrice * item.quantity, displayCurrency, displayRates)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-surface-variant pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-sm text-on-surface-variant">Subtotal</span>
                <span className="font-sans text-sm text-primary">
                  {formatPrice(currentOrder.subtotal ?? currentOrder.totalAmount ?? 0, displayCurrency, displayRates)}
                </span>
              </div>
              {(currentOrder.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span className="font-sans text-sm">Discount</span>
                  <span className="font-sans text-sm">-{formatPrice(currentOrder.discountAmount ?? 0, displayCurrency, displayRates)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-6 border-b border-surface-variant pb-6">
                <span className="font-sans text-sm text-on-surface-variant">Shipping</span>
                <span className="font-sans text-sm text-primary">{formatPrice(currentOrder.shippingFee ?? 0, displayCurrency, displayRates)}</span>
              </div>
              
              <div className="flex justify-between items-end">
                <span className="font-serif text-xl text-primary">Total Paid</span>
                <span className="font-label text-xl tracking-widest text-primary">
                  {formatPrice(currentOrder.totalAmount ?? 0, displayCurrency, displayRates)}
                </span>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="font-sans text-xs text-on-surface-variant italic">Thank you for your patronage. We look forward to dressing you again.</p>
            </div>
          </div>
        ) : (
           <div className="w-full h-64 bg-surface-container animate-pulse flex items-center justify-center font-sans text-on-surface-variant">
             {reference ? "Retrieving order details..." : "No verified payment reference was provided."}
           </div>
        )}

        <div className="flex justify-center no-print mt-4">
          <Link 
            to="/" 
            className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 px-10 hover:bg-surface-tint transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
