import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import img1 from '../assets/1.jpg';
import img2 from '../assets/2.webp';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/5.jpg';
import img6 from '../assets/6.jpg';
import img7 from '../assets/7.jpg';
import img8 from '../assets/8.jpg';

const localImages = [img1, img2, img3, img4, img5, img6, img7, img8];

/* 18 total items: 
   Initial load: 6
   Click 1: 12
   Click 2: 18 (All loaded, button hides)
*/
const mockProducts = Array.from({ length: 18 }).map((_, i) => ({
  id: `prod-${i + 1}`,
  name: i % 2 === 0 ? `Premium Kaftan ${i + 1}` : `Classic Agbada ${i + 1}`,
  price: 250.00 + (i * 15),
  image: localImages[i % localImages.length]
}));

const ShopAll = () => {
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // State to control how many items are visible on the screen
  const [visibleCount, setVisibleCount] = useState(6);

  const handleAddToCart = (product: { id: string, name: string, price: number, image: string }) => {
    addToCart({ ...product, quantity: 1 });
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
  };

  // THE FIX: Now it only loads 6 items (two rows) per click
  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

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
          color: '#3a1f1d'
        }}
      >
        Shop All
      </h1>

      <div className="w-full flex flex-col items-center">
        <div className="mx-auto w-full max-w-[1300px] px-5 grid justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {mockProducts.slice(0, visibleCount).map((product) => (
            <div key={product.id} className="relative overflow-hidden rounded-[4px] w-full aspect-[3/4] group hover:shadow-[0_10px_35px_rgba(58,31,29,0.06)] transition-shadow duration-[500ms] ease-out">

            <Link to={`/product/${product.id}`} className="block w-full h-full">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';
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
                background: 'linear-gradient(to top, rgba(245,245,243, 0.95) 0%, rgba(245,245,243, 0.8) 50%, transparent 100%)',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none',
                zIndex: 10
              }}
            >
              <h3 className="font-bold text-sm text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest">{product.name}</h3>
              <p className="text-sm text-[#3a1f1d] font-[var(--font-sans)] mt-1">GHS {product.price.toFixed(2)}</p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(product)}
              className="absolute bg-white text-[#3a1f1d] w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-20 text-2xl font-light"
              style={{ bottom: '1.5rem', right: '1.5rem' }}
              aria-label="Add to cart"
            >
              {addedItems[product.id] ? (
                <span className="text-green-600 text-xl font-bold">✓</span>
              ) : (
                '+'
              )}
            </button>

          </div>
        ))}
        </div>
      </div>

      {/* VIEW MORE BUTTON */}
      {visibleCount < mockProducts.length && (
        <div className="w-full flex justify-center mt-32 mb-16">
          <button
            onClick={loadMore}
            className="border border-[#3a1f1d] text-[#3a1f1d] uppercase tracking-widest text-xs hover:bg-[#3a1f1d] hover:text-[#F5F5F3] transition-colors duration-300"
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