import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="flex-1 w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-primary text-white pt-32 pb-32">
      {/* Background Number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-serif italic text-[35vw] leading-none text-white opacity-[0.03]">
          404
        </span>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-5 max-w-3xl flex flex-col items-center"
      >
        <h1 className="font-serif text-5xl md:text-8xl italic mb-8">
          Page Not Found.
        </h1>
        <p className="font-sans text-lg md:text-xl text-white/80 leading-relaxed mb-14 px-4 text-pretty">
          The thread has been lost. The page you are looking for does not exist in our archives.
        </p>
        <Link 
          to="/collections" 
          className="bg-transparent border border-white/30 text-white font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 hover:bg-white hover:text-primary transition-colors"
        >
          Return to the Collection
        </Link>
      </motion.div>
    </main>
  );
}
