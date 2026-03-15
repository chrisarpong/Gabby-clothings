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
              {['Home', 'Shop All', 'Kaftans', 'Agbadas', 'Accessories'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[var(--color-text-primary)] font-light hover:opacity-60 transition-opacity duration-300"
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
                    className="text-sm text-[var(--color-text-primary)] font-light hover:opacity-60 transition-opacity duration-300"
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
              {['Instagram', 'Facebook', 'Twitter'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="text-xs uppercase tracking-widest text-[var(--color-text-primary)] hover:opacity-60 transition-opacity duration-300"
                  aria-label={platform}
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="mt-24 pt-10 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)]">
            &copy; 2035 by Gabby Newluk Clothing.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)]">
            Proudly created with Antigravity
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
