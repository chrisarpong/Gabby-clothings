import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface OrderConfirmationCardProps {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  onGoToAccount: () => void;
}

export const OrderConfirmationCard: FC<OrderConfirmationCardProps> = ({
  orderId,
  totalAmount,
  onGoToAccount,
}) => {
  const shortId = orderId.length > 14
    ? `${orderId.substring(0, 6)}\u2026${orderId.substring(orderId.length - 6)}`
    : orderId;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[560px] bg-[#FAFAF8] px-10 sm:px-16 pt-20 pb-16 flex flex-col"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {/* ───── Minimal Check ───── */}
        <div className="flex justify-center mb-14">
          <div className="h-[64px] w-[64px] rounded-full border border-[#3a1f1d]/15 flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3a1f1d" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* ───── Heading ───── */}
        <h2
          className="text-center text-[36px] sm:text-[42px] leading-[1.1] text-[#3a1f1d] mb-5"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: "normal", fontStyle: "italic" }}
        >
          Order Confirmed
        </h2>
        <p className="text-center text-[14px] text-[#3a1f1d]/50 mb-16 leading-relaxed">
          We&rsquo;ll begin preparing your pieces shortly.
        </p>

        {/* ───── Receipt Divider ───── */}
        <div className="w-full border-t border-dashed border-[#3a1f1d]/15 mb-10" />

        {/* ───── Order Details ───── */}
        <div className="space-y-6 mb-10">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#3a1f1d]/40">Reference</span>
            <span className="text-[14px] text-[#3a1f1d]/70 font-mono tracking-wide">{shortId}</span>
          </div>
          
          {/* Total — dominant */}
          <div className="flex items-baseline justify-between pt-6 border-t border-[#3a1f1d]/8">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#3a1f1d]/40">Total Paid</span>
            <span
              className="text-[28px] text-[#3a1f1d]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {totalAmount}
            </span>
          </div>
        </div>

        {/* ───── Receipt Divider ───── */}
        <div className="w-full border-t border-dashed border-[#3a1f1d]/15 mb-12" />

        {/* ───── CTA ───── */}
        <Button
          onClick={onGoToAccount}
          className="w-full h-[58px] bg-[#3a1f1d] hover:bg-black text-[#F9F8F6] text-[12px] uppercase tracking-[0.25em] rounded-none shadow-none transition-colors"
          style={{ fontWeight: "normal" }}
        >
          Continue Shopping
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};