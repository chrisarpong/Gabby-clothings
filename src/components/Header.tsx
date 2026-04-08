import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Show, SignInButton, UserButton, useUser, useClerk } from '@clerk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useScroll } from './ui/use-scroll';
import { Grid, ShoppingBag, Calendar, User, LogOut, LogIn, ChevronRight } from 'lucide-react';

// --- NEW Sidebar Animation Variants ---
const sidebarVariants: any = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.08 } },
  exit: { x: '-100%', opacity: 0, transition: { type: 'spring', stiffness: 400, damping: 40 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const scrolled = useScroll(10);
  
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  
  // Clerk Hooks for the new Mobile Menu Profile
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (open || isCartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isCartOpen]);

  const navLinks = [
    { label: 'Collections', href: '/collections', icon: <Grid className="h-5 w-5" /> },
    { label: 'Shop', href: '/shop', icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Book Appointment', href: '/book-appointment', icon: <Calendar className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* 1. DESKTOP WEBVIEW (Remains perfectly intact and separated from mobile logic) */}
      <div className="sticky top-0 z-[100] w-full pointer-events-none">
        <header className={cn('flex justify-center w-full transition-all duration-500 ease-out', scrolled ? 'pt-4 md:pt-8 px-4' : 'pt-0 px-0')}>
          <div
            className={cn(
              'pointer-events-auto transition-all duration-500 ease-out flex relative w-full',
              scrolled
                ? 'max-w-[1000px] rounded-[2.5rem] bg-[#F9F8F6]/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)]'
                : 'max-w-full bg-[#F9F8F6] border-b border-[#3a1f1d]/10 rounded-none'
            )}
          >
            <nav className={cn('flex w-full items-center justify-between shrink-0 transition-all duration-500 ease-out', scrolled ? 'h-20 md:h-24 px-8 md:px-10' : 'h-20 md:h-28 px-6 md:px-12')}>
              {/* LEFT: Logo */}
              <Link to="/" className="flex items-center gap-3 md:gap-4 z-10 shrink-0" onClick={() => setOpen(false)}>
                <img src="/logo.png" alt="Gabby Newluk" className="h-12 w-12 md:h-14 md:w-14 object-contain" />
                <div className="flex flex-col text-left mt-1 md:mt-2">
                  <span className="text-[24px] md:text-[28px] font-medium italic text-[#3a1f1d] leading-[0.8]" style={{ fontFamily: "'Playfair Display', serif" }}>Gabby Newluk</span>
                  <span className="text-[8px] md:text-[9px] uppercase tracking-[0.4em] opacity-60 text-[#3a1f1d] mt-2 ml-[2px] italic">RIGHT ABOVE IT</span>
                </div>
              </Link>  

              {/* CENTER: Desktop Links */}
              <div className="hidden lg:flex items-center gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {navLinks.map((link) => (
                  <Link key={link.label} to={link.href} className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">{link.label}</Link>
                ))}
              </div>

              {/* RIGHT: Cart & Auth (Desktop) */}
              <div className="hidden lg:flex items-center gap-8 z-10 shrink-0">
                <button onClick={() => setIsCartOpen(true)} className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">CART ({cartCount})</button>
                <div className="flex items-center scale-90 origin-right">
                  <Show when="signed-out"><SignInButton mode="modal"><button className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">LOGIN</button></SignInButton></Show>
                  <Show when="signed-in"><div className="flex items-center gap-6"><Link to="/profile" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">PROFILE</Link><UserButton /></div></Show>
                </div>
              </div>

              {/* MOBILE CONTROLS */}
              <div className="flex lg:hidden items-center gap-6 z-10 shrink-0">
                <button onClick={() => setIsCartOpen(true)} className="text-[11px] uppercase tracking-widest font-medium text-[#3a1f1d] mt-1">CART ({cartCount})</button>
                <motion.button initial={false} animate={open ? "open" : "closed"} onClick={() => setOpen(!open)} className="p-3 -mr-3 text-[#3a1f1d] relative z-[300] outline-none flex items-center justify-center cursor-pointer">
                  <svg width="22" height="22" viewBox="0 0 23 23">
                    <motion.path fill="transparent" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" variants={{ closed: { d: "M 2 2.5 L 20 2.5" }, open: { d: "M 3 16.5 L 17 2.5" } }} />
                    <motion.path fill="transparent" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" d="M 2 9.423 L 20 9.423" variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }} transition={{ duration: 0.1 }} />
                    <motion.path fill="transparent" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" variants={{ closed: { d: "M 2 16.346 L 20 16.346" }, open: { d: "M 3 2.5 L 17 16.346" } }} />
                  </svg>
                </motion.button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* 2. THE NEW MOBILE SIDEBAR MENU */}
      <AnimatePresence>
        {open && (
          <>
            {/* Dark Overlay Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-black/60 z-[150] lg:hidden pointer-events-auto" />
            
            {/* The Staggered Sidebar */}
            <motion.aside
              initial="hidden" animate="visible" exit="exit" variants={sidebarVariants}
              className="fixed top-0 left-0 h-screen w-[85%] max-w-sm bg-[#F9F8F6] z-[200] lg:hidden flex flex-col p-6 shadow-2xl overflow-y-auto pointer-events-auto"
            >
              {/* User Info Header (Wired to Clerk) */}
              {isSignedIn ? (
                <motion.div variants={itemVariants} className="flex items-center space-x-4 mt-4 mb-6 p-2">
                  <img src={user.imageUrl} alt="Avatar" className="h-12 w-12 rounded-full object-cover border border-[#3a1f1d]/10" />
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-lg text-[#3a1f1d]">{user.fullName}</span>
                    <span className="text-[11px] opacity-60 truncate">{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="flex items-center space-x-4 mt-4 mb-6 p-2">
                  <div className="h-12 w-12 rounded-full bg-[#3a1f1d]/10 flex items-center justify-center text-[#3a1f1d]"><User className="h-6 w-6" /></div>
                  <div className="flex flex-col truncate">
                    <span className="font-medium text-lg text-[#3a1f1d]">Guest Account</span>
                    <span className="text-[11px] opacity-60 truncate">Sign in to save measurements</span>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mb-6 border-t border-[#3a1f1d]/10" />

              {/* Staggered Navigation Links */}
              <nav className="flex-1 space-y-2">
                {navLinks.map((item) => (
                  <motion.div key={item.label} variants={itemVariants}>
                    <Link to={item.href} onClick={() => setOpen(false)} className="group flex items-center rounded-md px-3 py-3 text-sm font-medium text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d]/5">
                      <span className="mr-4 opacity-70">{item.icon}</span>
                      <span className="uppercase tracking-[0.15em] text-[12px]">{item.label}</span>
                      <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                ))}

                {/* Profile Link (Only visible if signed in) */}
                {isSignedIn && (
                  <>
                    <motion.div variants={itemVariants} className="my-4 border-t border-[#3a1f1d]/10" />
                    <motion.div variants={itemVariants}>
                      <Link to="/profile" onClick={() => setOpen(false)} className="group flex items-center rounded-md px-3 py-3 text-sm font-medium text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d]/5">
                        <span className="mr-4 opacity-70"><User className="h-5 w-5" /></span>
                        <span className="uppercase tracking-[0.15em] text-[12px]">My Atelier Profile</span>
                        <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </motion.div>
                  </>
                )}
              </nav>

              {/* Bottom Auth Button */}
              <motion.div variants={itemVariants} className="mt-6 border-t border-[#3a1f1d]/10 pt-6">
                {isSignedIn ? (
                  <button onClick={() => { signOut(); setOpen(false); }} className="flex w-full items-center rounded-md px-3 py-3 text-[12px] font-medium text-red-700 transition-colors hover:bg-red-50 uppercase tracking-[0.15em]">
                    <LogOut className="mr-4 h-5 w-5 opacity-70" /> Log out
                  </button>
                ) : (
                  <SignInButton mode="modal">
                    <button onClick={() => setOpen(false)} className="flex w-full items-center rounded-md px-3 py-3 text-[12px] font-medium text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d]/5 uppercase tracking-[0.15em]">
                      <LogIn className="mr-4 h-5 w-5 opacity-70" /> Sign Up / Log In
                    </button>
                  </SignInButton>
                )}
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. LUXURY SLIDE-OUT CART (Remains exactly the same) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 z-[150] pointer-events-auto" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-screen w-full md:w-[420px] bg-[#F9F8F6] z-[200] shadow-2xl flex flex-col text-[#3a1f1d] pointer-events-auto">
              {/* Cart Content (Unchanged) */}
              <div className="flex justify-between items-center p-6 border-b border-[#3a1f1d]/10 shrink-0">
                <h2 className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', serif" }}>Cart <span className="text-[13px] opacity-60 font-sans not-italic tracking-normal">({cart?.length || 0} items)</span></h2>
                <button onClick={() => setIsCartOpen(false)} className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors p-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {!cart || cart.length === 0 ? <p className="text-center opacity-50 text-sm mt-10">Your cart is empty.</p> : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-5 pb-6 border-b border-[#3a1f1d]/10 last:border-0">
                        <div className="w-[85px] h-[115px] shrink-0 bg-[#EFEFEF] border border-[#3a1f1d]/5"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-2">
                            <div><h3 className="text-[13px] font-medium leading-snug">{item.name}</h3><p className="text-[13px] mt-1 opacity-70">GH₵ {item.price.toFixed(2)}</p></div>
                            <button onClick={() => removeFromCart(item.id)} className="text-[#3a1f1d]/40 hover:text-red-700 transition-colors shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex items-center border border-[#3a1f1d]/20 h-8 w-20">
                              <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="flex-1 text-center hover:bg-[#3a1f1d]/5 text-sm leading-none select-none">−</button><span className="flex-1 text-center text-[13px] select-none">{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 text-center hover:bg-[#3a1f1d]/5 text-sm leading-none select-none">+</button>
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
                  <div className="flex justify-between items-end mb-6"><span className="text-[15px]">Subtotal</span><span className="text-xl font-normal">GH₵ {subtotal.toFixed(2)}</span></div>
                  <div className="space-y-3">
                    <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full bg-[#3a1f1d] text-white text-center py-4 text-[14px] hover:bg-black transition-colors">Checkout</Link>
                    <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full border border-[#3a1f1d] bg-transparent text-[#3a1f1d] text-center py-4 text-[14px] hover:bg-[#3a1f1d] hover:text-white transition-colors">View Cart</Link>
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
