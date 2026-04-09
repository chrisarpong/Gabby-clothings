import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Package } from "lucide-react";
import type { CartItem } from "../context/CartContext";

interface OrderState {
  reference: string;
  customerName: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    region: string;
    country: string;
  };
}

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state as OrderState | null;

  // Fallback: no state (e.g. user refreshed the page)
  if (!order) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center px-6 text-[#3a1f1d]"
      >
        <Package className="h-12 w-12 opacity-20 mb-6" />
        <h1
          className="text-3xl italic mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Order not found
        </h1>
        <p className="text-sm text-[#3a1f1d]/60 mb-8">
          Your order was placed but we lost the details on page refresh.
          Check your email for confirmation.
        </p>
        <Link
          to="/"
          className="border border-[#3a1f1d] px-8 py-3 text-[11px] uppercase tracking-[0.22em] hover:bg-[#3a1f1d] hover:text-white transition-all"
        >
          Return Home
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d]"
      style={{ padding: "130px 5% 5rem 5%" }}
    >
      <div className="max-w-[760px] mx-auto">

        {/* Success header */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="h-20 w-20 rounded-full bg-[#3a1f1d]/5 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-[#3a1f1d]" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#3a1f1d]/45 mb-3">
            Order Confirmed
          </p>
          <h1
            className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Thank you, {order.customerName.split(" ")[0]}.
          </h1>
          <p className="text-sm text-[#3a1f1d]/60 leading-7 max-w-md">
            Your tailored pieces are now being prepared. A confirmation has
            been sent to <strong>{order.email}</strong>.
          </p>
        </div>

        {/* Receipt card */}
        <div className="bg-white border border-[#3a1f1d]/10 rounded-3xl p-8 md:p-12 shadow-sm">

          {/* Print + Reference */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#3a1f1d]/10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#3a1f1d]/45 mb-1">
                Order Reference
              </p>
              <p className="text-[13px] font-medium text-[#3a1f1d]">
                {order.reference}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="text-[11px] uppercase tracking-[0.2em] text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors underline underline-offset-4"
            >
              Print Receipt
            </button>
          </div>

          {/* Items */}
          <div className="mb-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3a1f1d] mb-5">
              Items Ordered
            </h2>
            <div className="flex flex-col gap-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[#3a1f1d]">
                    {item.name}{" "}
                    <span className="text-[#3a1f1d]/45">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-[#3a1f1d]">
                    GH₵ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px w-full bg-[#3a1f1d]/8 mb-6" />

          {/* Totals */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-[12px] text-[#3a1f1d]/60">
              <span>Subtotal</span>
              <span>GH₵ {order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[12px] text-[#3a1f1d]/60">
              <span>Shipping</span>
              <span>GH₵ {order.shipping.toFixed(2)}</span>
            </div>
          </div>

          <div className="h-px w-full bg-[#3a1f1d]/8 mb-6" />

          <div className="flex justify-between items-baseline mb-10">
            <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#3a1f1d]">
              Total Paid
            </span>
            <span
              className="text-3xl italic text-[#3a1f1d]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              GH₵ {order.total.toFixed(2)}
            </span>
          </div>

          {/* Shipping address */}
          <div className="border-t border-[#3a1f1d]/10 pt-6">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#3a1f1d]/45 mb-2">
              Delivering To
            </p>
            <p className="text-[13px] text-[#3a1f1d]/70 leading-6">
              {order.shippingAddress.address},{" "}
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.region},{" "}
              {order.shippingAddress.country}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/shop"
            className="border border-[#3a1f1d] px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[#3a1f1d] hover:bg-[#3a1f1d] hover:text-white transition-all rounded-full"
          >
            Continue Shopping
          </Link>
          <Link
            to="/"
            className="text-[11px] uppercase tracking-[0.22em] text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
