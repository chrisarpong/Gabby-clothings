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

/* TODO: Ensure real images are placed in public/assets */
const mockProducts = Array.from({ length: 10 }).map((_, i) => ({
  id: `prod-${i + 1}`,
  name: i % 2 === 0 ? `Premium Kaftan ${i + 1}` : `Classic Agbada ${i + 1}`,
  price: 250.00 + (i * 15),
  image: localImages[i % localImages.length]
}));

const ShopAll = () => {
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: { id: string, name: string, price: number, image: string }) => {
    addToCart({ ...product, quantity: 1 });
    setAddedItems(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] pt-12 pb-20 px-[5%]"
    >
      <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d] mb-12 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Shop All
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2rem] w-full max-w-[1400px] mx-auto">
        {mockProducts.map((product) => (
          <div key={product.id} className="relative overflow-hidden w-full aspect-[3/4]">
            
            <Link to={`/product/${product.id}`} className="block w-full h-full">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';
                }}
              />
            </Link>

            {/* Name & Price Box */}
            <div 
              style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                background: 'rgba(245, 245, 243, 0.95)',
                padding: '0.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none',
                zIndex: 10,
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <h3 className="font-bold text-sm text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest">{product.name}</h3>
              <p className="text-sm text-[#3a1f1d] font-[var(--font-sans)]">GH₵{product.price.toFixed(2)}</p>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(product)}
              className="absolute bottom-4 right-4 bg-white text-[#3a1f1d] w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 z-20 text-2xl font-light"
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
    </motion.div>
  );
};

export default ShopAll;
