import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { Doc } from '../../convex/_generated/dataModel';
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "../store/cartStore";

const isSoldOut = (product: any) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.every((v: any) => v.stock <= 0);
  }
  return product.stock !== undefined && product.stock <= 0;
};

export default function CategoryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  // Convert slug to a display format "custom-agbadas" -> "Custom Agbadas"
  const displayCategory = slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Category";
  
  // Use category string as the argument (in reality might need slug in products schema, but we'll use name matching)
  const results = useQuery(api.products.getByCategory, { category: displayCategory });

  return (
    <main className="bg-surface relative w-full pt-40 pb-32 min-h-screen">
      {/* Header Section */}
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto mb-16 text-center md:text-left flex flex-col">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-6"
        >
          Collection
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-5xl md:text-7xl italic text-primary leading-tight mb-4"
        >
          {displayCategory}
        </motion.h1>
      </section>

      {/* Grid Section */}
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto">
        {results === undefined ? (
          <div className="py-32 text-center text-primary font-serif italic text-2xl">Loading collection...</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
            {results.map((product: Doc<"products">, index: number) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative aspect-[3/4] mb-6 bg-surface-container overflow-hidden">
                  <img
                    src={product?.images?.[0] || "/assets/1.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Sold Out Badge & Diagonal Text */}
                  {isSoldOut(product) && (
                    <>
                      <div className="absolute top-4 left-4 z-20 bg-black/90 text-white border border-white/20 font-label text-[10px] tracking-widest uppercase px-3 py-1 backdrop-blur-sm">
                        Sold Out
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none bg-surface/10 backdrop-blur-[2px]">
                        <span className="transform -rotate-45 font-sans font-black text-3xl md:text-4xl lg:text-5xl uppercase tracking-[0.2em] text-red-600/90 drop-shadow-lg whitespace-nowrap">
                          Sold Out
                        </span>
                      </div>
                    </>
                  )}
                  {!isSoldOut(product) && (
                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          addItem({ productId: product._id, quantity: 1 });
                          toast.success("Added to cart");
                        }}
                        className="w-full bg-surface/80 backdrop-blur-md text-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 border border-outline-variant/50 hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        Quick Add
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-serif text-[18px] text-primary">{product.name}</h3>
                    <span className="font-label text-[11px] tracking-widest text-outline uppercase mt-1">
                      {product.category}
                    </span>
                  </div>
                  <span className="font-label text-sm tracking-wide text-primary whitespace-nowrap">
                    GH₵{(product?.basePrice ?? 0).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-32 text-center flex flex-col items-center justify-center border border-surface-variant bg-surface-container-low"
          >
            <p className="font-serif text-2xl md:text-3xl italic text-primary mb-6">
              No products found in this category.
            </p>
            <Link
              to="/shop"
              className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 px-12 hover:bg-surface-tint transition-colors"
            >
              Return to Shop
            </Link>
          </motion.div>
        )}
      </section>
    </main>
  );
}
