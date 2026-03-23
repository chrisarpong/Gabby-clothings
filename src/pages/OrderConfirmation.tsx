import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] flex flex-col items-center justify-center pt-32 pb-20 px-[5%]"
    >
      <div className="w-full max-w-[600px] flex flex-col items-center">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-4 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
          Thank you, Customer Name
        </h1>
        <p className="font-[var(--font-sans)] text-[#555] mb-12 text-center text-sm tracking-wide">
          Your tailored pieces will be arriving shortly.
        </p>

        {/* Action / Print Link */}
        <div className="w-full flex justify-end mb-4 pr-2">
          <button 
            onClick={() => window.print()} 
            className="font-[var(--font-sans)] text-xs uppercase tracking-widest text-[#3a1f1d] underline hover:opacity-70 transition-opacity"
          >
            Print Receipt
          </button>
        </div>

        {/* Summary Receipt Box */}
        <div className="w-full border border-[#dddddd] p-8 flex flex-col font-[var(--font-sans)] bg-white text-[#3a1f1d]">
          <h2 className="text-center font-bold tracking-widest uppercase text-sm mb-8 pb-4 border-b border-[#dddddd]">
            Order Receipt
          </h2>
          
          <div className="flex justify-between mb-4 text-sm">
            <span className="text-[#555]">Order Number</span>
            <span className="font-semibold">GN-84920</span>
          </div>

          <div className="flex justify-between mb-4 text-sm">
            <span className="text-[#555]">Product</span>
            <span className="text-right">Premium Tailored Kaftan (x1)</span>
          </div>

          <div className="flex justify-between mb-10 text-sm">
            <span className="text-[#555]">Subtotal</span>
            <span>GH₵350.00</span>
          </div>

          <div className="flex justify-between text-lg border-t border-[#dddddd] pt-6 uppercase tracking-wider font-semibold">
            <span>Total</span>
            <span>GH₵350.00</span>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
};

export default OrderConfirmation;
