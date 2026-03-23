import { motion } from 'framer-motion';

const Checkout = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] flex flex-col items-center justify-center pt-32 pb-20 px-[5%]"
    >
      <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Checkout
      </h1>
      {/* TODO: Integrate Paystack and Global Shipping Form here */}
      <p className="font-[var(--font-sans)] text-sm text-[#3a1f1d] max-w-md text-center">
        Secure payment and global shipping configuration will be implemented here.
      </p>
    </motion.div>
  );
};

export default Checkout;
