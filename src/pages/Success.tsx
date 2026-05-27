import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Success() {
  useEffect(() => {
    toast.success("Order confirmed. Confirmation email sent to your inbox.");
  }, []);

  return (
    <main className="flex-1 w-full min-h-screen bg-surface flex flex-col items-center justify-center text-center pt-32 pb-32 px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center max-w-2xl mx-auto"
      >
        <div className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center mb-10 text-primary">
          <Check className="w-8 h-8" strokeWidth={1} />
        </div>
        
        <h1 className="font-serif text-5xl md:text-7xl text-primary italic mb-8">
          Thank You.
        </h1>
        
        <p className="font-sans text-on-surface-variant text-lg md:text-xl leading-relaxed mb-14 text-pretty px-4">
          Your order has been received. Our studio will begin preparing your garments with the utmost care. A confirmation email has been sent to you.
        </p>
        
        <Link 
          to="/" 
          className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 hover:bg-surface-tint transition-colors"
        >
          Return to Homepage
        </Link>
      </motion.div>
    </main>
  );
}
