import { motion } from "framer-motion";

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

  return (
    <div className="w-full flex flex-col gap-4">
      {gallery.map((src, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className="w-full bg-[#EFEFEF] overflow-hidden"
        >
          <img
            src={src}
            alt={`${productName} — view ${idx + 1}`}
            className="w-full h-auto object-cover rounded-none"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default ProductImageGallery;
