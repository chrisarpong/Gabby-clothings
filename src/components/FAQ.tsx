import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";

const defaultFaqs = [
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship globally via express couriers. Delivery times range from 3-7 business days depending on your location. Customs duties may apply and are the responsibility of the customer."
  },
  {
    question: "How does the custom bespoke fitting work remotely?",
    answer: "We offer virtual consultations where our master tailors will guide you step-by-step through the measurement process. Alternatively, you can submit measurements taken by a local professional via our Custom Tailoring portal."
  },
  {
    question: "What is the turnaround time for a bespoke garment?",
    answer: "Bespoke creations require meticulous attention to detail. Please allow 4-6 weeks from the confirmation of your measurements and fabric selection for the garment to be completed and shipped."
  },
  {
    question: "Can I request modifications to ready-to-wear items?",
    answer: "Yes, minor alterations such as hemming or sleeve adjustments are complimentary on our luxury and ready-to-wear pieces prior to shipping. Please add a note to your order at checkout."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const contentBlock = useQuery(api.content.get, { key: "faq_items" });
  
  const faqs = (contentBlock?.data && Array.isArray(contentBlock.data) && contentBlock.data.length > 0) 
    ? contentBlock.data 
    : defaultFaqs;

  return (
    <section id="faq" className="py-24 px-5 md:px-20 bg-surface-container-lowest">
      <div className="max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5">
          <span className="text-label tracking-widest uppercase text-outline mb-4 block">Client Services</span>
          <h2 className="font-serif text-4xl md:text-5xl italic text-primary mb-6">Frequently Asked</h2>
          <p className="font-sans text-on-surface-variant leading-relaxed max-w-md">
            Find answers to common inquiries regarding our bespoke process, shipping policies, and garment care.
          </p>
        </div>
        
        <div className="lg:col-span-7 flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-surface-variant overflow-hidden">
                <button 
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className="font-serif text-xl md:text-2xl text-primary group-hover:text-secondary transition-colors">
                    {faq.question}
                  </span>
                  <div className="ml-4 shrink-0 text-primary group-hover:text-secondary transition-colors">
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="font-sans text-on-surface-variant pb-6 leading-relaxed max-w-2xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
