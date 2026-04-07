import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop";

const ProductImageGallery = ({
  images,
  productName,
}: ProductImageGalleryProps) => {
  const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Image */}
      <div
        className="w-full bg-[#EFEFEF] border border-[#3a1f1d]/5 rounded-2xl overflow-hidden relative"
        style={{ aspectRatio: "4/5" }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={gallery[selectedIndex]}
            alt={`${productName} — view ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </AnimatePresence>
      </div>

      {/* Thumbnail Strip */}
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {gallery.map((src, idx) => (
            <motion.button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 w-[72px] h-[90px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                idx === selectedIndex
                  ? "border-[#3a1f1d] opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90"
              }`}
            >
              <img
                src={src}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
