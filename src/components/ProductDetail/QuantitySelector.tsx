import { motion } from "framer-motion";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

const QuantitySelector = ({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) => {
  return (
    <div className="mb-6">
      <label
        className="block text-[15px] mb-3 text-[#3a1f1d]"
        style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
      >
        Quantity *
      </label>
      <div className="flex items-center border border-[#3a1f1d]/30 h-[52px] w-[130px] select-none bg-transparent">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(Math.max(min, quantity - 1))}
          disabled={quantity <= min}
          className="w-12 h-full text-xl text-[#3a1f1d] hover:bg-[#3a1f1d]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-light"
          aria-label="Decrease quantity"
        >
          −
        </motion.button>
        <input
          type="number"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              onChange(Math.max(min, Math.min(max, val)));
            }
          }}
          min={min}
          max={max}
          step={1}
          className="flex-1 text-center text-[15px] text-[#3a1f1d] bg-transparent outline-none h-full w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ fontFamily: "'Jost', sans-serif" }}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          className="w-12 h-full text-xl text-[#3a1f1d] hover:bg-[#3a1f1d]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-light"
          aria-label="Increase quantity"
        >
          +
        </motion.button>
      </div>
    </div>
  );
};

export default QuantitySelector;
