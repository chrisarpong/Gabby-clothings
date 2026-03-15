import { useState, useEffect } from 'react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'All Products', href: '#collections' },
    { label: 'Kaftans', href: '#collections' },
    { label: 'Agbadas', href: '#collections' },
    { label: 'Accessories', href: '#collections' },
  ];

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b border-transparent ${
        scrolled
          ? 'bg-[var(--color-bg-primary)] py-4 !border-[var(--color-border)] shadow-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
        
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <a
            href="#home"
            className={`font-[var(--font-serif)] text-4xl italic transition-colors duration-300 ${
              scrolled ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-primary)]'
            }`}
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Gabby Newluk
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 mt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`relative text-sm tracking-wide font-light transition-colors duration-300 group ${
                  scrolled ? 'text-[var(--color-text-primary)] hover:opacity-70' : 'text-[var(--color-text-primary)] hover:opacity-70'
                }`}
              >
                {link.label}
                <span className="absolute bottom-[-2px] left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>

        {/* Right Side: Cart & Profile */}
        <div className="hidden md:flex items-center gap-8 mt-2">
          <a
            href="#shop"
            className="text-sm tracking-wide font-light text-[var(--color-text-primary)] hover:opacity-70 transition-opacity duration-300"
          >
            Cart (0)
          </a>
          <a
            href="#login"
            className="flex items-center gap-2 text-sm tracking-wide font-light text-[var(--color-text-primary)] hover:opacity-70 transition-opacity duration-300"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Log In
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] items-end z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span
            className={`block h-[1.5px] bg-[var(--color-text-primary)] transition-all duration-300 ${
              mobileMenuOpen ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'
            }`}
          />
          <span
            className={`block h-[1.5px] bg-[var(--color-text-primary)] transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0 w-4' : 'w-4'
            }`}
          />
          <span
            className={`block h-[1.5px] bg-[var(--color-text-primary)] transition-all duration-300 ${
              mobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-6'
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden absolute top-0 left-0 w-full h-screen bg-[var(--color-bg-primary)] transition-all duration-500 flex flex-col items-center justify-center pt-20 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col items-center gap-8 w-full px-6">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-light text-[var(--color-text-primary)] tracking-wide w-full text-center border-b border-[var(--color-border)] pb-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {link.label}
            </a>
          ))}
          <div className="flex w-full justify-between mt-8 px-4 text-sm font-light text-[var(--color-text-secondary)]">
            <a href="#cart" className="hover:text-[var(--color-text-primary)]">Cart (0)</a>
            <a href="#login" className="hover:text-[var(--color-text-primary)]">Log In</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
