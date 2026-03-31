import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = 50.00;
  const total = subtotal + delivery;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full bg-[#F5F5F3]"
      style={{ paddingTop: '140px', paddingBottom: '8rem' }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-16 text-center w-full" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Cart
        </h1>
        
        <div className="w-full px-6 md:px-12 mx-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
              <p className="font-[var(--font-sans)] text-[#555] mb-8 text-lg">Your Cart is Empty</p>
              <Link to="/shop" className="bg-[#3a1f1d] text-white px-8 py-4 font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-black transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-[2rem] relative items-start mx-auto w-full">
              
              {/* Cart Table List */}
              <div className="flex flex-col gap-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center py-6 border-b border-[#dddddd]">
                    <div className="w-[80px] h-[106px] flex-shrink-0 bg-white border border-[#eaeaea]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-center gap-1">
                      <h3 className="font-bold text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm">{item.name}</h3>
                      <p className="text-[#3a1f1d]/70 font-[var(--font-sans)] text-sm">GH₵{item.price.toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.id)} className="text-xs text-[#888] underline text-left w-fit uppercase font-[var(--font-sans)] tracking-widest mt-2 hover:text-[#3a1f1d] transition-colors">Remove</button>
                    </div>
                    
                    <div className="flex items-center border border-[#dddddd] h-10 w-28">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex-1 flex items-center justify-center text-[#3a1f1d] hover:bg-[#eaeaea] h-full">-</button>
                      <span className="flex-1 text-center font-[var(--font-sans)] text-[#3a1f1d] text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 flex items-center justify-center text-[#3a1f1d] hover:bg-[#eaeaea] h-full">+</button>
                    </div>
                    
                    <div className="w-24 text-right font-[var(--font-sans)] text-[#3a1f1d] font-bold">
                      GH₵{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-[#FCFBFA] p-8 md:p-10 border border-[#3a1f1d]/5 sticky top-32">
                <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-bold mb-6 pb-4 border-b border-[#dddddd]">Order Summary</h2>
                
                <div className="flex flex-col gap-4 mb-6 font-[var(--font-sans)] text-sm text-[#555]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#3a1f1d]">GH₵{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-[#3a1f1d]">GH₵{delivery.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-[#dddddd] pt-6 mb-8 font-[var(--font-sans)] text-[#3a1f1d]">
                  <span className="uppercase tracking-widest text-sm font-bold">Total</span>
                  <span className="text-xl font-bold">GH₵{total.toFixed(2)}</span>
                </div>

                <Link to="/checkout" className="w-full bg-[#3b2416] text-white font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-[#4d311e] transition-all flex items-center justify-center cursor-pointer rounded" style={{ padding: '15px' }}>
                  Proceed to Checkout
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
