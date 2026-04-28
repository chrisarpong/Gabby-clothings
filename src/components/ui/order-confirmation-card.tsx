import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderConfirmationCardProps {
  orderId: string;
  paymentMethod: string;
  dateTime: string;
  totalAmount: string;
  onGoToAccount: () => void;
}

export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
}) => {
  const formatOrderId = (id: string) => {
    if (id.length > 18) {
      return `${id.substring(0, 10)}...${id.substring(id.length - 4)}`;
    }
    return id;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="
          w-full max-w-[520px]
          bg-white
          rounded-[28px]
          shadow-[0_14px_40px_rgba(0,0,0,0.12)]
          px-12 pt-14 pb-12
          font-sans
          flex flex-col
        "
      >
        {/* ───── Icon ───── */}
        <div className="flex justify-center mb-12">
          <div className="
            h-[72px] w-[72px]
            rounded-full
            border-[3px] border-[#4ade80]
            flex items-center justify-center
          ">
            <Check className="h-9 w-9 text-[#4ade80]" strokeWidth={3} />
          </div>
        </div>

        {/* ───── Heading ───── */}
        <h2 className="
          text-center
          text-[30px]
          font-bold
          leading-[1.35]
          text-[#111111]
          mb-16
        ">
          Your order has been<br />successfully submitted
        </h2>

        {/* ───── Details ───── */}
        <div className="flex flex-col">
          <InfoRow label="Order ID" value={formatOrderId(orderId)} />
          <Divider />

          <InfoRow label="Payment Method" value={paymentMethod} />
          <Divider />

          <InfoRow label="Date & Time" value={dateTime} />
          <Divider />

          {/* ───── Total Row ───── */}
          <div className="flex items-center justify-between pt-10">
            <span className="text-[18px] font-bold text-[#111111]">
              Total
            </span>
            <span className="text-[24px] font-bold text-[#111111]">
              {totalAmount}
            </span>
          </div>
        </div>

        {/* ───── Button ───── */}
        <div className="mt-14">
          <Button
            onClick={onGoToAccount}
            className="
              w-full
              h-[60px]
              rounded-[14px]
              bg-[#111111]
              hover:bg-black
              text-white
              text-[17px]
              font-medium
              shadow-none
              transition-colors
            "
          >
            Go to my account
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-7">
      <span className="text-[16px] text-gray-500 font-medium">
        {label}
      </span>
      <span className="text-[16px] text-gray-700 text-right">
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-gray-200" />;
}