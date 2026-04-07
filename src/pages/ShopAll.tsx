import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCart } from '../context/CartContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';

const ShopAll = () => {
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(4);

  // ── Live data from Convex ──
  const products = useQuery(api.products.getProducts);

  const handleAddToCart = (product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  }) => {
    addToCart({
      id: product._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? FALLBACK_IMAGE,
      quantity: 1,
    });
    setAddedItems((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product._id]: false }));
    }, 1000);
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  // ── Loading state ──
  if (products === undefined) {
    return (
      <div className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[#3a1f1d]/20 border-t-[#3a1f1d] rounded-full"
        />
        <p
          className="mt-6 text-sm uppercase tracking-widest text-[#3a1f1d]/50"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Loading collection…
        </p>
      </div>
    );
  }

  // ── Empty state ──
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#F5F5F3] flex flex-col items-center justify-center text-[#3a1f1d]"
      >
        <h1
          className="text-3xl font-normal mb-4"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
        >
          Coming Soon
        </h1>
        <p className="text-sm opacity-60" style={{ fontFamily: "'Jost', sans-serif" }}>
          New pieces are being added to the collection.
        </p>
      </motion.div>
    );
  }

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3]"
      style={{ padding: '6rem 5% 8rem' }}
    >
      <h1
        style={{
          marginBottom: '4rem',
          textAlign: 'center',
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: '3.5rem',
          color: '#3a1f1d',
        }}
      >
        Shop All
      </h1>

      <div className="w-full flex flex-col items-center">
        {/* 4-column grid on large screens, 2 on medium, 1 on mobile */}
        <div className="mx-auto w-full max-w-[1400px] px-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleProducts.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="relative overflow-hidden rounded-[4px] w-full aspect-[3/4] group hover:shadow-[0_10px_35px_rgba(58,31,29,0.06)] transition-shadow duration-[500ms] ease-out"
            >
              <Link to={`/product/${product._id}`} className="block w-full h-full">
                <img
                  src={product.images?.[0] ?? FALLBACK_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </Link>

              {/* Name & Price Box */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: '1.25rem',
                  background:
                    'linear-gradient(to top, rgba(245,245,243, 0.95) 0%, rgba(245,245,243, 0.8) 50%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              >
                <h3 className="font-bold text-xs text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest leading-snug">
                  {product.name}
                </h3>
                <p className="text-sm text-[#3a1f1d] font-[var(--font-sans)] mt-1">
                  GH₵ {product.price.toFixed(2)}
                </p>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="absolute bg-white text-[#3a1f1d] w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-20 text-xl font-light"
                style={{ bottom: '1.25rem', right: '1.25rem' }}
                aria-label="Add to cart"
              >
                {addedItems[product._id] ? (
                  <span className="text-green-600 text-lg font-bold">✓</span>
                ) : (
                  '+'
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* VIEW MORE BUTTON — hidden when all products visible */}
      {visibleCount < products.length && (
        <div className="w-full flex justify-center mt-20 mb-16">
          <button
            onClick={loadMore}
            className="bg-transparent border border-[#3a1f1d] text-[#3a1f1d] uppercase tracking-widest text-xs hover:bg-[#3a1f1d] hover:text-[#F5F5F3] transition-colors duration-300"
            style={{ padding: '16px 48px', fontFamily: "'Jost', sans-serif" }}
          >
            View More
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ShopAll;