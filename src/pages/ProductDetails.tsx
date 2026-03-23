import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  /* Mock product data for development */
  const product = {
    id: id || 'prod-1',
    name: 'Premium Tailored Kaftan',
    price: 350.00,
    images: [
      '/assets/1.jpg',
      '/assets/2.webp',
      '/assets/3.jpg',
      '/assets/4.jpg',
      '/assets/8.jpg'
    ]
  };

  const toggleAccordion = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3] pt-32 pb-20 px-[5%]"
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[6fr_4fr] gap-12 md:gap-[4rem]">
        
        {/* Left Side (Image Scroll) */}
        <div className="flex flex-col gap-[2rem]">
          {product.images.map((img, idx) => (
            <div key={idx} className="w-full aspect-[3/4] overflow-hidden bg-white">
              <img 
                src={img} 
                alt={`${product.name} - view ${idx + 1}`} 
                className="w-full h-full object-cover cursor-zoom-in hover:scale-110 transition-transform duration-500 ease-out"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=800&auto=format&fit=crop';
                }}
              />
            </div>
          ))}
        </div>

        {/* Right Side (Sticky Info) */}
        <div>
          <div className="sticky top-[120px] h-fit flex flex-col">
            <h1 className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            <p className="font-[var(--font-sans)] text-xl text-[#3a1f1d] mb-8">
              GH₵{product.price.toFixed(2)}
            </p>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-2 mb-8">
              <span className="font-[var(--font-sans)] text-xs uppercase tracking-widest text-[#555]">Quantity</span>
              <div className="flex items-center border border-[#dddddd] w-32 h-12">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 flex justify-center items-center text-[#3a1f1d] hover:bg-[#eaeaea] transition-colors h-full"
                >
                  -
                </button>
                <span className="flex-1 text-center font-[var(--font-sans)] text-[#3a1f1d]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 flex justify-center items-center text-[#3a1f1d] hover:bg-[#eaeaea] transition-colors h-full"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mb-12">
              <button 
                onClick={() => addToCart({ 
                  id: product.id, 
                  name: `${product.name} (${id})`, 
                  price: product.price, 
                  quantity, 
                  image: product.images[0] 
                })}
                className="w-full h-14 border border-[#3a1f1d] text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-[#3a1f1d] hover:text-white transition-colors"
              >
                Add to Cart
              </button>
              <button className="w-full h-14 bg-[#3a1f1d] text-white font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-black transition-colors">
                Buy Now
              </button>
            </div>

            {/* Accordions */}
            <div className="flex flex-col border-t border-[#dddddd]">
              {[
                { title: 'Product Info', content: 'Expertly tailored with premium lightweight fabrics, designed for effortless elegance and breathable comfort. Perfect for any formal or semi-formal occasion.' },
                { title: 'Return & Refund Policy', content: 'We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in original condition with all tags attached.' },
                { title: 'Shipping Info', content: 'Standard local delivery within 2-3 business days. International express shipping available globally via DHL.' }
              ].map((acc, idx) => (
                <div key={idx} className="border-b border-[#dddddd] py-4">
                  <button 
                    onClick={() => toggleAccordion(acc.title)}
                    className="flex justify-between w-full text-left font-[var(--font-sans)] text-[#3a1f1d] uppercase tracking-wider text-sm outline-none"
                  >
                    {acc.title}
                    <span>{openAccordion === acc.title ? '−' : '+'}</span>
                  </button>
                  {openAccordion === acc.title && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      className="overflow-hidden mt-4 text-[#555] text-sm leading-relaxed font-[var(--font-sans)]"
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
