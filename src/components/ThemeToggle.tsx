import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative inline-flex items-center p-0.5 rounded-full bg-surface-variant/50 border border-outline-variant/30">
      <button
        onClick={() => setTheme('light')}
        className={`relative p-1.5 rounded-full flex items-center justify-center transition-colors z-10 ${
          theme === 'light' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`relative p-1.5 rounded-full flex items-center justify-center transition-colors z-10 ${
          theme === 'system' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
        }`}
        title="System Preference"
      >
        <Laptop className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`relative p-1.5 rounded-full flex items-center justify-center transition-colors z-10 ${
          theme === 'dark' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>

      <div className="absolute inset-0 p-0.5 flex" aria-hidden="true">
        <motion.div
          className="w-1/3 h-full bg-surface rounded-full shadow-sm"
          animate={{
            x: theme === 'light' ? '0%' : theme === 'system' ? '100%' : '200%'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}
