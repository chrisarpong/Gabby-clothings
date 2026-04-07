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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="border-t border-[#3a1f1d]/20">
      {sections.map((section, idx) => (
        <motion.div
          key={idx}
          className="border-b border-[#3a1f1d]/20 cursor-pointer"
          whileHover={{
            borderColor: "rgba(58, 31, 29, 0.4)",
          }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => toggle(idx)}
            className="flex justify-between items-center w-full py-4 text-left text-[15px] font-normal"
            style={{ fontFamily: "'Jost', sans-serif" }}
            aria-expanded={openIndex === idx}
          >
            <span>{section.title}</span>
            <motion.span
              animate={{ rotate: openIndex === idx ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-light"
            >
              +
            </motion.span>
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
                  className="pb-5 text-[14px] opacity-80 leading-relaxed"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  {section.content}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductInfoSections;
