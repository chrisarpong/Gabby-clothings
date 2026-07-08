import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useQuery  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { ProductSkeleton } from "../components/ProductSkeleton";
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "@/hooks/useConvex";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../utils/currency";

const RevealDiv: React.FC<{ children: React.ReactNode, className?: string, delay?: string }> = ({ children, className = "", delay = "" }) => {
  const { elementRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });
  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ease-out ${
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${delay} ${className}`}
    >
      {children}
    </div>
  );
};

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-surface-variant animate-pulse z-0" />
      )}
      <img
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 relative z-0 ${loaded ? "opacity-100" : "opacity-0"}`}
        src={src}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

const isSoldOut = (product: any) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.every((v: any) => v.stock <= 0);
  }
  return product.stock !== undefined && product.stock <= 0;
};

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(8);
  const { activeCurrency, rates } = useCurrencyStore();
  const allProducts = useQuery(api.products.getActive);
  const catalogs = useQuery(api.catalogs.getAll, {}) || [];
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const { user } = useUser();
  const wishlist = useQuery(api.wishlists.getUserWishlist);
  const toggleWishlist = useMutation(api.wishlists.toggleItem);
  const isLoading = allProducts === undefined;

  const categories = Array.from(new Set([
    "All", 
    ...catalogs.map((c: any) => c.name), 
    "Outerwear", "Suiting", "Eveningwear", "Accessories", "Kaftans", "Agbadas"
  ])); 

  let filteredProducts = isLoading ? [] : activeCategory === "All" 
    ? [...allProducts]
    : allProducts.filter((p: any) => {
        const catObj = catalogs.find((c: any) => c.name === activeCategory);
        if (catObj && p.catalogIds?.includes(catObj._id)) return true;
        return p.category?.toLowerCase() === activeCategory.toLowerCase();
      });

  if (sortBy === "price_asc") {
    filteredProducts.sort((a: any, b: any) => (a.basePrice || 0) - (b.basePrice || 0));
  } else if (sortBy === "price_desc") {
    filteredProducts.sort((a: any, b: any) => (b.basePrice || 0) - (a.basePrice || 0));
  } else if (sortBy === "newest") {
    filteredProducts.sort((a: any, b: any) => (b._creationTime || 0) - (a._creationTime || 0));
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  useEffect(() => {
    setVisibleCount(8);
  }, [activeCategory]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    
    let variantSku = undefined;
    if (product.variants && product.variants.length > 0) {
      // Find first variant with stock > 0
      const availableVariant = product.variants.find((v: any) => v.stock > 0);
      if (!availableVariant) {
        toast.error("Sold out", { description: "This item is currently out of stock." });
        return;
      }
      variantSku = availableVariant.sku;
    }

    addItem({
      productId: product._id,
      variantSku,
      quantity: 1
    });

    toast.success("Added to cart");
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: any) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to manage your wishlist.");
      return;
    }
    try {
      await toggleWishlist({ productId });
      toast.success("Wishlist updated!");
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <main className="bg-surface relative w-full pt-10 pb-32 min-h-screen">
      {/* Header section */}
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto pt-32 pb-16 text-center md:text-left flex flex-col items-center md:items-start">
        <RevealDiv>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic text-primary leading-tight max-w-4xl mb-6">
            The Boutique.
          </h1>
          <p className="font-sans text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
            Ready-to-wear masterpieces, crafted with ancestral precision.
          </p>
        </RevealDiv>
      </section>

      {/* Filters & Utility Bar */}
      <div className="w-full border-y border-outline-variant/30 py-4 mb-16">
        <div className="max-w-[1536px] mx-auto px-5 md:px-20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar w-full md:flex-1 md:w-auto pb-2 md:pb-0 md:mr-16">
            {categories.map((cat) => (
              <button
                key={cat as string}
                onClick={() => setActiveCategory(cat as string)}
                className={`font-label text-[11px] md:text-xs tracking-[0.15em] uppercase transition-all duration-300 py-2 relative group whitespace-nowrap ${
                  activeCategory === cat ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {String(cat)}
                {/* Hover Underline */}
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-primary transition-transform origin-left duration-500 ease-out ${activeCategory === cat ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>
            ))}
          </div>
          <div className="hidden md:flex shrink-0 items-center bg-surface relative">
            <select 
               value={sortBy} 
               onChange={(e) => setSortBy(e.target.value)}
               className="font-label text-[11px] tracking-[0.15em] text-on-surface-variant uppercase cursor-pointer hover:text-primary transition-colors bg-transparent border-none outline-none appearance-none pr-6 focus:ring-0"
            >
              <option value="newest">Sort By: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-on-surface-variant">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))
          ) : (
            visibleProducts.map((product, index) => (
            <RevealDiv key={product._id} delay={`delay-${(index % 4) * 100}`}>
              <div className="group cursor-pointer flex flex-col h-full" onClick={() => navigate(`/product/${product._id}`)}>
                <div className="relative aspect-[3/4] mb-6 bg-surface-container overflow-hidden">
                  <ProductImage src={product?.images?.[0] || "/assets/1.jpg"} alt={product?.name || "Product"} />
                  {/* Wishlist Button */}
                  {!isSoldOut(product) && (
                    <button 
                      onClick={(e) => handleToggleWishlist(e, product._id)}
                      className="absolute top-4 right-4 z-20 p-2 bg-surface/50 backdrop-blur-sm rounded-full hover:bg-surface transition-colors"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${wishlist?.some((p: any) => p._id === product._id) ? 'fill-red-500 text-red-500' : 'text-primary'}`} 
                      />
                    </button>
                  )}
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
                  {/* Quick Add Button */}
                  {!isSoldOut(product) && (
                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                      <button 
                        onClick={(e) => handleQuickAdd(e, product)}
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
                    <span className="font-label text-[11px] tracking-widest text-outline uppercase mt-1">{product.category}</span>
                  </div>
                  <span className="font-label text-sm tracking-wide text-primary whitespace-nowrap">{formatPrice(product?.basePrice ?? 0, activeCurrency, rates)}</span>
                </div>
              </div>
            </RevealDiv>
          )))}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="font-serif text-2xl text-primary mb-4 italic">No items found</h3>
            <p className="text-on-surface-variant">There are currently no items in this category.</p>
          </div>
        )}

        {!isLoading && visibleCount < filteredProducts.length && (
          <div className="mt-24 flex justify-center">
            <button 
              onClick={handleLoadMore}
              className="bg-transparent border border-outline-variant text-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 px-12 hover:bg-primary hover:text-on-primary hover:border-primary transition-all duration-300"
            >
              Load More
            </button>
          </div>
        )}
      </section>

    </main>
  );
}
