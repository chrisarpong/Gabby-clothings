import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { useQuery  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

import ReviewSection from "../components/ReviewSection";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  
  const product = useQuery(api.products.getById, { id: id as Id<"products"> });
  const allProducts = useQuery(api.products.getAll);
  const reviews = useQuery(api.reviews.getByProduct, id ? { productId: id as Id<"products"> } : "skip");
  
  const avgRating = reviews?.length 
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length 
    : 0;
  
  const [activeSize, setActiveSize] = useState("");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    let variantSku = undefined;
    if (product.variants && product.variants.length > 0) {
      if (!activeSize) {
        toast.error("Please select a size first.");
        return;
      }
      const variant = product.variants.find(v => v.size === activeSize);
      if (variant) {
        if (variant.stock <= 0) {
          toast.error("Sold out", { description: `Size ${activeSize} is currently out of stock.` });
          return;
        }
        variantSku = variant.sku;
      }
    }

    addItem({
      productId: product._id,
      variantSku,
      quantity: 1
    });

    toast.success("Added to cart");
    navigate('/cart');
  };

  if (product === undefined) return <div className="min-h-screen pt-40 px-20">Loading product details...</div>;
  if (product === null) return <div className="min-h-screen pt-40 px-20 text-brand-charcoal/50">Product not found.</div>;

  const sizes: string[] = product.variants && product.variants.length > 0 && product.variants[0].size
    ? Array.from(new Set(product.variants.map((v: any) => v.size as string)))
    : ["M", "L", "XL", "Custom Fit"];
  const relatedProducts = allProducts ? allProducts.filter(p => p._id !== product._id).slice(0, 4) : [];

  return (
    <main className="min-h-screen flex flex-col bg-surface text-on-surface pt-32 pb-32">
      <div className="max-w-[1536px] mx-auto px-5 md:px-20 w-full flex-1">
        {/* Top Section: Split Screen */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32">
          
          {/* Left Side: Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col gap-6"
          >
            <div className="w-full aspect-[3/4] bg-surface-container overflow-hidden group">
               <img 
                src={product?.images?.[0] || "/assets/1.jpg"} 
                alt={product?.name || "Product"} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            {/* Thumbnails */}
            {product?.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-6">
                {product.images.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] bg-surface-container overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover grayscale-[20%]"
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Side: Product Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            {/* Breadcrumbs */}
            <nav className="font-label text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-outline mb-10 flex items-center gap-2">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
              <span>/</span>
              <span className="text-primary">{product.name}</span>
            </nav>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary italic leading-tight mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="font-label text-xl tracking-wide text-primary block">
                GH₵{(product?.basePrice ?? 0).toFixed(2)}
              </span>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2 border-l border-outline-variant pl-4">
                  <div className="flex text-brand-gold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-current' : 'text-outline-variant fill-transparent'}`} />
                    ))}
                  </div>
                  <span className="font-sans text-xs text-on-surface-variant">({reviews.length})</span>
                </div>
              )}
            </div>

            <p className="font-sans text-on-surface-variant text-base md:text-lg leading-relaxed mb-12 border-b border-surface-variant pb-12 whitespace-pre-wrap">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-4">
                <span className="font-label text-xs tracking-[0.2em] uppercase text-primary">Select Size</span>
                <Link to="/size-guide" className="text-on-surface-variant text-xs underline hover:text-primary transition-colors">Size Guide</Link>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {sizes.map((size) => (
                  <button 
                    key={size}
                    onClick={() => setActiveSize(size)}
                    className={`py-4 font-label text-[11px] tracking-widest uppercase transition-colors border ${
                      activeSize === size 
                        ? 'bg-primary text-on-primary border-primary' 
                        : 'bg-transparent text-primary border-outline-variant hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4 mb-16">
              <button onClick={handleAddToCart} className="w-full bg-primary text-on-primary py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors">
                Add To Cart
              </button>
              <Link to={`/custom-tailoring?product=${product._id}&title=${encodeURIComponent(product.name)}`} className="w-full">
                <button className="w-full bg-transparent border border-outline-variant text-primary py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-container transition-colors">
                  Request Custom Sizing
                </button>
              </Link>
            </div>

            {/* Accordions */}
            <div className="flex flex-col border-t border-surface-variant">
              {/* Fabric & Care */}
              <div className="border-b border-surface-variant">
                <button 
                  onClick={() => toggleAccordion('fabric')}
                  className="w-full py-6 flex justify-between items-center text-left"
                >
                  <span className="font-label text-xs tracking-[0.2em] uppercase text-primary">Fabric & Care</span>
                  {openAccordion === 'fabric' ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'fabric' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 font-sans text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                        {product.productInfo || "100% Pure Linen sourced locally. Hand wash cold with mild detergent. Do not bleach. Line dry in shade. Warm iron if needed."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Shipping & Returns */}
              <div className="border-b border-surface-variant">
                <button 
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-6 flex justify-between items-center text-left"
                >
                  <span className="font-label text-xs tracking-[0.2em] uppercase text-primary">Shipping & Returns</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-primary" />}
                </button>
                <AnimatePresence>
                  {openAccordion === 'shipping' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 font-sans text-on-surface-variant text-sm leading-relaxed whitespace-pre-wrap">
                        {product.shippingInfo || product.returnPolicy || "Delivery within Accra in 2-3 days. Nationwide shipping available. Returns accepted within 14 days of delivery for standard sizes. Custom fit items are final sale."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Product Reviews */}
        <ReviewSection productId={product._id} />

        {/* Bottom Section: You Might Also Like */}
        <section className="pt-24 border-t border-surface-variant">
          <h2 className="font-serif text-3xl md:text-5xl text-primary italic mb-12 text-center">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
            {relatedProducts.map((relProduct, index) => (
              <motion.div 
                key={relProduct._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/product/${relProduct._id}`)}
              >
                  <div className="relative aspect-[3/4] mb-6 bg-surface-container overflow-hidden">
                    <img 
                      src={relProduct?.images?.[0] || "/assets/1.jpg"} 
                      alt={relProduct?.name || "Product"} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                           addItem({
                             productId: relProduct._id,
                             quantity: 1
                           });
                           toast.success("Added to cart");
                        }}
                        className="w-full bg-surface/80 backdrop-blur-md text-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 border border-outline-variant/50 hover:bg-primary hover:text-on-primary transition-colors"
                       >
                        Quick Add
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col">
                      <h3 className="font-serif text-[18px] text-primary">{relProduct.name}</h3>
                      <span className="font-label text-[11px] tracking-widest text-outline uppercase mt-1">{relProduct.category}</span>
                    </div>
                    <span className="font-label text-sm tracking-wide text-primary whitespace-nowrap">GH₵{(relProduct?.basePrice ?? 0).toFixed(2)}</span>
                  </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
