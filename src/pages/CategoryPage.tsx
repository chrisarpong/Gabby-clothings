import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCart } from '../context/CartContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // ── Live data from Convex — filter by category slug ──
  const products = useQuery(
    api.products.getProductsByCategory,
    slug ? { category: slug } : 'skip'
  );

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
          className="text-3xl font-normal mb-4 capitalize"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
        >
          {slug ? slug.replace('-', ' ') : 'Category'}
        </h1>
        <p className="text-sm opacity-60" style={{ fontFamily: "'Jost', sans-serif" }}>
          No products found in this category yet.
        </p>
        <Link
          to="/shop"
          className="mt-8 border border-[#3a1f1d] px-10 py-3 text-xs uppercase tracking-widest hover:bg-[#3a1f1d] hover:text-white transition-all"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Shop All
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3]"
      style={{ padding: '6rem 5%' }}
    >
      <div className="flex flex-col items-center justify-center" style={{ marginBottom: '4rem' }}>
        <h1
          className="capitalize"
          style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: '3.5rem',
            color: '#3a1f1d',
          }}
        >
          {slug ? slug.replace('-', ' ') : 'Category'}
        </h1>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 w-full max-w-[1400px] mx-auto"
        style={{ gap: '3rem' }}
      >
        {products.map((product) => (
          <div key={product._id} className="relative overflow-hidden w-full aspect-[3/4]">
            <Link to={`/product/${product._id}`} className="block w-full h-full">
              <img
                src={product.images?.[0] ?? FALLBACK_IMAGE}
                alt={product.name}
                className="w-full h-full object-cover"
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
                padding: '1.5rem',
                background:
                  'linear-gradient(to top, rgba(245,245,243, 0.95) 0%, rgba(245,245,243, 0.8) 50%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <h3 className="font-bold text-sm text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest">
                {product.name}
              </h3>
              <p className="text-sm text-[#3a1f1d] font-[var(--font-sans)] mt-1">
                GH₵ {product.price.toFixed(2)}
              </p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(product)}
              className="absolute bg-white text-[#3a1f1d] w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-20 text-2xl font-light"
              style={{ bottom: '1.5rem', right: '1.5rem' }}
              aria-label="Add to cart"
            >
              {addedItems[product._id] ? (
                <span className="text-green-600 text-xl font-bold">✓</span>
              ) : (
                '+'
              )}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CategoryPage;
