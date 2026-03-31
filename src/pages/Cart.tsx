import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 50.00 : 0;
  const total = subtotal + delivery;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full flex flex-col items-center pt-40 pb-24 bg-[#F5F5F3] min-h-screen"
    >
      <div className="max-w-6xl w-full px-6">
        <h1 
          className="text-center w-full mb-20 text-5xl italic text-[#3a1f1d]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your Cart
        </h1>
        
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] w-full border-t border-[#3a1f1d]/10 pt-16">
            <p className="font-[var(--font-sans)] text-[#3a1f1d]/60 mb-8 tracking-widest uppercase text-sm">Your Cart is Empty</p>
            <Link 
              to="/shop" 
              className="px-10 py-4 bg-[#3a1f1d] text-white font-[var(--font-sans)] uppercase tracking-[0.2em] text-xs hover:bg-[#20100f] transition-colors duration-300"
            >
              Discover Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-20 mx-auto items-start justify-center">
            
            {/* Cart Table List */}
            <div className="w-full flex flex-col border-t border-[#3a1f1d]/10">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-stretch py-10 border-b border-[#3a1f1d]/10 gap-8">
                  
                  {/* Item Image */}
                  <Link to={`/product/${item.id}`} className="w-[120px] shrink-0 aspect-[3/4] bg-white relative group overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-[600ms] group-hover:scale-105" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=600&auto=format&fit=crop';
                      }}
                    />
                  </Link>

                  {/* Details Block */}
                  <div className="flex flex-col justify-between grow h-full">
                    <div className="flex justify-between items-start w-full gap-4">
                      <div className="flex flex-col gap-2">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-semibold text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm hover:opacity-70 transition-opacity">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-[#3a1f1d] font-[var(--font-sans)] text-sm tracking-wider">
                          GH₵ {item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Line Item Total (Desktop) */}
                      <span className="hidden sm:block text-[#3a1f1d] font-bold font-[var(--font-sans)] tracking-wider">
                        GH₵ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-end justify-between w-full mt-6">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#3a1f1d]/20 h-[40px] w-[120px]">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} 
                          className="flex-1 flex items-center justify-center text-[#3a1f1d] hover:bg-[#3a1f1d]/5 h-full transition-colors"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-[var(--font-sans)] text-[#3a1f1d] text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className="flex-1 flex items-center justify-center text-[#3a1f1d] hover:bg-[#3a1f1d]/5 h-full transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-[11px] text-[#3a1f1d]/50 hover:text-[#3a1f1d] uppercase font-[var(--font-sans)] tracking-[0.15em] transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-[#3a1f1d] hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-bottom-right hover:after:origin-bottom-left"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Line Item Total (Mobile fallback) */}
                    <span className="sm:hidden block text-[#3a1f1d] font-bold font-[var(--font-sans)] tracking-wider mt-4">
                      Total: GH₵ {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="w-full bg-transparent border border-[#3a1f1d]/10 p-8 lg:p-10 sticky top-[120px]">
              <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-bold mb-8 text-center sm:text-left">
                Order Summary
              </h2>
              
              <div className="flex flex-col gap-5 mb-8 font-[var(--font-sans)] text-sm border-b border-[#3a1f1d]/10 pb-8">
                <div className="flex justify-between items-center text-[#3a1f1d]/80">
                  <span className="tracking-wider">Subtotal</span>
                  <span className="font-medium text-[#3a1f1d]">GH₵ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[#3a1f1d]/80">
                  <span className="tracking-wider">Delivery</span>
                  <span className="font-medium text-[#3a1f1d]">GH₵ {delivery.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10 text-[#3a1f1d]">
                <span className="uppercase tracking-widest text-sm font-bold">Total</span>
                <span className="text-2xl font-[var(--font-serif)] italic">GH₵ {total.toFixed(2)}</span>
              </div>

              <Link 
                to="/checkout" 
                className="block w-full bg-[#3a1f1d] text-[#F5F5F3] py-6 text-center uppercase tracking-[0.3em] font-bold hover:bg-black transition-all"
              >
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
