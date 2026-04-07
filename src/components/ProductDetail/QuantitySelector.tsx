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
    <div className="mb-8">
      <label
        className="block text-[13px] mb-2 font-medium uppercase tracking-wider"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        Quantity
      </label>
      <div className="flex items-center border border-[#3a1f1d]/30 h-11 w-[130px] select-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(Math.max(min, quantity - 1))}
          disabled={quantity <= min}
          className="flex-1 h-full text-lg hover:bg-[#3a1f1d]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
          className="flex-1 text-center text-[14px] bg-transparent outline-none border-x border-[#3a1f1d]/15 h-full w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{ fontFamily: "'Jost', sans-serif" }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(Math.min(max, quantity + 1))}
          disabled={quantity >= max}
          className="flex-1 h-full text-lg hover:bg-[#3a1f1d]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          +
        </motion.button>
      </div>
    </div>
  );
};

export default QuantitySelector;
