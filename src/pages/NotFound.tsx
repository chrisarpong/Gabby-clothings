import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center text-center px-[5%]"
  >
    <p
      className="text-[10px] uppercase tracking-[0.35em] text-[#3a1f1d]/40 mb-4"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      404 — Page Not Found
    </p>
    <h1
      className="text-[#3a1f1d] mb-6"
      style={{
        fontFamily: "'Playfair Display', serif",
        fontStyle: 'italic',
        fontSize: 'clamp(3rem, 8vw, 7rem)',
        lineHeight: 1,
      }}
    >
      Lost in the Atelier
    </h1>
    <p className="text-[#3a1f1d]/50 text-sm max-w-[400px] leading-relaxed mb-10" style={{ fontFamily: "'Jost', sans-serif" }}>
      The page you are looking for has moved, or perhaps it was never tailored. Let us guide you back.
    </p>
    <div className="flex flex-col sm:flex-row gap-4">
      <Link
        to="/"
        className="bg-[#3a1f1d] text-[#F5F5F3] uppercase tracking-[0.2em] text-xs hover:bg-black transition-colors duration-300"
        style={{ padding: '14px 36px', fontFamily: "'Jost', sans-serif" }}
      >
        Back to Home
      </Link>
      <Link
        to="/shop"
        className="border border-[#3a1f1d] text-[#3a1f1d] uppercase tracking-[0.2em] text-xs hover:bg-[#3a1f1d] hover:text-white transition-colors duration-300"
        style={{ padding: '14px 36px', fontFamily: "'Jost', sans-serif" }}
      >
        Browse Shop
      </Link>
    </div>
  </motion.div>
);

export default NotFound;
