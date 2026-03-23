import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] pt-[130px] pb-20 px-[5%]"
    >
      <h1 className="text-4xl md:text-6xl italic text-[#3a1f1d] mb-12 text-center" style={{ fontFamily: "'Playfair Display', serif" }}>
        Shop All
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2rem] w-full max-w-[1400px] mx-auto">
        {mockProducts.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="group block w-full">
            <div className="relative overflow-hidden bg-white aspect-[3/4]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';
                }}
              />

              {/* + Button Overlay (Visual only, Link handles routing) */}
              <div
                className="absolute bottom-6 right-6 bg-white text-[#3a1f1d] w-12 h-12 rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 text-2xl font-light"
              >
                +
              </div>
            </div>

            {/* Title and Price Below Image */}
            <div className="flex flex-col mt-[1rem]">
              <h3 className="text-[#3a1f1d] uppercase tracking-[0.05em]" style={{ fontSize: '1.1rem', fontFamily: "'Jost', sans-serif" }}>
                {product.name}
              </h3>
              <p className="text-[#3a1f1d] font-[var(--font-sans)] tracking-widest text-sm mt-1">
                GH₵{product.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default ShopAll;
