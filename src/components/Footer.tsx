const Footer = () => {
  return (
    <footer className="bg-[var(--color-bg-primary)] px-6 md:px-10 py-20 border-t border-[var(--color-border)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          
          {/* Column 1: Navigation */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)] font-medium mb-8">
              Navigation
            </h4>
            <ul className="space-y-4">
              {['Home', 'Shop', 'Collections', 'About', 'Contact'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[var(--color-text-primary)] font-light hover:text-[var(--color-accent)] transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Information */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)] font-medium mb-8">
              Information
            </h4>
            <ul className="space-y-4">
              {['Shipping & Returns', 'FAQ', 'Store Policy', 'Payments'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[var(--color-text-primary)] font-light hover:text-[var(--color-accent)] transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)] font-medium mb-8">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="text-sm text-[var(--color-text-primary)] font-light">
                500 Terry Francine Street<br />
                San Francisco, CA 94158
              </li>
              <li className="text-sm text-[var(--color-text-primary)] font-light">
                info@gabbynewluk.com
              </li>
              <li className="text-sm text-[var(--color-text-primary)] font-light">
                Tel: 123-456-7890
              </li>
            </ul>
          </div>

          {/* Column 4: Brand/Social */}
          <div className="flex flex-col md:items-end">
            <h4 className="text-3xl italic text-[var(--color-text-primary)] mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
              Gabby Newluk
            </h4>
            <div className="flex gap-6">
              <a
                href="https://instagram.com"
                className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-300"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors duration-300"
                aria-label="Pinterest"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.75.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.747-1.378 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001.012.017z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 flex justify-center gap-4">
          <div className="text-xs text-[var(--color-text-secondary)]">We accept:</div>
          <div className="flex gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-4 text-[var(--color-text-secondary)]">
              <path d="M20.067 8.478c0 0-1.067-1.333-2.667-1.333s-2.667 1.333-2.667 1.333v2.667h5.334V8.478zM6.667 8.478c0 0-1.067-1.333-2.667-1.333S1.333 8.478 1.333 8.478v2.667h5.334V8.478zM24 10.145v5.333c0 0.736-0.597 1.333-1.333 1.333H1.333C0.597 16.811 0 16.214 0 15.478v-5.333c0-0.736 0.597-1.333 1.333-1.333h21.334C23.403 8.812 24 9.409 24 10.145z"/>
            </svg>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-4 text-[var(--color-text-secondary)]">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.76 8.48c-0.096 0.48-0.4 0.64-0.8 0.48l-2.24-0.8-1.088 1.04c-0.12 0.12-0.224 0.224-0.448 0.224l0.16-2.24 4.16-3.76c0.176-0.16-0.048-0.24-0.272-0.08l-5.12 3.2-2.208-0.64c-0.48-0.16-0.496-0.48 0.096-0.72l8.16-3.2c0.384-0.16 0.72 0.08 0.576 0.72z"/>
            </svg>
            {/* Add more payment icons as needed */}
          </div>
        </div>

        {/* Legal Bar */}
        <div className="mt-24 pt-10 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
            &copy; 2035 by Gabby Newluk Clothing.
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)]">
            Proudly created with Antigravity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
