import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] flex flex-col items-center justify-center pt-32 pb-20 px-[5%]"
    >
      <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
        Product Details
      </h1>
      <p className="mt-4 font-[var(--font-sans)] text-sm text-[#3a1f1d] tracking-widest">
        Item ID: {id}
      </p>
    </motion.div>
  );
};

export default ProductDetails;
