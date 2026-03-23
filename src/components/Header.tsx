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

  // When scrolled, background is cream (#F5F5F3).
  // The user requested white text consistently for now with a TODO to revert.
  const headerBg = isScrolled ? 'bg-[#F5F5F3] shadow-sm' : 'bg-transparent';
  const borderClass = isScrolled ? 'border-b border-[#E8E8E8]' : 'border-transparent';
  
  /* TODO: Revert color to #3a1f1d when the final light background image is added */
  const textColor = 'text-[#ffffff]';
  const logoColor = 'text-[#ffffff]';

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-[100] flex justify-between items-center px-[5%] py-[2rem] transition-all duration-300 ${headerBg} ${borderClass}`}
    >
      {/* Left side: Logo */}
      <a
        href="#home"
        className={`font-[var(--font-serif)] text-4xl italic transition-colors duration-300 ${logoColor}`}
      >
        Gabby Newluk
      </a>

      {/* Middle: Navigation container */}
      <nav className="hidden md:flex flex-row gap-[2rem] items-center">
        {['All Products', 'Kaftans', 'Agbadas', 'Accessories'].map((link) => (
          <a
            key={link}
            href="#collections"
            className={`font-[var(--font-sans)] text-sm transition-colors duration-300 hover:opacity-70 ${textColor}`}
          >
            {link}
          </a>
        ))}
      </nav>

      {/* Right side: Flex row */}
      <div className="hidden md:flex flex-row gap-[2rem] items-center">
        <a
          href="#cart"
          className={`font-[var(--font-sans)] text-sm transition-colors duration-300 hover:opacity-70 ${textColor}`}
        >
          Cart (0)
        </a>
        <a
          href="#account"
          className={`font-[var(--font-sans)] text-sm flex items-center gap-2 transition-colors duration-300 hover:opacity-70 ${textColor}`}
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
