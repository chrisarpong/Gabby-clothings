import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d] font-[var(--font-sans)] w-full flex flex-col items-center"
    >
      <div className="w-full max-w-[1200px] mx-auto px-8 md:px-12 lg:px-16 pt-20 pb-40">
        
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <h1 className="text-3xl font-normal" style={{ fontFamily: "'Playfair Display', serif" }}>Your cart is empty</h1>
            <Button asChild variant="outline" size="lg" className="mt-6 border-[#3a1f1d] px-12 py-6 text-sm hover:bg-[#3a1f1d] hover:text-white transition-all uppercase tracking-widest rounded-none">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start w-full">
            
            {/* LEFT COLUMN — My Cart */}
            <div className="flex-1 w-full">
              <h1 className="text-3xl font-normal mb-8 text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>My cart</h1>
              
              <div className="border-t border-[#3a1f1d]/20">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center py-8 border-b border-[#3a1f1d]/15 gap-8">
                    <div className="shrink-0 bg-[#EFEFEF] border border-[#3a1f1d]/5" style={{ width: '100px', height: '135px' }}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-[15px] font-normal tracking-wide mb-2 text-[#3a1f1d]">{item.name}</h3>
                        <p className="text-[14px] opacity-80 text-[#3a1f1d]">GH₵ {item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-8 sm:gap-12">
                        <div className="flex items-center border border-[#3a1f1d]/30 h-10 w-[110px]">
                          <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="flex-1 text-center text-lg hover:bg-[#3a1f1d]/5 select-none text-[#3a1f1d]">−</button>
                          <span className="flex-1 text-center text-[14px] text-[#3a1f1d]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 text-center text-lg hover:bg-[#3a1f1d]/5 select-none text-[#3a1f1d]">+</button>
                        </div>
                        <div className="w-[80px] text-right hidden sm:block">
                          <span className="text-[15px] font-normal text-[#3a1f1d]">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-[#3a1f1d]/40 hover:text-red-800 transition-colors bg-transparent hover:bg-transparent">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code & Note - Moved down with top border */}
              <div className="mt-14 pt-8 flex flex-col gap-5 border-t border-[#3a1f1d]/10">
                <Button variant="ghost" className="flex items-center gap-3 text-[15px] font-normal text-[#3a1f1d] hover:opacity-70 transition-opacity w-fit px-0 hover:bg-transparent justify-start">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                  Enter a promo code
                </Button>
                <Button variant="ghost" className="flex items-center gap-3 text-[15px] font-normal text-[#3a1f1d] hover:opacity-70 transition-opacity w-fit px-0 hover:bg-transparent justify-start">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                  Add a note
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN — Order Summary */}
            <div className="w-full lg:w-[350px] shrink-0">
              <h2 className="text-3xl font-normal mb-8 text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Order summary</h2>
              <div className="border-t border-[#3a1f1d]/20 pt-8 space-y-5">
                <div className="flex justify-between items-center text-[15px] text-[#3a1f1d]">
                  <span>Subtotal</span><span>GH₵ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[15px] text-[#3a1f1d]">
                  <span>Delivery</span><span className="opacity-60">--</span>
                </div>
                <span className="block text-[15px] underline underline-offset-4 decoration-[0.5px] cursor-pointer hover:opacity-70 transition-opacity text-[#3a1f1d]">
                  Ghana
                </span>
              </div>

              <div className="border-t border-[#3a1f1d]/20 mt-8 pt-8 flex justify-between items-baseline mb-8 text-[#3a1f1d]">
                <span className="text-[1.2rem] font-normal">Total</span>
                <span className="text-[1.35rem] font-normal tracking-wide">GH₵ {subtotal.toFixed(2)}</span>
              </div>

              {/* Checkout Button - Hover state set to text-white */}
              <Button asChild size="xl" className="w-full bg-transparent text-[#3a1f1d] border border-[#3a1f1d] rounded-none hover:bg-[#3a1f1d] hover:text-white transition-all uppercase tracking-[0.2em] font-medium text-[11px] h-[52px]">
                <Link to="/checkout">
                  Checkout
                </Link>
              </Button>

              <div className="flex justify-center items-center gap-2 mt-4 opacity-80 text-[#3a1f1d]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                <span className="text-[13px] font-normal">Secure Checkout</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;
