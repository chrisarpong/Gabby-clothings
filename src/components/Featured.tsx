import { Plus } from "lucide-react";
import { useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { Doc } from '../../convex/_generated/dataModel';
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";

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

const isSoldOut = (product: any) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.every((v: any) => v.stock <= 0);
  }
  return product.stockQuantity !== undefined && product.stockQuantity <= 0;
};

export default function Featured() {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const allProducts = useQuery(api.products.getAll);
  const featuredProducts = allProducts ? allProducts.slice(0, 4) : [];

  const handleQuickAdd = (e: React.MouseEvent, product: Doc<"products">) => {
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
    <section className="py-section px-5 md:px-20 bg-surface-container-lowest border-t border-surface-variant">
      <div className="max-w-[1536px] mx-auto">
        <div className="flex flex-col items-center mb-16">
          <span className="text-label text-secondary mb-4">Curated</span>
          <h2 className="font-serif text-4xl md:text-5xl italic text-primary">
            Featured Masterpieces
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {!allProducts ? (
            <div className="col-span-1 border border-surface-variant p-4">Loading curated selections...</div>
          ) : featuredProducts.map((product: Doc<"products">) => (
            <div key={product._id} className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
              <div className="relative aspect-[3/4] mb-6 bg-surface-container overflow-hidden">
                <ProductImage src={product?.images?.[0] || "/assets/1.jpg"} alt={product?.name || "Product"} />
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
                  <button 
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="absolute top-4 right-4 w-10 h-10 bg-surface/80 hover:bg-secondary text-primary hover:text-on-secondary flex items-center justify-center rounded-full transition-colors border border-outline-variant z-10"
                  >
                    <Plus className="w-5 h-5 pointer-events-none" />
                  </button>
                )}
              </div>
              <div className="flex flex-col">
                <h4 className="font-serif text-xl text-primary italic mb-2">
                  {product.name}
                </h4>
                <span className="text-label text-on-surface-variant">
                  GH₵{(product?.basePrice ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <Link to="/shop" className="border border-primary text-primary hover:bg-primary hover:text-on-primary text-label px-8 py-4 transition-colors duration-300">
            View All Masterpieces
          </Link>
        </div>
      </div>
    </section>
  );
}
