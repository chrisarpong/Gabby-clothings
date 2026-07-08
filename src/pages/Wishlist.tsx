import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useCartStore } from "../store/cartStore";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../utils/currency";

export default function Wishlist() {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const { activeCurrency, rates } = useCurrencyStore();
  
  const wishlistItems = useQuery(api.wishlists.getUserWishlist);
  const toggleWishlist = useMutation(api.wishlists.toggleItem);

  return (
    <main className="bg-surface relative w-full pt-40 pb-32 min-h-screen">
      {/* Header Section */}
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto mb-16 md:mb-24 text-center md:text-left flex flex-col items-center md:items-start">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-6"
        >
          Curated Collection
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl italic text-primary leading-tight max-w-4xl"
        >
          Your Private Archive.
        </motion.h1>
      </section>

      {/* Grid Section */}
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto">
        {wishlistItems === undefined ? (
           <div className="py-32 text-center text-primary font-serif italic text-2xl">Loading your archive...</div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
            {wishlistItems.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col h-full"
              >
                <div className="group cursor-pointer mb-6" onClick={() => {}}>
                  <Link to={`/product/${product._id}`}>
                    <div className="relative aspect-[3/4] bg-surface-container overflow-hidden">
                      <img
                        src={product?.images?.[0] || "/assets/1.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                        <button 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            addItem({ productId: product._id, quantity: 1 });
                            toast.success("Added to cart");
                            navigate('/cart'); 
                          }}
                          className="w-full bg-surface/80 backdrop-blur-md text-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 border border-outline-variant/50 hover:bg-primary hover:text-on-primary transition-colors"
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>

                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex flex-col">
                      <h3 className="font-serif text-[18px] text-primary"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
                      <span className="font-label text-[11px] tracking-widest text-outline uppercase mt-1">{product.category}</span>
                    </div>
                    <span className="font-label text-sm tracking-wide text-primary whitespace-nowrap">
                      {formatPrice(product?.basePrice ?? 0, activeCurrency, rates)}
                    </span>
                  </div>
                
                {/* Remove Button */}
                <button 
                  onClick={() => {
                    toggleWishlist({ productId: product._id });
                    toast.success("Removed from wishlist");
                  }}
                  className="text-left font-label text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1 w-fit mt-auto"
                >
                  Remove from Wishlist
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-32 text-center flex flex-col items-center justify-center border border-surface-variant bg-surface-container-low"
          >
            <p className="font-serif text-2xl md:text-3xl italic text-primary mb-6 max-w-2xl mx-auto px-4 text-pretty">
              Your archive is currently empty. Explore the collections to save your favorite masterpieces.
            </p>
            <Link
              to="/shop"
              className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 px-12 hover:bg-surface-tint transition-colors"
            >
              Explore Collections
            </Link>
          </motion.div>
        )}
      </section>
    </main>
  );
}
