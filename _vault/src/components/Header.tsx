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
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-screen w-full md:w-[440px] bg-[#F9F8F6] z-[200] shadow-2xl flex flex-col text-[#3a1f1d] pointer-events-auto">
              {/* Cart Header */}
              <div className="flex justify-between items-center px-8 py-7 border-b border-[#3a1f1d]/10 shrink-0">
                <h2 className="text-[22px] font-normal tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Your Cart</h2>
                <span className="text-[11px] uppercase tracking-[0.2em] opacity-50 mr-auto ml-3 mt-1">{cart?.length || 0} {(cart?.length || 0) === 1 ? 'item' : 'items'}</span>
                <button onClick={() => setIsCartOpen(false)} className="text-[#3a1f1d]/40 hover:text-[#3a1f1d] transition-colors p-1 -mr-1"><X className="h-5 w-5" strokeWidth={1.2} /></button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                {!cart || cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#3a1f1d]/40 gap-5 pt-20">
                    <ShoppingBag className="h-14 w-14 opacity-20" strokeWidth={1} />
                    <p className="text-[12px] uppercase tracking-[0.2em]">Your cart is empty</p>
                    <button onClick={() => { setIsCartOpen(false); navigate('/shop'); }} className="text-[11px] uppercase tracking-[0.15em] border-b border-[#3a1f1d]/30 pb-0.5 hover:border-[#3a1f1d] transition-colors mt-2">Browse Collection</button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {cart.map((item, index) => (
                      <div key={item.id} className={`flex gap-5 py-6 ${index < cart.length - 1 ? 'border-b border-[#3a1f1d]/8' : ''}`}>
                        
                        {/* Product Image */}
                        <div className="w-[90px] h-[120px] shrink-0 bg-white border border-[#3a1f1d]/8 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          {/* Top: Name + Remove */}
                          <div>
                            <div className="flex justify-between items-start gap-3">
                              <h3 className="text-[15px] font-medium leading-snug text-[#3a1f1d] truncate" style={{ fontFamily: "'Jost', sans-serif" }}>{item.name}</h3>
                              <button onClick={() => removeFromCart(item.id)} className="text-[#3a1f1d]/30 hover:text-red-600 transition-colors shrink-0 mt-0.5">
                                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                              </button>
                            </div>
                            {item.size && <p className="text-[11px] opacity-40 text-[#3a1f1d] mt-1 uppercase tracking-[0.15em]">Size: {item.size}</p>}
                            <p className="text-[13px] mt-1.5 text-[#3a1f1d]/60">GH₵ {item.price.toFixed(2)}</p>
                          </div>
                          
                          {/* Bottom: Quantity + Line Total */}
                          <div className="flex justify-between items-center mt-5">
                            <div className="flex items-center border border-[#3a1f1d]/15 h-[36px] w-[108px] bg-white overflow-hidden">
                              <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="w-[36px] h-full flex items-center justify-center hover:bg-[#3a1f1d]/5 text-[15px] transition-colors text-[#3a1f1d]/70 select-none">−</button>
                              <span className="flex-1 text-center text-[13px] font-medium text-[#3a1f1d] border-x border-[#3a1f1d]/10">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-[36px] h-full flex items-center justify-center hover:bg-[#3a1f1d]/5 text-[15px] transition-colors text-[#3a1f1d]/70 select-none">+</button>
                            </div>
                            <span className="text-[15px] font-medium text-[#3a1f1d]">GH₵ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Cart Footer */}
              {cart && cart.length > 0 && (
                <div className="border-t border-[#3a1f1d]/10 px-8 py-7 bg-white shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
                  <div className="flex justify-between items-baseline mb-7">
                    <span className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-50 text-[#3a1f1d]">Subtotal</span>
                    <span className="text-[22px] font-normal text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      GH₵ {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3a1f1d]/40 mb-6 text-center">Shipping calculated at checkout</p>
                  
                  <div className="flex flex-col gap-3">
                    <Link 
                      to="/checkout" 
                      onClick={() => setIsCartOpen(false)}
                      className="flex items-center justify-center w-full uppercase tracking-[0.2em] text-[12px] font-medium transition-colors hover:bg-black h-[52px]"
                      style={{ backgroundColor: '#3a1f1d', color: '#ffffff' }}
                    >
                      Checkout
                    </Link>
                    <Link 
                      to="/cart" 
                      onClick={() => setIsCartOpen(false)}
                      className="flex items-center justify-center w-full border border-[#3a1f1d]/20 text-[#3a1f1d] uppercase tracking-[0.2em] text-[12px] font-medium hover:bg-[#3a1f1d]/5 transition-colors h-[48px]"
                    >
                      View Full Cart
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
