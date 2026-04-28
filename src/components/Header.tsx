import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Show, SignInButton, UserButton, useUser, useClerk } from '@clerk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useScroll } from './ui/use-scroll';
import { Grid, ShoppingBag, Calendar, User, LogOut, LogIn, ChevronRight, X, Search } from 'lucide-react';
import { Button } from './ui/button';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const scrolled = useScroll(10);
  const navigate = useNavigate();
  
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const subtotal = cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  
  // Clerk Hooks for the new Mobile Menu Profile
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (open || isCartOpen || isSearchOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isCartOpen, isSearchOpen]);

  const navLinks = [
    { label: 'Collections', href: '/collections', icon: <Grid className="h-5 w-5" /> },
    { label: 'Shop', href: '/shop', icon: <ShoppingBag className="h-5 w-5" /> },
    { label: 'Book Appointment', href: '/book-appointment', icon: <Calendar className="h-5 w-5" /> },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      {/* 1. DESKTOP WEBVIEW */}
      <div className={cn(
        "sticky top-0 z-[100] w-full transition-all duration-300 ease-in-out border-b",
        scrolled ? "bg-[#e5dfd3]/95 backdrop-blur-md shadow-md border-[#3a1f1d]/5" : "bg-[#F9F8F6] border-[#3a1f1d]/10 shadow-sm"
      )}>
        <header className="flex justify-center w-full relative">
          <div className="flex w-full pointer-events-auto">
            <nav className={cn(
              "flex w-full items-center justify-between shrink-0 px-6 md:px-16 lg:px-[70px] transition-all duration-300 ease-in-out",
              scrolled ? "h-16 md:h-16" : "h-24 md:h-32"
            )}>
              {/* LEFT: Logo */}
              <Link to="/" className="flex items-center gap-3 md:gap-4 z-10 shrink-0" onClick={() => setOpen(false)}>
                <img src="/logo.png" alt="Gabby Newluk" className={cn("object-contain transition-all duration-300 ease-in-out", scrolled ? "h-8 w-8 md:h-10 md:w-10" : "h-12 w-12 md:h-16 md:w-16")} />
                <div className="flex flex-col text-left mt-1 md:mt-2 justify-center">
                  <span className={cn("font-medium italic text-[#3a1f1d] leading-[0.8] transition-all duration-300 ease-in-out", scrolled ? "text-[18px] md:text-[22px]" : "text-[24px] md:text-[32px]")} style={{ fontFamily: "'Playfair Display', serif" }}>Gabby Newluk</span>
                  <span className={cn("uppercase opacity-60 text-[#3a1f1d] italic transition-all duration-300 ease-in-out", scrolled ? "tracking-[0.3em] text-[7px] md:text-[8px] mt-1" : "tracking-[0.4em] text-[8px] md:text-[10px] mt-2")} style={{ marginLeft: "2px" }}>RIGHT ABOVE IT</span>
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
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#3a1f1d] hover:opacity-60 transition-opacity p-1">
                  <Search className="h-5 w-5" />
                </button>
                <button onClick={() => setIsCartOpen(true)} className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">CART ({cartCount})</button>
                <div className="flex items-center scale-90 origin-right">
                  <Show when="signed-out"><SignInButton mode="modal"><button className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">LOGIN</button></SignInButton></Show>
                  <Show when="signed-in"><div className="flex items-center gap-6"><Link to="/profile" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d] hover:opacity-60 transition-opacity">PROFILE</Link><UserButton /></div></Show>
                </div>
              </div>

              {/* MOBILE CONTROLS */}
              <div className="flex lg:hidden items-center gap-6 z-10 shrink-0">
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#3a1f1d] hover:opacity-60 transition-opacity p-1">
                  <Search className="h-5 w-5" />
                </button>
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
          
          {/* 1.5 SEARCH OVERLAY */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full bg-[#F9F8F6] border-b border-[#3a1f1d]/10 p-6 z-[90] shadow-[0_10px_30px_rgba(58,31,29,0.05)] pointer-events-auto"
              >
                <form onSubmit={handleSearchSubmit} className="max-w-[800px] mx-auto flex items-center gap-4">
                  <Search className="h-5 w-5 text-[#3a1f1d]/50 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search for masterpieces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-[#3a1f1d] text-lg md:text-xl font-light placeholder:text-[#3a1f1d]/30"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                  <button type="button" onClick={() => setIsSearchOpen(false)} className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors p-2 shrink-0">
                    <X className="h-5 w-5" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
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
                    <Button asChild variant="ghost" className="group flex items-center justify-start rounded-md px-3 py-6 w-full text-sm font-medium text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d]/5">
                      <Link to={item.href} onClick={() => setOpen(false)}>
                        <span className="mr-4 opacity-70">{item.icon}</span>
                        <span className="uppercase tracking-[0.15em] text-[12px]">{item.label}</span>
                        <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </Button>
                  </motion.div>
                ))}

                {/* Profile Link (Only visible if signed in) */}
                {isSignedIn && (
                  <>
                    <motion.div variants={itemVariants} className="my-4 border-t border-[#3a1f1d]/10" />
                    <motion.div variants={itemVariants}>
                      <Button asChild variant="ghost" className="group flex items-center justify-start rounded-md px-3 py-6 w-full text-sm font-medium text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d]/5">
                        <Link to="/profile" onClick={() => setOpen(false)}>
                          <span className="mr-4 opacity-70"><User className="h-5 w-5" /></span>
                          <span className="uppercase tracking-[0.15em] text-[12px]">My Atelier Profile</span>
                          <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      </Button>
                    </motion.div>
                  </>
                )}
              </nav>

              {/* Bottom Auth Button */}
              <motion.div variants={itemVariants} className="mt-6 border-t border-[#3a1f1d]/10 pt-6">
                {isSignedIn ? (
                  <Button variant="ghost" onClick={() => { signOut(); setOpen(false); }} className="flex w-full items-center justify-start rounded-md px-3 py-6 text-[12px] font-medium text-red-700 transition-colors hover:bg-red-50 uppercase tracking-[0.15em]">
                    <LogOut className="mr-4 h-5 w-5 opacity-70" /> Log out
                  </Button>
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="flex w-full items-center justify-start rounded-md px-3 py-6 text-[12px] font-medium text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d]/5 uppercase tracking-[0.15em]">
                      <LogIn className="mr-4 h-5 w-5 opacity-70" /> Sign Up / Log In
                    </Button>
                  </SignInButton>
                )}
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. LUXURY SLIDE-OUT CART */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 z-[150] pointer-events-auto" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-screen w-full md:w-[420px] bg-[#F9F8F6] z-[200] shadow-2xl flex flex-col text-[#3a1f1d] pointer-events-auto">
              {/* Cart Content */}
              <div className="flex justify-between items-center p-6 border-b border-[#3a1f1d]/10 shrink-0">
                <h2 className="text-2xl font-normal" style={{ fontFamily: "'Playfair Display', serif" }}>Cart <span className="text-[13px] opacity-60 font-sans not-italic tracking-normal">({cart?.length || 0} items)</span></h2>
                <button onClick={() => setIsCartOpen(false)} className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors p-2"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                {!cart || cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#3a1f1d]/50 gap-4 mt-20">
                    <ShoppingBag className="h-12 w-12 opacity-20" />
                    <p className="text-sm uppercase tracking-widest">Your cart is empty.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {/* STRICT SPACING APPLIED HERE */}
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-8 border-b border-[#3a1f1d]/10 last:border-0 last:pb-0">
                        
                        <div className="w-[85px] h-[115px] shrink-0 bg-[#F9F8F6] border border-[#3a1f1d]/10 rounded-md overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h3 className="text-[13px] font-medium leading-snug text-[#3a1f1d]">{item.name}</h3>
                              <p className="text-[12px] opacity-50 text-[#3a1f1d] mt-0.5 uppercase tracking-wider">{item.size && `Size: ${item.size}`}</p>
                              <p className="text-[13px] mt-1 opacity-70 text-[#3a1f1d]">GH₵ {item.price.toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-[#3a1f1d]/40 hover:text-red-700 transition-colors shrink-0">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-end mt-4">
                            <div className="flex items-center border border-[#3a1f1d]/20 rounded-md h-8 w-24 bg-white shadow-sm overflow-hidden">
                              <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="flex-1 h-full text-center hover:bg-[#3a1f1d]/5 text-sm transition-colors text-[#3a1f1d]">−</button>
                              <span className="flex-1 text-center text-[13px] font-medium text-[#3a1f1d]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 h-full text-center hover:bg-[#3a1f1d]/5 text-sm transition-colors text-[#3a1f1d]">+</button>
                            </div>
                            <span className="text-[14px] font-medium text-[#3a1f1d]">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {cart && cart.length > 0 && (
                <div className="border-t border-[#3a1f1d]/10 p-6 md:p-8 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-[13px] uppercase tracking-widest font-medium opacity-70 text-[#3a1f1d]">Subtotal</span>
                    <span className="text-2xl font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      GH₵ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* BUTTONS WITH EXPLICIT TEXT COLORS AND INLINE OVERRIDES */}
                  <div className="flex flex-col mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Link 
                      to="/checkout" 
                      onClick={() => setIsCartOpen(false)}
                      className="flex items-center justify-center w-full rounded-md uppercase tracking-[0.2em] text-[12px] font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: '#3a1f1d', color: '#ffffff', padding: '1rem 0' }}
                    >
                      Checkout
                    </Link>
                    <Link 
                      to="/cart" 
                      onClick={() => setIsCartOpen(false)}
                      className="flex items-center justify-center w-full bg-white border border-[#3a1f1d]/20 text-[#3a1f1d] py-4 rounded-md uppercase tracking-[0.2em] text-[12px] font-medium hover:bg-[#F9F8F6] transition-colors"
                      style={{ color: '#3a1f1d', padding: '1rem 0' }}
                    >
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
