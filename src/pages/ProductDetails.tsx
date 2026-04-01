import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

// MOCK DATA
const mockProducts = [
  {
    id: "1",
    name: "Classic Agbada 2",
    price: 265.00,
    mainImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop",
    description: "This is your Product Page description. It's a great place to tell customers what this category is about, connect with your audience and draw attention to your products."
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // FALLBACK SAFEGUARD: If the ID from the shop page doesn't match the mock database, 
    // force it to load the first product so the layout never breaks.
    const foundProduct = mockProducts.find(p => p.id === id) || mockProducts[0];
    setProduct(foundProduct);
  }, [id]);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d] font-[var(--font-sans)] w-full pt-20 pb-40"
    >
      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-12 lg:px-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* LEFT: Image Gallery (Veilux Style) */}
          <div className="w-full flex justify-center lg:justify-start">
            <div className="w-full max-w-[500px] bg-[#EFEFEF] border border-[#3a1f1d]/5" style={{ aspectRatio: '4/5' }}>
              <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* RIGHT: Product Details & Controls */}
          <div className="w-full max-w-[450px]">
            
            {/* Title & Price */}
            <div className="space-y-2 mb-8">
              <h1 className="text-[2rem] font-normal italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.name}
              </h1>
              <p className="text-[17px] font-normal tracking-wide">GH₵ {product.price.toFixed(2)}</p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-[13px] mb-2 font-medium">Quantity ^</label>
              <div className="flex items-center border border-[#3a1f1d]/30 h-11 w-[120px]">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 text-lg hover:bg-[#3a1f1d]/5 transition-colors select-none">−</button>
                <span className="flex-1 text-center text-[14px]">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 text-lg hover:bg-[#3a1f1d]/5 transition-colors select-none">+</button>
              </div>
            </div>

            {/* Buttons (Add to Cart / Buy Now) */}
            <div className="space-y-3 mb-10">
              <button
                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image: product.mainImage, quantity })}
                className="w-full border border-[#3a1f1d] bg-transparent text-[#3a1f1d] py-[14px] text-center text-[15px] font-normal hover:bg-[#3a1f1d] hover:text-[#F9F8F6] transition-colors"
              >
                Add to Cart
              </button>
              
              <Link to="/checkout" className="block w-full bg-[#3a1f1d] text-[#F9F8F6] py-[14px] text-center text-[15px] font-normal hover:bg-black transition-colors">
                Buy Now
              </Link>
            </div>

            {/* Description */}
            <p className="text-[14px] leading-relaxed opacity-90 mb-10">
              {product.description}
            </p>

            {/* Accordions (Veilux Style lines with + / -) */}
            <div className="border-t border-[#3a1f1d]/20">
              
              <details className="group border-b border-[#3a1f1d]/20 py-4 cursor-pointer">
                <summary className="flex justify-between items-center text-[15px] font-normal list-none">
                  Product Info
                  <span className="text-xl font-light group-open:hidden">+</span>
                  <span className="text-xl font-light hidden group-open:block">−</span>
                </summary>
                <p className="mt-4 text-[14px] opacity-80 leading-relaxed">
                  I'm a great place to add more information about your product, such as sizing, material, care, and cleaning instructions.
                </p>
              </details>

              <details className="group border-b border-[#3a1f1d]/20 py-4 cursor-pointer">
                <summary className="flex justify-between items-center text-[15px] font-normal list-none">
                  Return & Refund Policy
                  <span className="text-xl font-light group-open:hidden">+</span>
                  <span className="text-xl font-light hidden group-open:block">−</span>
                </summary>
                <p className="mt-4 text-[14px] opacity-80 leading-relaxed">
                  I’m a Return and Refund policy. I’m a great place to let your customers know what to do in case they are dissatisfied with their purchase.
                </p>
              </details>

              <details className="group border-b border-[#3a1f1d]/20 py-4 cursor-pointer">
                <summary className="flex justify-between items-center text-[15px] font-normal list-none">
                  Shipping Info
                  <span className="text-xl font-light group-open:hidden">+</span>
                  <span className="text-xl font-light hidden group-open:block">−</span>
                </summary>
                <p className="mt-4 text-[14px] opacity-80 leading-relaxed">
                  I'm a shipping policy. I'm a great place to add more information about your shipping methods, packaging and cost.
                </p>
              </details>

            </div>

          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;