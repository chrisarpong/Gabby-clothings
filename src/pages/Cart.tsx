import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();

  // Manual calculation to ensure no crashes
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 50.00 : 0;
  const total = subtotal + delivery;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full flex flex-col items-center pt-64 pb-32 bg-[#F5F5F3] min-h-screen text-[#3a1f1d]"
    >
      <div className="max-w-7xl w-full px-10 flex flex-col items-center">
        {/* Absolute Centered Header */}
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-8xl italic" style={{ fontFamily: "'Playfair Display', serif" }}>
            The Selection
          </h1>
          <div className="mt-10 h-px w-32 bg-[#3a1f1d]/20 mx-auto" />
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 border-t border-[#3a1f1d]/10 w-full">
            <p className="opacity-50 mb-10 tracking-[0.4em] uppercase text-[10px] font-bold">Your Bag is Empty</p>
            <Link to="/shop" className="px-16 py-5 border border-[#3a1f1d] uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-[#3a1f1d] hover:text-white transition-all">
              Return to Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-24 w-full items-start">

            {/* Left: Product List */}
            <div className="space-y-12">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-10 py-12 border-b border-[#3a1f1d]/10 first:border-t items-center justify-center">
                  <div className="w-40 h-56 shrink-0 shadow-2xl">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-56 py-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold uppercase tracking-[0.2em] text-sm">{item.name}</h3>
                      <p className="font-bold text-lg">GH₵ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center border border-[#3a1f1d]/20 h-12 w-32 bg-white">
                        <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="flex-1 text-xl">-</button>
                        <span className="flex-1 text-center font-bold text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 text-xl">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] uppercase tracking-widest opacity-40 underline">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Summary Card */}
            <div className="bg-white p-12 shadow-2xl border border-[#3a1f1d]/5 sticky top-60">
              <h2 className="uppercase tracking-[0.4em] text-[10px] font-bold mb-12 text-center opacity-40">Summary</h2>
              <div className="space-y-6 mb-12 border-b border-[#3a1f1d]/10 pb-10">
                <div className="flex justify-between text-xs uppercase tracking-widest opacity-60"><span>Subtotal</span><span>GH₵ {subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs uppercase tracking-widest opacity-60"><span>Delivery</span><span>GH₵ {delivery.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between items-end mb-12">
                <span className="font-bold text-xs uppercase tracking-[0.3em]">Total</span>
                <span className="text-4xl italic" style={{ fontFamily: "'Playfair Display', serif" }}>GH₵ {total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="block w-full bg-[#3a1f1d] text-[#F5F5F3] text-center py-7 uppercase text-[11px] font-bold tracking-[0.4em] hover:bg-black transition-all">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;