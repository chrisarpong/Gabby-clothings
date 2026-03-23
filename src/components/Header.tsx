import { useState, useEffect } from 'react';

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
      <a
        href="#home"
        className="text-4xl italic hover:opacity-70"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Gabby Newluk
      </a>

      {/* Middle: Navigation container */}
      <nav className="hidden md:flex flex-row gap-[2rem] items-center">
        {['All Products', 'Kaftans', 'Agbadas', 'Accessories'].map((link) => (
          <a
            key={link}
            href="#collections"
            className="text-sm hover:opacity-70"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {link}
          </a>
        ))}
      </nav>

      {/* Right side: Flex row */}
      <div className="hidden md:flex flex-row gap-[2rem] items-center">
        <a
          href="#cart"
          className="text-sm hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Cart (0)
        </a>
        <a
          href="#account"
          className="text-sm flex items-center gap-2 hover:opacity-70"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Account
        </a>
      </div>
    </header>
  );
};

export default Header;
