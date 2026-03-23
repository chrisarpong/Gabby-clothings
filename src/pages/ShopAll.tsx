import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

/* TODO: Ensure real images are placed in public/assets */
const mockProducts = Array.from({ length: 10 }).map((_, i) => ({
  id: `prod-${i + 1}`,
  name: i % 2 === 0 ? `Premium Kaftan ${i + 1}` : `Classic Agbada ${i + 1}`,
  price: 250.00 + (i * 15),
  image: `/assets/product${i + 1}.jpg`
}));

const ShopAll = () => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] pt-32 pb-20 px-[5%]"
    >
      <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d] mb-12 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Shop All
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2rem] w-full max-w-[1400px] mx-auto">
        {mockProducts.map((product) => (
          <div key={product.id} className="relative group overflow-hidden bg-white aspect-[3/4]">
            <Link to={`/product/${product.id}`} className="block w-full h-full">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';
                }}
              />
            </Link>

            {/* Price Overlay */}
            <div className="absolute top-4 right-4 z-20">
              <p className="text-sm font-[var(--font-sans)] tracking-widest text-[#3a1f1d] bg-[#F5F5F3] px-3 py-1">
                GH₵{product.price.toFixed(2)}
              </p>
            </div>

            {/* Title Overlay */}
            <Link to={`/product/${product.id}`} className="absolute top-4 left-4 z-20">
              <h3 className="text-sm font-[var(--font-sans)] tracking-widest uppercase text-[#3a1f1d] bg-[#F5F5F3] px-3 py-1">
                {product.name}
              </h3>
            </Link>

            {/* Add to Cart Hover Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({ ...product, quantity: 1 });
              }}
              className="absolute bottom-6 right-6 bg-white text-[#3a1f1d] w-12 h-12 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-30 text-2xl font-light"
              aria-label="Add to cart"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ShopAll;
