import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3]"
      style={{ padding: '130px 5% 5rem 5%' }}
    >
      <div 
        style={{ 
          background: '#ffffff', 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '4rem', 
          border: '1px solid #e0e0e0',
          position: 'relative'
        }}
        className="w-full flex flex-col font-[var(--font-sans)] text-[#3a1f1d] shadow-sm"
      >
        {/* Print Button */}
        <div className="w-full flex justify-end mb-8 absolute top-8 right-8">
          <button 
            onClick={() => window.print()} 
            style={{ 
              textDecoration: 'underline', 
              textTransform: 'uppercase', 
              fontSize: '0.8rem', 
              cursor: 'pointer', 
              background: 'none', 
              border: 'none',
              color: '#3a1f1d',
              fontWeight: '700',
              letterSpacing: '0.1em'
            }}
            className="hover:opacity-70 transition-opacity"
          >
            Print Receipt
          </button>
        </div>

        {/* Header */}
        <h1 className="text-center text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontStyle: 'italic' }}>
          Thank you, Customer
        </h1>
        <p className="text-center font-[var(--font-sans)] text-[#555] mb-12 text-sm tracking-wide">
          Your tailored pieces will be arriving shortly.
        </p>

        <div className="w-full">
          <h2 className="text-left font-bold tracking-widest uppercase text-sm mb-6 pb-2 border-b border-[#dddddd]">
            Order Receipt
          </h2>
          
          <div className="flex justify-between mb-4 text-sm">
            <span className="text-[#555]">Order Number</span>
            <span className="font-semibold text-[#3a1f1d]">GN-84920</span>
          </div>

          <div className="flex justify-between mb-4 text-sm">
            <span className="text-[#555]">Date</span>
            <span className="font-semibold text-[#3a1f1d]">{(new Date()).toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between mb-4 text-sm">
            <span className="text-[#555]">Product</span>
            <span className="text-right text-[#3a1f1d]">Tailored Luxury Suite (x1)</span>
          </div>

          <div className="flex justify-between mb-10 text-sm">
            <span className="text-[#555]">Subtotal</span>
            <span className="text-[#3a1f1d]">GH₵350.00</span>
          </div>
          
          <div className="flex justify-between mb-10 text-sm">
            <span className="text-[#555]">Delivery</span>
            <span className="text-[#3a1f1d]">GH₵50.00</span>
          </div>

          <div className="flex justify-between text-lg border-t border-[#dddddd] pt-6 uppercase tracking-wider font-semibold text-[#3a1f1d]">
            <span>Total</span>
            <span>GH₵400.00</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderConfirmation;
