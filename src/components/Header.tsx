import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When scrolled, background is cream (#F5F5F3) and text is dark `#3a1f1d`.
  // At top, background is transparent and text is white.
  const headerStyle = isScrolled 
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
      className={`fixed top-0 left-0 z-[100] flex justify-between items-center ${isScrolled ? 'is-scrolled' : ''}`}
      style={headerStyle}
    >
      {/* Left side: Logo */}
      <Link
        to="/"
        className="text-4xl italic hover:opacity-70"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Gabby Newluk
      </Link>

      {/* Middle: Navigation container */}
      <nav className="hidden md:flex flex-row gap-[2rem] items-center">
        <Link to="/shop" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          All Products
        </Link>
        <Link to="/category/kaftans" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          Kaftans
        </Link>
        <Link to="/category/agbadas" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          Agbadas
        </Link>
        <Link to="/category/accessories" className="text-sm hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
          Accessories
        </Link>
      </nav>

      {/* Right side: Flex row */}
      <div className="hidden md:flex flex-row gap-[2rem] items-center">
        <Link
          to="/cart"
          className="text-sm hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Cart (0)
        </Link>
        <Link
          to="#"
          className="text-sm flex items-center gap-2 hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Account
        </Link>
      </div>
    </header>
  );
};

export default Header;
