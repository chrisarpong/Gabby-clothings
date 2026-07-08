import React, { useEffect, useState } from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewsFlashModal() {
  const newsFlash = useQuery(api.posts.getNewsFlash);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show modal if there's a news flash and it hasn't been dismissed recently
    if (newsFlash) {
      const dismissed = localStorage.getItem(`newsflash_dismissed_${newsFlash._id}`);
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [newsFlash]);

  const handleDismiss = () => {
    if (newsFlash) {
      localStorage.setItem(`newsflash_dismissed_${newsFlash._id}`, 'true');
    }
    setIsVisible(false);
  };

  if (!newsFlash) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-brand-bone border border-outline-variant/30 w-full max-w-md shadow-2xl overflow-hidden relative"
          >
            {/* Header pattern */}
            <div className="h-2 w-full bg-[url('/pattern.png')] bg-repeat-x opacity-20"></div>
            
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface transition-colors hover:bg-black/5 rounded-full z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                <Bell className="w-5 h-5" />
              </div>
              
              <h2 className="font-serif text-2xl text-primary mb-2">
                {newsFlash.title}
              </h2>
              
              <div className="w-12 h-[1px] bg-primary/20 mx-auto mb-4"></div>
              
              <p className="font-sans text-sm text-on-surface-variant mb-6 leading-relaxed">
                {newsFlash.excerpt || newsFlash.content.substring(0, 150) + "..."}
              </p>

              <div className="flex flex-col w-full gap-3">
                <Link
                  to={`/news/${newsFlash.slug}`}
                  onClick={() => setIsVisible(false)}
                  className="w-full bg-primary text-brand-bone font-sans text-[10px] tracking-widest uppercase py-4 hover:bg-primary transition-colors"
                >
                  Read More
                </Link>
                <button 
                  onClick={handleDismiss}
                  className="w-full border border-outline-variant/30 text-on-surface font-sans text-[10px] tracking-widest uppercase py-4 hover:bg-primary/5 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
