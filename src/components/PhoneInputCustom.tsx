import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { countryCodes } from "../utils/countries";
import { motion, AnimatePresence } from "framer-motion";

interface PhoneInputCustomProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  required?: boolean;
}

export default function PhoneInputCustom({ value, onChange, className, required }: PhoneInputCustomProps) {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      if (value) {
        const match = countryCodes.find(c => value.startsWith(c.dial_code));
        if (match) {
          setSelectedCountry(match);
          setPhoneNumber(value.slice(match.dial_code.length).trim());
        } else {
          setPhoneNumber(value);
        }
      }
      isInitialized.current = true;
    }
  }, [value]);

  useEffect(() => {
    if (isInitialized.current) {
      onChange(`${selectedCountry.dial_code} ${phoneNumber}`.trim());
    }
  }, [selectedCountry, phoneNumber]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex items-end gap-4 relative w-full ${className}`} ref={dropdownRef}>
      <div 
        className="flex items-center gap-2 pb-2 border-b border-outline-variant cursor-pointer hover:border-primary transition-colors text-primary w-28 shrink-0 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xl leading-none">{selectedCountry.flag}</span>
        <span className="text-sm font-sans">{selectedCountry.dial_code}</span>
        <ChevronDown className="w-4 h-4 ml-auto text-outline" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-72 max-h-64 overflow-y-auto bg-surface border border-surface-variant shadow-2xl z-50 rounded-none custom-scrollbar"
          >
            {countryCodes.map((c, i) => (
              <div 
                key={`${c.name}-${i}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-variant cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedCountry(c);
                  setIsOpen(false);
                }}
              >
                <span className="text-lg leading-none">{c.flag}</span>
                <span className="text-sm font-sans text-on-surface flex-1 truncate">{c.name}</span>
                <span className="text-xs text-on-surface-variant">{c.dial_code}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s-]/g, ''))}
        className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary flex-1 font-sans"
        placeholder="Enter phone number"
        required={required}
      />
    </div>
  );
}
