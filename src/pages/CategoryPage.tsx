import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import img1 from '../assets/1.jpg';
import img2 from '../assets/2.webp';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/5.jpg';
import img6 from '../assets/6.jpg';
import img7 from '../assets/7.jpg';
import img8 from '../assets/8.jpg';

const localImages = [img8, img7, img6, img5, img4, img3, img2, img1];

/* TODO: Ensure real images are placed in public/assets */
const mockProducts = Array.from({ length: 10 }).map((_, i) => ({
  id: `cat-prod-${i + 1}`,
  name: `Collection Item ${i + 1}`,
  price: 250.00 + (i * 15),
  image: localImages[i % localImages.length]
}));

const CategoryPage = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] pt-32 pb-20 px-[5%]"
    >
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d] capitalize" style={{ fontFamily: "'Playfair Display', serif" }}>
          {slug ? slug.replace('-', ' ') : 'Category'}
        </h1>
        <p className="mt-4 font-[var(--font-sans)] text-sm text-[#3a1f1d] uppercase tracking-widest">
          Category Collection
        </p>
      </div>

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
                addToCart({ ...product, name: `${slug ? slug.replace('-', ' ') : 'Collection'} Item ${product.id}`, quantity: 1 });
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

export default CategoryPage;
