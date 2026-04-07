import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Show, SignInButton, UserButton } from '@clerk/react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#F9F8F6] border-b border-[#3a1f1d]/10 px-8 md:px-16">
        <div className="max-w-[1400px] mx-auto w-full h-20 md:h-24 flex items-center justify-between relative">
          
          {/* LEFT SECTION: Logo on Left, Text on Right, Pushed inward from the edge */}
          <Link to="/" className="flex items-center gap-3 z-10 shrink-0 pl-2 md:pl-6">
            {/* Logo image restored to the LEFT side */}
            <img src="/logo.png" alt="Gabby Newluk" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
            
            {/* Brand text on the RIGHT side of the logo */}
            <div className="flex flex-col text-left">
              <span
                className="text-xl md:text-2xl font-normal text-[#3a1f1d] leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Gabby Newluk
              </span>
              <span className="text-[8px] md:text-[9px] uppercase tracking-[0.35em] opacity-70 text-[#3a1f1d] mt-1 md:mt-1.5">
                RIGHT ABOVE IT
              </span>
            </div>
          </Link>

          {/* CENTER SECTION: Navigation (Absolutely centered) */}
          <nav className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link to="/collections" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">
              COLLECTIONS
            </Link>
            <Link to="/shop" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">
              SHOP
            </Link>
            <Link to="/book-appointment" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">
              BOOK APPOINTMENT
            </Link>
          </nav>

          {/* RIGHT SECTION: Cart & Auth (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 z-10 shrink-0 mr-2 md:mr-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity"
            >
              CART ({cartCount})
            </button>
            <div className="flex items-center scale-90 origin-right">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">
                    LOGIN
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </div>

          {/* MOBILE CONTROLS (Cart & Hamburger) */}
          <div className="flex lg:hidden items-center gap-5 z-10">
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[10px] uppercase tracking-widest font-medium text-[#3a1f1d]"
            >
              CART ({cartCount})
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#3a1f1d]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#F9F8F6] text-[#3a1f1d] flex flex-col items-center py-10 gap-8 shadow-2xl border-t border-[#3a1f1d]/10 lg:hidden z-40">
            <Link to="/collections" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Collections</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Shop</Link>
            <Link to="/book-appointment" onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Book Appointment</Link>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button onClick={() => setIsMenuOpen(false)} className="uppercase tracking-[0.2em] text-xs font-bold hover:opacity-50">Sign Up / Log In</button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
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