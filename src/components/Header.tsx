import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Show, SignInButton, UserButton } from '@clerk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useScroll } from './ui/use-scroll';

// --- Framer Motion Physics ---
const sidebarVariants = {
  open: {
    clipPath: `circle(2500px at calc(100% - 40px) 40px)`,
    transition: { type: "spring", stiffness: 20, restDelta: 2 }
  },
  closed: {
    clipPath: "circle(0px at calc(100% - 40px) 40px)",
    transition: { delay: 0.2, type: "spring", stiffness: 400, damping: 40 }
  }
};

const navVariants = {
  open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const itemVariants = {
  open: { y: 0, opacity: 1, transition: { y: { stiffness: 1000, velocity: -100 } } },
  closed: { y: 50, opacity: 0, transition: { y: { stiffness: 1000 } } }
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrolled = useScroll(10);
  
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  useEffect(() => {
    if (open || isCartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isCartOpen]);

  const navLinks = [
    { label: 'Collections', href: '/collections' },
    { label: 'Shop', href: '/shop' },
    { label: 'Book Appointment', href: '/book-appointment' },
  ];

  return (
    <>
      {/* LAYER 1: THE HANGING PILL (z-[100] - Always on top) */}
      <div className="sticky top-0 z-[100] w-full pointer-events-none">
        <header
          className={cn(
            'flex justify-center w-full transition-all duration-500 ease-out',
            scrolled ? 'pt-6 md:pt-8 px-4' : 'pt-0 px-0'
          )}
        >
          <div
            className={cn(
              'pointer-events-auto transition-all duration-500 ease-out flex relative w-full',
              scrolled
                ? 'max-w-[1000px] rounded-[2.5rem] bg-[#F9F8F6]/85 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                : 'max-w-full bg-[#F9F8F6] border-b border-[#3a1f1d]/10 rounded-none'
            )}
          >
            <nav
              className={cn(
                'flex w-full items-center justify-between transition-all duration-500 ease-out relative z-[100]',
                scrolled ? 'h-20 md:h-24 px-8 md:px-10' : 'h-20 md:h-28 px-6 md:px-12'
              )}
            >
              {/* LEFT: Logo */}
              <Link to="/" className="flex items-center gap-3 md:gap-4 z-10 shrink-0" onClick={() => setOpen(false)}>
                <img src="/logo.png" alt="Gabby Newluk" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
                <div className="flex flex-col text-left mt-1 md:mt-2">
                  <span className="text-[24px] md:text-[28px] font-medium italic text-[#3a1f1d] leading-[0.8]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Gabby Newluk
                  </span>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] opacity-60 text-[#3a1f1d] mt-2 ml-[2px] italic">
                    RIGHT ABOVE IT
                  </span>
                </div>
              </Link>  

              {/* CENTER: Desktop Links */}
              <div className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.href} className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* RIGHT: Cart & Auth */}
              <div className="hidden lg:flex items-center gap-8 z-10 shrink-0">
                <button onClick={() => setIsCartOpen(true)} className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">
                  CART ({cartCount})
                </button>
                <div className="flex items-center scale-90 origin-right">
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <button className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">LOGIN</button>
                    </SignInButton>
                  </Show>
                  <Show when="signed-in">
                    <div className="flex items-center gap-6">
                      <Link to="/profile" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">PROFILE</Link>
                      <UserButton />
                    </div>
                  </Show>
                </div>
              </div>

              {/* MOBILE CONTROLS & NEW MORPHING ICON */}
              <div className="flex lg:hidden items-center gap-6 z-[100]">
                <button onClick={() => setIsCartOpen(true)} className="text-[10px] uppercase tracking-widest font-medium text-[#3a1f1d]">
                  CART ({cartCount})
                </button>
                
                {/* The Morphing Menu Toggle */}
                <motion.button initial={false} animate={open ? "open" : "closed"} onClick={() => setOpen(!open)} className="p-2 -mr-2 text-[#3a1f1d] relative z-[100] outline-none flex items-center justify-center cursor-pointer">
                  <svg width="23" height="23" viewBox="0 0 23 23">
                    <motion.path fill="transparent" strokeWidth="2" stroke="currentColor" strokeLinecap="round" variants={{ closed: { d: "M 2 2.5 L 20 2.5" }, open: { d: "M 3 16.5 L 17 2.5" } }} />
                    <motion.path fill="transparent" strokeWidth="2" stroke="currentColor" strokeLinecap="round" d="M 2 9.423 L 20 9.423" variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }} transition={{ duration: 0.1 }} />
                    <motion.path fill="transparent" strokeWidth="2" stroke="currentColor" strokeLinecap="round" variants={{ closed: { d: "M 2 16.346 L 20 16.346" }, open: { d: "M 3 2.5 L 17 16.346" } }} />
                  </svg>
                </motion.button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* LAYER 2: THE MOBILE MENU OVERLAY (z-[90] - Slides below the hanging pill) */}
      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={sidebarVariants}
        className={cn(
          'bg-[#F9F8F6] fixed inset-0 z-[90] flex flex-col overflow-y-auto lg:hidden pt-40 px-6 pb-12', // pt-40 explicitly forces the links far below the logo
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <motion.ul variants={navVariants} className="flex flex-col w-full h-full mt-8 justify-start">
          {navLinks.map((link) => (
            <motion.li key={link.label} variants={itemVariants} className="border-b border-[#3a1f1d]/10 first:border-t">
              <Link to={link.href} onClick={() => setOpen(false)} className="block w-full text-center py-7 text-[16px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] hover:opacity-50 transition-opacity">
                {link.label}
              </Link>
            </motion.li>
          ))}
          
          <motion.li variants={itemVariants} className="w-full flex justify-center items-center py-8 border-b border-[#3a1f1d]/10">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button onClick={() => setOpen(false)} className="text-[15px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] hover:opacity-50 transition-opacity">
                  Sign Up / Log In
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <div className="flex flex-col items-center gap-5">
                <UserButton />
                <Link to="/profile" onClick={() => setOpen(false)} className="text-[14px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] hover:opacity-50 transition-opacity">My Profile</Link>
              </div>
            </Show>
          </motion.li>
        </motion.ul>
      </motion.div>

      {/* LAYER 3: LUXURY SLIDE-OUT CART */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 z-[150] pointer-events-auto" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-screen w-full md:w-[420px] bg-[#F9F8F6] z-[200] shadow-2xl flex flex-col text-[#3a1f1d] pointer-events-auto">
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
