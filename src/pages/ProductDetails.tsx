import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useCart } from "../context/CartContext";
import ProductImageGallery from "../components/ProductDetail/ProductImageGallery";
import ProductInfoSections from "../components/ProductDetail/ProductInfoSections";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // ── Local quantity state ──
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // ── Fetch product from Convex ──
  const product = useQuery(
    api.products.getProductById,
    id ? { id: id as Id<"products"> } : "skip"
  );

  // Toast feedback
  const showFeedback = useCallback(() => {
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }, []);

  // ── Quantity controls ──
  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setQuantity(val);
    }
  };

  // ── Add to Cart ──
  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? FALLBACK_IMAGE,
      quantity,
    });
    showFeedback();
  };

  // ── Buy Now: add to cart + navigate ──
  const handleBuyNow = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? FALLBACK_IMAGE,
      quantity,
    });
    navigate("/checkout");
  };

  // ── Loading ──
  if (product === undefined) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-[#3a1f1d]/20 border-t-[#3a1f1d] rounded-full"
        />
      </div>
    );
  }

  // ── 404 ──
  if (product === null) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center text-[#3a1f1d] gap-6">
        <h1
          className="text-3xl"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: "normal" }}
        >
          Product Not Found
        </h1>
        <p
          className="text-[15px] opacity-70 max-w-md text-center"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <button
          type="button"
          onClick={() => navigate("/shop")}
          className="mt-4 border border-[#3a1f1d] px-10 py-3 text-sm hover:bg-[#3a1f1d] hover:text-white transition-all"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ── Info sections from product data ──
  const infoSections = [
    {
      title: "Product Info",
      content:
        product.productInfo ??
        "Premium quality garment crafted with attention to detail. Contact us for sizing and material inquiries.",
    },
    {
      title: "Return & Refund Policy",
      content:
        product.returnPolicy ??
        "We accept returns within 14 days of delivery for unworn items in original packaging. Custom-made pieces are final sale.",
    },
    {
      title: "Shipping Info",
      content:
        product.shippingInfo ??
        "Standard delivery within Ghana: 3–5 business days. Free shipping on orders above GH₵ 500.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d] w-full pt-12 pb-40"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ════════ LEFT: Image Gallery ════════ */}
          <div className="w-full flex justify-center lg:justify-start">
            <div className="w-full max-w-[520px]">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>
          </div>

          {/* ════════ RIGHT: Product Details ════════ */}
          <div className="w-full max-w-[480px]">

            {/* Title & Price */}
            <div className="space-y-3 mb-8">
              <h1
                className="text-[2rem] leading-tight italic"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: "normal" }}
              >
                {product.name}
              </h1>
              <p className="text-[17px] tracking-wide" style={{ fontWeight: "normal" }}>
                GH₵ {product.price.toFixed(2)}
              </p>
            </div>

            {/* ── QUANTITY SELECTOR (fully interactive) ── */}
            <div className="mb-8">
              <label
                className="block text-[13px] mb-2 font-medium uppercase tracking-wider"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Quantity
              </label>
              <div className="flex items-center border border-[#3a1f1d]/30 h-11 w-[130px] select-none">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={decrement}
                  disabled={quantity <= 1}
                  className="flex-1 h-full text-lg hover:bg-[#3a1f1d]/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  −
                </motion.button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInput}
                  min={1}
                  step={1}
                  className="flex-1 text-center text-[14px] bg-transparent outline-none border-x border-[#3a1f1d]/15 h-full w-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={increment}
                  className="flex-1 h-full text-lg hover:bg-[#3a1f1d]/5 transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </motion.button>
              </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="flex-1 border border-[#3a1f1d] bg-transparent text-[#3a1f1d] py-[14px] text-center text-[15px] hover:bg-[#3a1f1d] hover:text-[#F9F8F6] transition-colors relative overflow-hidden"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
                id="add-to-cart-btn"
              >
                {addedFeedback ? (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added!
                  </motion.span>
                ) : (
                  "Add to Cart"
                )}
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyNow}
                className="flex-1 bg-[#3a1f1d] text-[#F9F8F6] py-[14px] text-center text-[15px] hover:bg-black transition-colors"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
                id="buy-now-btn"
              >
                Buy Now
              </motion.button>
            </div>

            {/* ── DESCRIPTION ── */}
            <p className="text-[14px] leading-relaxed opacity-90 mb-10">
              {product.description}
            </p>

            {/* ── EXPANDABLE INFO SECTIONS ── */}
            <ProductInfoSections sections={infoSections} />
          </div>
        </div>
      </div>

      {/* ── SUCCESS TOAST ── */}
      {addedFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-8 right-8 bg-[#3a1f1d] text-white px-6 py-4 rounded-xl shadow-2xl z-[300] flex items-center gap-3"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-[14px]">{product.name} added to cart</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductDetails;