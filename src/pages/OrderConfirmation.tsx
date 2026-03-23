import { motion } from 'framer-motion';

const OrderConfirmation = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] flex items-center justify-center pt-32 pb-20 px-[5%]"
    >
      <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
        Order Confirmed
      </h1>
    </motion.div>
  );
};

export default OrderConfirmation;
