import { Search, User, ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { useCartStore } from "../store/cartStore";
import logo from "../assets/logo_transparent.png";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { items } = useCartStore();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Slide up if scrolling down, slide down if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Shop", path: "/shop" },
    { name: "Collections", path: "/collections" },
    { name: "Custom Tailoring", path: "/custom-tailoring" },
    { name: "Our Story", path: "/story" },
    { name: "Contact", path: "/contact" },
    { name: "Book Appointment", path: "/book" },
  ];

  return (
    <>
      <header className={`sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-md border-b border-surface-variant transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-[1536px] mx-auto px-5 md:px-10 lg:px-20 h-20 md:h-24 flex items-center justify-between">
          
          {/* Left: Menu & Search */}
          <div className="flex items-center gap-6 w-1/3 text-primary">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 hover:text-surface-tint transition-colors group"
            >
              <MenuIcon className="w-5 h-5" strokeWidth={1.5} />
              <span className="hidden md:block font-label text-[11px] tracking-[0.2em] uppercase mt-[2px] group-hover:text-surface-tint">Menu</span>
            </button>

          </div>

          {/* Center: Logo */}
          <div className="flex-1 md:flex-none flex justify-center w-1/3">
            <Link to="/" className="flex items-center justify-center gap-1">
              <img src={logo} alt="Gabby Newluk Logo" className="h-12 w-auto md:h-16 lg:h-20 object-contain" />
              <span className="font-serif text-3xl md:text-4xl lg:text-5xl leading-none text-primary italic tracking-tight whitespace-nowrap pt-1">
                Gabby Newluk
              </span>
            </Link>
          </div>

          {/* Right: User, Wishlist, Cart */}
          <div className="flex items-center justify-end gap-5 md:gap-6 w-1/3 text-primary">
            <Link to="/book" className="hidden lg:block font-label text-[10px] tracking-widest uppercase border border-primary px-4 py-2 hover:bg-primary hover:text-on-primary transition-colors">
              Book Appointment
            </Link>

            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="font-label text-[11px] tracking-[0.2em] uppercase mt-[2px] transition-colors hover:text-surface-tint">Log In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
            <Link to="/wishlist" className="hover:text-surface-tint transition-colors hidden sm:block">
              <span className="sr-only">Wishlist</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </Link>
            <Link to="/cart" className="relative hover:text-surface-tint transition-colors flex items-center group">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 left-0 h-full w-[85%] md:w-[400px] bg-surface/85 backdrop-blur-xl z-[100] border-r border-surface-variant/50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-surface-variant">
                <span className="font-label text-[11px] tracking-[0.2em] uppercase text-outline">
                  Menu
                </span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:text-surface-tint transition-colors text-primary"
                >
                  <X className="w-6 h-6" strokeWidth={1.5} />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto px-6 md:px-8 py-10 md:py-12">
                <nav className="flex flex-col gap-8 md:gap-10">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="font-serif text-3xl md:text-4xl italic text-primary hover:text-surface-tint transition-colors block w-fit"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Drawer Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="p-6 md:p-8 border-t border-surface-variant/50 bg-black/5"
              >
                <div className="flex flex-col gap-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
                  <Link to="/profile" className="flex items-center gap-4 text-xs font-label uppercase tracking-widest text-outline hover:text-primary transition-colors group" onClick={() => setIsMenuOpen(false)}>
                    <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Settings
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition-colors flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    Saved Items
                  </Link>
                  
                  <div className="flex gap-8 mt-6 pt-6 border-t border-surface-variant">
                    <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                    <a href="#" className="hover:text-primary transition-colors">Pinterest</a>
                    <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
