import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import brandLogo from '../assets/logo.png';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();
  
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When scrolled OR not on home page, background is cream (#F5F5F3) and text is dark `#3a1f1d`.
  // At top of home page, background is transparent and text is white.
  const activeScrolledState = !isHome || isScrolled;

  const headerStyle = activeScrolledState 
    ? {
        backgroundColor: '#F5F5F3',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        color: '#3a1f1d',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box' as const,
        padding: '2rem 5%',
        width: '100%',
        maxWidth: '100vw'
      }
    : {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        color: '#ffffff', /* TODO: Revert top-state text color to #3a1f1d when the final light background image is added */
        transition: 'all 0.3s ease',
        boxSizing: 'border-box' as const,
        padding: '2rem 5%',
        width: '100%',
        maxWidth: '100vw'
      };

  return (
    <header 
      className={`${isHome ? 'fixed' : 'relative'} top-0 left-0 z-[100] flex justify-between items-center ${activeScrolledState ? 'is-scrolled' : ''}`}
      style={headerStyle}
    >
      {/* Left side: Logo */}
      <Link
        to="/"
        className="hover:opacity-70 flex items-center h-[50px] md:h-[70px]"
      >
        <img src={brandLogo} alt="Gabby Newluk Logo" className="h-[100%] w-auto object-contain" />
      </Link>

      {/* Middle: Navigation container */}
      <nav className="hidden md:flex flex-row gap-[2rem] items-center">
        <Link to="/shop" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          Shop
        </Link>
        <Link to="/collections" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          Collections
        </Link>
        <Link to="/book-appointment" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          Book appointment
        </Link>
      </nav>

      {/* Right side: Flex row (Desktop) */}
      <div className="hidden md:flex flex-row gap-[2rem] items-center">
        <Link
          to="/account"
          className="text-sm hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Sign Up / Log In
        </Link>
        <Link
          to="/cart"
          className="text-sm hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Cart ({cartCount})
        </Link>
        <Link
          to="/account"
          className="text-sm flex items-center gap-2 hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Account
        </Link>
      </div>

      {/* Mobile controls (Hamburger + Cart) */}
      <div className="flex md:hidden flex-row gap-4 items-center">
        <Link to="/cart" className="text-sm hover:opacity-70 font-[var(--font-sans)]">
          Cart ({cartCount})
        </Link>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#F5F5F3] flex flex-col items-center py-8 gap-6 shadow-lg border-t border-[#e0e0e0] md:hidden z-50">
          <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-wider text-sm font-semibold hover:opacity-70">Shop</Link>
          <Link to="/collections" onClick={() => setIsMenuOpen(false)} className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-wider text-sm font-semibold hover:opacity-70">Collections</Link>
          <Link to="/book-appointment" onClick={() => setIsMenuOpen(false)} className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-wider text-sm font-semibold hover:opacity-70">Book Appointment</Link>
          <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-wider text-sm border-t border-[#ccc] pt-6 mt-2 w-[80%] text-center hover:opacity-70">Sign Up / Log In</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
