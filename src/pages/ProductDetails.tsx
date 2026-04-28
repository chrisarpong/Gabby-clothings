import { useState, useCallback } from "react";
import { Button } from "../components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Helmet } from "react-helmet-async";
import { Star } from "lucide-react";
import { useUser } from "@clerk/react";
import type { Id } from "../../convex/_generated/dataModel";
import { useCart } from "../context/CartContext";
import ProductImageGallery from "../components/ProductDetail/ProductImageGallery";
import ProductInfoSections from "../components/ProductDetail/ProductInfoSections";
import QuantitySelector from "../components/ProductDetail/QuantitySelector";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop";

const SIZES = ["XS", "S", "M", "L", "XL", "Bespoke"];

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { user } = useUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const product = useQuery(
    api.products.getProductById,
    id ? { id: id as Id<"products"> } : "skip"
  );

  const userWishlist = useQuery(api.wishlist.getUserWishlist);
  const toggleWishlist = useMutation(api.wishlist.toggleWishlist);
  const reviews = useQuery(api.reviews.getProductReviews, product ? { productId: product._id } : "skip");
  const addReview = useMutation(api.reviews.addReview);
  const allProducts = useQuery(api.products.getProducts);
  const crossSellProducts = allProducts?.filter(p => p._id !== product?._id).slice(0, 4) || [];

  const showFeedback = useCallback(() => {
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  }, []);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart({
      id: `${product._id}-${selectedSize}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? FALLBACK_IMAGE,
      quantity,
      size: selectedSize,
    });
    showFeedback();
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize) return;
    addToCart({
      id: `${product._id}-${selectedSize}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? FALLBACK_IMAGE,
      quantity,
      size: selectedSize,
    });
    navigate("/checkout");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !comment.trim()) return;
    try {
      await addReview({ productId: product._id, rating, comment });
      setComment("");
      setRating(5);
      toast.success("Thank you for your review.");
    } catch (error) {
      toast.error("Failed to submit review.");
    }
  };

  const isWishlisted = product && userWishlist?.some((p) => p?._id === product._id);

  const handleWishlistToggle = async () => {
    if (!product || userWishlist === undefined) return;
    try {
      const res = await toggleWishlist({ productId: product._id });
      if (res.added) toast.success("Added to wishlist");
      else toast.success("Removed from wishlist");
    } catch (e) {
      toast.error("Please log in to save items.");
    }
  };

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
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/shop")}
          className="mt-4 border border-[#3a1f1d] px-10 py-6 text-sm bg-transparent hover:bg-[#3a1f1d] hover:text-white transition-all rounded-none"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  const infoSections = [
    {
      title: "Product Info",
      content:
        product.productInfo ??
        "Premium quality garment crafted with attention to detail. Contact us for sizing and material inquiries. This is also a great space to highlight what makes this product special.",
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

  const isButtonDisabled = selectedSize === null;
  const buttonText = isButtonDisabled ? "Select a Size" : (addedFeedback ? "Added!" : "Add to Cart");
  const buyNowText = isButtonDisabled ? "Select a Size" : "Buy Now";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d] w-full pt-10 pb-40"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <Helmet>
        <title>{product.name} | Gabby Newluk</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

          {/* ════════ LEFT: Image Gallery ════════ */}
          <div className="w-full lg:w-[55%] xl:w-[60%]">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* ════════ RIGHT: Product Details ════════ */}
          <div className="w-full lg:w-[45%] xl:w-[40%] lg:sticky lg:top-24 pt-4">

            {/* Title & Price */}
            <div className="space-y-4 mb-8">
              <h1
                className="text-[2.2rem] leading-tight italic"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: "normal" }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[18px] tracking-wide" style={{ fontWeight: "normal" }}>
                  GH₵ {product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ── SIZE SELECTOR ── */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[12px] uppercase tracking-widest font-medium text-[#3a1f1d]">Size</span>
                <button onClick={() => navigate("/size-guide")} className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity underline underline-offset-4">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-[42px] px-6 text-[12px] uppercase tracking-widest transition-colors ${selectedSize === size ? 'bg-[#3a1f1d] text-white' : 'bg-transparent text-[#3a1f1d] border border-[#3a1f1d]/20 hover:border-[#3a1f1d]/60'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ── QUANTITY SELECTOR ── */}
            <QuantitySelector quantity={quantity} onChange={setQuantity} />

            {/* ── BUTTONS ── */}
            <div className="flex flex-col gap-4 mb-8 w-full">
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={isButtonDisabled}
                  className="flex-1 h-[54px] border border-[#3a1f1d] bg-transparent text-[#3a1f1d] text-[16px] hover:bg-[#3a1f1d] hover:text-[#F9F8F6] transition-colors rounded-none shadow-none disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#3a1f1d]"
                  style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
                >
                  {buttonText}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className="w-[54px] h-[54px] border border-[#3a1f1d] bg-transparent text-[#3a1f1d] hover:bg-[#3a1f1d]/5 transition-colors rounded-none shadow-none flex items-center justify-center p-0 shrink-0"
                  aria-label="Add to wishlist"
                >
                  {/* Thinner stroke on the heart to match inspo */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </Button>
              </div>

              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={isButtonDisabled}
                className="w-full h-[54px] bg-[#3a1f1d] text-[#F9F8F6] text-[16px] hover:bg-[#3a1f1d]/90 transition-colors shadow-none rounded-none disabled:opacity-50"
                style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
              >
                {buyNowText}
              </Button>
            </div>

            {/* ── DESCRIPTION ── */}
            <p className="text-[15px] text-[#3a1f1d]/80 leading-relaxed mb-10">
              {product.description}
            </p>

            {/* ── EXPANDABLE INFO SECTIONS ── */}
            <ProductInfoSections sections={infoSections} />

            {/* ── CLIENT REVIEWS ── */}
            <div className="mt-16 pt-12 border-t border-[#3a1f1d]/10">
              <h2 className="text-2xl italic mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>Client Reviews</h2>
              
              {!reviews || reviews.length === 0 ? (
                <p className="text-[14px] text-[#3a1f1d]/60 mb-8" style={{ fontFamily: "'Jost', sans-serif" }}>No reviews yet. Be the first to review this piece.</p>
              ) : (
                <div className="space-y-8 mb-12">
                  {reviews.map((review) => (
                    <div key={review._id} className="pb-8 border-b border-[#3a1f1d]/5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-[#3a1f1d] text-[#3a1f1d]" : "text-[#3a1f1d]/20"}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[13px] font-medium text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>{review.userName}</span>
                        <span className="text-[11px] uppercase tracking-widest text-[#3a1f1d]/40">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[14px] text-[#3a1f1d]/80 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="bg-white p-8 border border-[#3a1f1d]/10">
                  <h3 className="text-[14px] uppercase tracking-widest font-medium mb-6">Leave a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="text-[11px] uppercase tracking-widest opacity-60 block mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                            <Star className={`w-6 h-6 ${star <= rating ? "fill-[#3a1f1d] text-[#3a1f1d]" : "text-[#3a1f1d]/20 hover:text-[#3a1f1d]/50 transition-colors"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-widest opacity-60 block mb-3">Your Comment</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        rows={4}
                        className="w-full bg-transparent border border-[#3a1f1d]/20 p-4 text-[14px] focus:outline-none focus:border-[#3a1f1d] transition-colors resize-none rounded-none"
                        placeholder="Share your thoughts on the fit, fabric, and feel..."
                      />
                    </div>
                    <Button type="submit" className="self-start bg-[#3a1f1d] text-white px-8 h-[48px] text-[12px] uppercase tracking-widest rounded-none shadow-none hover:bg-[#3a1f1d]/90">
                      Submit Review
                    </Button>
                  </form>
                </div>
              ) : (
                <p className="text-[13px] uppercase tracking-widest text-[#3a1f1d]/60 mt-8">Please log in to leave a review.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── YOU MAY ALSO LIKE ── */}
      {crossSellProducts.length > 0 && (
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 lg:px-16 mt-32">
          <h2 className="text-3xl italic mb-10 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {crossSellProducts.map((p) => (
              <div key={p._id} className="group cursor-pointer" onClick={() => {
                navigate(`/product/${p._id}`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>
                <div className="relative aspect-[3/4] mb-4 bg-white overflow-hidden">
                  <img src={p.images?.[0] ?? FALLBACK_IMAGE} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[13px] text-[#3a1f1d] uppercase tracking-widest font-medium">{p.name}</h3>
                  <p className="text-[13px] text-[#3a1f1d]/70">GH₵ {p.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUCCESS TOAST ── */}
      {addedFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-8 right-8 bg-[#3a1f1d] text-white px-6 py-4 rounded-none shadow-2xl z-[300] flex items-center gap-3"
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