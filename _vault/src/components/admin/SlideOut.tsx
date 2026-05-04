import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SlideOutProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function SlideOut({ isOpen, onClose, title, subtitle, children }: SlideOutProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bone/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-xl bg-bone border-l border-espresso/10 z-[70] shadow-2xl overflow-y-auto no-scrollbar"
          >
            <div className="p-8 md:p-12">
              <header className="flex justify-between items-start mb-16">
                <div>
                  <h3 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">{title}</h3>
                  {subtitle && <h2 className="font-serif text-3xl">{subtitle}</h2>}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 -mr-2 hover:bg-espresso/5 transition-colors rounded-none"
                >
                  <X strokeWidth={1} className="w-6 h-6" />
                </button>
              </header>

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
