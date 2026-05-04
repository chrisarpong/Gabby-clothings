import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Section {
  title: string;
  content: string;
}

interface ProductInfoSectionsProps {
  sections: Section[];
}

const ProductInfoSections = ({ sections }: ProductInfoSectionsProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Default first section open

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="w-full">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className="border-b border-[#3a1f1d]/20"
        >
          <button
            onClick={() => toggle(idx)}
            className="flex justify-between items-center w-full py-5 text-left text-[16px] text-[#3a1f1d] hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
            aria-expanded={openIndex === idx}
          >
            <span>{section.title}</span>
            <span className="text-[18px] font-light">
              {openIndex === idx ? "—" : "+"}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {openIndex === idx && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p
                  className="pb-6 pt-1 text-[15px] text-[#3a1f1d]/80 leading-relaxed"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {section.content}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default ProductInfoSections;
