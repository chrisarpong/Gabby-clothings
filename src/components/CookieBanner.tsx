import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('gabby_cookie_consent');
    if (!hasConsented) {
      // Small delay so it doesn't pop up immediately on first paint
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gabby_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-4xl mx-auto bg-primary border border-surface-variant shadow-xl p-6 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-serif text-xl text-on-primary italic mb-2">We respect your privacy</h3>
              <p className="text-sm font-sans text-on-primary/80 leading-relaxed">
                We use cookies to enhance your browsing experience, securely store your preferences, and analyze our traffic. By clicking "Accept", you consent to our use of cookies in accordance with our <a href="/legal" className="text-on-primary underline">Privacy Policy</a>.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={handleAccept}
                className="bg-surface text-primary font-label text-xs tracking-widest uppercase py-3 px-6 hover:bg-surface-variant transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
