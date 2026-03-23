import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import img1 from '../assets/1.jpg';
import img2 from '../assets/2.webp';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/8.jpg';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  /* Mock product data for development */
  const mockProducts = [
    { id: '1', name: 'Premium Tailored Kaftan', price: 350.00, images: [img1, img2, img3, img4, img5] },
    { id: '2', name: 'Luxury Agbada Suite', price: 850.00, images: [img2, img1, img3] },
    { id: '3', name: 'Classic Native Wear', price: 400.00, images: [img3, img4, img1] },
    { id: '4', name: 'Royal Velvet Cap', price: 150.00, images: [img4, img2] },
    { id: '5', name: 'Embroidered Tunic', price: 300.00, images: [img5, img1] },
    { id: '6', name: 'Senator Style Suit', price: 500.00, images: [img1, img3] },
    { id: '7', name: 'Tailored Trouser', price: 200.00, images: [img2, img4] },
    { id: '8', name: 'Silk Pocket Square', price: 50.00, images: [img3, img5] },
    { id: '9', name: 'Leather Sandals', price: 250.00, images: [img4, img1] },
    { id: '10', name: 'Traditional Beads', price: 100.00, images: [img5, img2] }
  ];

  const product = mockProducts.find(p => p.id === id) || {
    id: id || 'prod-1',
    name: 'Premium Tailored Kaftan',
    price: 350.00,
    images: [img1, img2, img3, img4, img5]
  };

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] pt-12 pb-20 px-[5%]"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[6fr_4fr] gap-12 md:gap-[4rem]">
        
        {/* Left Side (Image Scroll) */}
        <div className="flex flex-col gap-[2rem]">
          {product.images.map((img, idx) => (
            <div 
              key={idx} 
              className="w-full aspect-[3/4] overflow-hidden bg-white"
              onClick={() => setZoomedIndex(zoomedIndex === idx ? null : idx)}
            >
              <img 
                src={img} 
                alt={`${product.name} - view ${idx + 1}`} 
                className="w-full h-full object-cover"
                style={{
                  transform: zoomedIndex === idx ? 'scale(2)' : 'scale(1)',
                  cursor: zoomedIndex === idx ? 'zoom-out' : 'zoom-in',
                  transition: 'transform 0.4s ease'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=800&auto=format&fit=crop';
                }}
              />
            </div>
          ))}
        </div>

        {/* Right Side (Sticky Info) */}
        <div className="py-12 md:py-8" style={{ paddingLeft: '4rem' }}>
          <div className="sticky top-[150px] h-fit flex flex-col">
            <h1 className="text-[#3a1f1d]" style={{ fontSize: '2.8rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.1' }}>
              {product.name}
            </h1>
            <p className="font-[var(--font-sans)] text-[#3a1f1d]" style={{ fontSize: '1.4rem', marginBottom: '3rem' }}>
              GH₵{product.price.toFixed(2)}
            </p>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-2" style={{ marginBottom: '2rem' }}>
              <span className="font-[var(--font-sans)] text-xs uppercase tracking-widest text-[#555]">Quantity</span>
              <div className="flex items-center border border-[#dddddd] w-36">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 flex justify-center items-center text-[#3a1f1d] hover:bg-[#eaeaea] transition-colors"
                  style={{ padding: '10px 20px', fontSize: '1.2rem' }}
                >
                  -
                </button>
                <span className="flex-1 text-center font-[var(--font-sans)] text-[#3a1f1d]" style={{ fontSize: '1.2rem' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 flex justify-center items-center text-[#3a1f1d] hover:bg-[#eaeaea] transition-colors"
                  style={{ padding: '10px 20px', fontSize: '1.2rem' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4" style={{ marginBottom: '3rem' }}>
              <button 
                onClick={() => addToCart({ 
                  id: product.id, 
                  name: `${product.name} (${id})`, 
                  price: product.price, 
                  quantity, 
                  image: product.images[0] 
                })}
                className="w-full border border-[#3a1f1d] text-[#3a1f1d] bg-transparent font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-[#3a1f1d] hover:text-[#FFFFFF] transition-colors"
                style={{ padding: '1.2rem 0' }}
              >
                Add to Cart
              </button>
              <Link to="/checkout" className="w-full font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-black transition-colors flex items-center justify-center" style={{ backgroundColor: '#3a1f1d', color: '#ffffff', padding: '1.2rem 0' }}>
                Buy Now
              </Link>
            </div>

            {/* Accordions */}
            <div className="flex flex-col border-t border-[#dddddd]">
              {[
                { title: 'Product Info', content: 'Expertly tailored with premium lightweight fabrics, designed for effortless elegance and breathable comfort. Perfect for any formal or semi-formal occasion.' },
                { title: 'Return & Refund Policy', content: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original condition with all tags attached.' },
                { title: 'Shipping Info', content: 'Standard local delivery within 2-3 business days. International express shipping available globally via DHL.' }
              ].map((acc, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <button 
                    onClick={() => toggleAccordion(acc.title)}
                    className="flex justify-between w-full text-left font-[var(--font-sans)] text-[#3a1f1d] uppercase outline-none"
                    style={{ padding: '1.5rem 0', fontSize: '1.1rem' }}
                  >
                    {acc.title}
                    <span>{openAccordion === acc.title ? '−' : '+'}</span>
                  </button>
                  {openAccordion === acc.title && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      className="overflow-hidden text-[#555] text-sm leading-relaxed font-[var(--font-sans)] mb-6"
                    >
                      {acc.content}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ProductDetails;
