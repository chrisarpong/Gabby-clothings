import { useState, useEffect } from 'react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Shop', href: '#collections' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[var(--color-black-deep)]/95 backdrop-blur-md border-b border-[var(--color-gold)]/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          className="font-[var(--font-serif)] text-2xl md:text-3xl italic tracking-wide text-[var(--color-white)] hover:text-[var(--color-gold)] transition-colors duration-300"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          <span className="text-[var(--color-gold)]">G</span>abby{' '}
          <span className="text-[var(--color-gold)]">N</span>ewluk
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-sm uppercase tracking-[0.25em] font-light text-[var(--color-white-muted)] hover:text-[var(--color-gold)] transition-colors duration-300 group"
            >
              {link.label}
              <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-[var(--color-gold)] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Cart icon */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#shop"
            className="text-sm uppercase tracking-[0.2em] font-light text-[var(--color-white-muted)] hover:text-[var(--color-gold)] transition-colors duration-300"
          >
            Cart (0)
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] items-end"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          id="mobile-menu-toggle"
        >
          <span
            className={`block h-[1.5px] bg-[var(--color-white)] transition-all duration-300 ${
              mobileMenuOpen ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'
            }`}
          />
          <span
            className={`block h-[1.5px] bg-[var(--color-white)] transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0 w-4' : 'w-4'
            }`}
          />
          <span
            className={`block h-[1.5px] bg-[var(--color-white)] transition-all duration-300 ${
              mobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-6'
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[var(--color-black-deep)]/98 backdrop-blur-xl border-t border-[var(--color-gold)]/10 transition-all duration-500 overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col items-center gap-6 py-8">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg uppercase tracking-[0.3em] font-light text-[var(--color-white-muted)] hover:text-[var(--color-gold)] transition-colors duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#shop"
            className="mt-2 text-sm uppercase tracking-[0.2em] text-[var(--color-gold)] font-light"
          >
            Cart (0)
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
