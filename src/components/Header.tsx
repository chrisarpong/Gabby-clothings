import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Show, SignInButton, UserButton } from '@clerk/react';
import { motion, AnimatePresence } from 'framer-motion';
import brandLogo from '../assets/logo.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  return (
    <>
      <header className="sticky top-0 left-0 w-full z-[100] bg-[#F9F8F6] border-b border-[#3a1f1d]/10 px-8 md:px-16 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex md:flex-1 justify-start">
          <Link to="/" className="flex flex-col items-center hover:opacity-70 transition-opacity">
            <img src={brandLogo} alt="Gabby Newluk" style={{ height: '40px', width: 'auto', maxWidth: '150px', objectFit: 'contain' }} />
            <div className="flex flex-col items-center leading-[1.1] mt-1 text-[#3a1f1d]">
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: '500', fontSize: '1.2rem' }}>Gabby Newluk</span>
              <span className="opacity-70" style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.55rem', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 400, marginTop: '2px' }}>Right Above it</span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex justify-center items-center gap-10">
          <Link to="/collections" className="text-xs uppercase tracking-widest font-medium text-[#3a1f1d] hover:opacity-50 transition-opacity" style={{ fontFamily: "'Jost', sans-serif" }}>Collections</Link>
          <Link to="/shop" className="text-xs uppercase tracking-widest font-medium text-[#3a1f1d] hover:opacity-50 transition-opacity" style={{ fontFamily: "'Jost', sans-serif" }}>Shop</Link>
          <Link to="/book-appointment" className="text-xs uppercase tracking-widest font-medium text-[#3a1f1d] hover:opacity-50 transition-opacity" style={{ fontFamily: "'Jost', sans-serif" }}>Book Appointment</Link>
        </nav>

        <div className="hidden md:flex flex-row gap-8 items-center justify-end md:flex-1 text-[#3a1f1d]">
          <button onClick={() => setIsCartOpen(true)} className="text-xs uppercase tracking-widest font-medium hover:opacity-50 transition-opacity" style={{ fontFamily: "'Jost', sans-serif" }}>
            Cart ({cartCount})
          </button>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-xs uppercase tracking-widest font-medium flex items-center gap-2 hover:opacity-50 transition-opacity" style={{ fontFamily: "'Jost', sans-serif" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                Account
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        <div className="flex md:hidden flex-row gap-6 items-center text-[#3a1f1d]">
          <button onClick={() => setIsCartOpen(true)} className="text-xs uppercase tracking-widest font-medium hover:opacity-50">Cart ({cartCount})</button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="outline-none hover:opacity-50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#F9F8F6] text-[#3a1f1d] flex flex-col items-center py-10 gap-8 shadow-2xl border-t border-[#3a1f1d]/10 md:hidden z-50">
            <Link to="/collections" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Collections</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Shop</Link>
            <Link to="/book-appointment" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Book Appointment</Link>
            <Show when="signed-out"><SignInButton mode="modal"><button onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Sign Up / Log In</button></SignInButton></Show>
            <Show when="signed-in"><UserButton /></Show>
          </div>
        )}
      </header>

      {/* PREMIUM SLIDE-OUT CART */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 z-[150]" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 right-0 h-screen w-full md:w-[420px] bg-[#F9F8F6] z-[200] shadow-2xl flex flex-col text-[#3a1f1d]">
              
              <div className="flex justify-between items-center p-6 border-b border-[#3a1f1d]/10 shrink-0">
                <h2 className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Cart <span className="text-[13px] opacity-60 font-sans not-italic tracking-normal">({cart?.length || 0} items)</span>
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors p-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {!cart || cart.length === 0 ? (
                  <p className="text-center opacity-50 text-sm mt-10">Your cart is empty.</p>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-5 pb-6 border-b border-[#3a1f1d]/10 last:border-0">
                        <div className="w-[85px] h-[115px] shrink-0 bg-[#EFEFEF] border border-[#3a1f1d]/5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="text-[13px] font-medium leading-snug">{item.name}</h3>
                              <p className="text-[13px] mt-1 opacity-70">GH₵ {item.price.toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-[#3a1f1d]/40 hover:text-red-700 transition-colors shrink-0">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                            </button>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex items-center border border-[#3a1f1d]/20 h-8 w-20">
                              <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="flex-1 text-center hover:bg-[#3a1f1d]/5 text-sm leading-none select-none">−</button>
                              <span className="flex-1 text-center text-[13px] select-none">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 text-center hover:bg-[#3a1f1d]/5 text-sm leading-none select-none">+</button>
                            </div>
                            <span className="text-[14px] font-medium">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart && cart.length > 0 && (
                <div className="border-t border-[#3a1f1d]/10 p-6 bg-[#F9F8F6] shrink-0">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-[15px]">Subtotal</span>
                    <span className="text-xl font-normal">GH₵ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="space-y-3">
                    <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full bg-[#3a1f1d] text-white text-center py-4 text-[14px] hover:bg-black transition-colors">
                      Checkout
                    </Link>
                    <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full border border-[#3a1f1d] bg-transparent text-[#3a1f1d] text-center py-4 text-[14px] hover:bg-[#3a1f1d] hover:text-white transition-colors">
                      View Cart
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
