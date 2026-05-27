import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useQuery  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { ProductSkeleton } from "../components/ProductSkeleton";
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";

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
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(20);
  const categories = ["All", "Outerwear", "Suiting", "Eveningwear", "Accessories", "Kuid", "Kaftans", "Agbadas"]; 
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const allProducts = useQuery(api.products.getAll);
  const isLoading = allProducts === undefined;

  const filteredProducts = isLoading ? [] : activeCategory === "All" 
    ? allProducts 
    : allProducts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  useEffect(() => {
    setVisibleCount(20);
  }, [activeCategory]);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    
    let variantSku = undefined;
    if (product.variants && product.variants.length > 0) {
      variantSku = product.variants[0].sku;
    }

    addItem({
      productId: product._id,
      variantSku,
      quantity: 1
    });

    toast.success("Added to cart");
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
          <div className="flex items-center gap-6 md:gap-10 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-label text-[11px] md:text-xs tracking-[0.15em] uppercase transition-all duration-300 py-2 relative group whitespace-nowrap ${
                  activeCategory === cat ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {cat}
                {/* Hover Underline */}
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-primary transition-transform origin-left duration-500 ease-out ${activeCategory === cat ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </button>
            ))}
          </div>
          <div className="hidden md:block shrink-0">
            <span className="font-label text-[11px] tracking-[0.15em] text-on-surface-variant uppercase cursor-pointer hover:text-primary transition-colors">
              Sort By: Newest ▼
            </span>
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
                  {/* Quick Add Button */}
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                    <button 
                      onClick={(e) => handleQuickAdd(e, product)}
                      className="w-full bg-surface/80 backdrop-blur-md text-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 border border-outline-variant/50 hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-serif text-[18px] text-primary">{product.name}</h3>
                    <span className="font-label text-[11px] tracking-widest text-outline uppercase mt-1">{product.category}</span>
                  </div>
                  <span className="font-label text-sm tracking-wide text-primary whitespace-nowrap">${(product?.basePrice ?? 0).toFixed(2)}</span>
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
