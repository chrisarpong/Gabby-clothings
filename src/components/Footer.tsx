const Footer = () => {
  return (
    <footer 
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#F5F5F3',
        overflow: 'hidden',
        padding: '6rem 5% 2rem 5%'
      }}
    >
      {/* Top Grid (Links & Newsletter) */}
      <div 
        className="grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]" // Tailwind for mobile responsiveness
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'grid',
          gap: '3rem',
          width: '100%'
        }}
      >
        {/* Column 1: Join the List */}
        <div className="flex flex-col">
          <h3
            className="text-2xl italic mb-4 text-[#3a1f1d]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Join the List
          </h3>
          <p className="font-[var(--font-sans)] text-sm mb-6 max-w-sm text-[#3a1f1d]">
            Early access, private sales, and the latest from our studio, straight to your inbox.
          </p>
          <form className="flex flex-col gap-4 font-[var(--font-sans)]">
            <input
              type="email"
              placeholder="Email Address"
              style={{
                border: 'none',
                borderBottom: '1px solid #3a1f1d',
                background: 'transparent',
                padding: '10px 0',
                width: '100%',
                outline: 'none'
              }}
              className="placeholder:text-[#3a1f1d]/50 text-[#3a1f1d]"
            />
            <label className="flex items-center gap-2 text-sm mt-2 cursor-pointer text-[#3a1f1d]">
              <input type="checkbox" className="accent-[#3a1f1d]" />
              <span className="opacity-80">Yes, I agree to receive marketing emails.</span>
            </label>
            <button 
              type="submit"
              className="bg-[#3a1f1d] text-white font-[var(--font-sans)] uppercase tracking-wider text-sm hover:opacity-80 transition-opacity"
              style={{ padding: '10px 24px', cursor: 'pointer', display: 'inline-block' }}
            >
              Join Now
            </button>
          </form>
        </div>

        {/* Column 2: Shop */}
        <div className="flex flex-col text-[#3a1f1d]">
          <h4
            className="text-xl italic mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Shop
          </h4>
          <ul className="flex flex-col gap-3 font-[var(--font-sans)] text-sm p-0 m-0 list-none">
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">All Products</a></li>
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">Kaftans</a></li>
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">Agbadas</a></li>
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">Accessories</a></li>
          </ul>
        </div>

        {/* Column 3: Help */}
        <div className="flex flex-col text-[#3a1f1d]">
          <h4
            className="text-xl italic mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Help
          </h4>
          <ul className="flex flex-col gap-3 font-[var(--font-sans)] text-sm p-0 m-0 list-none">
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">Contact Us</a></li>
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">FAQ</a></li>
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">Shipping & Returns</a></li>
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">Size Guide</a></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div className="flex flex-col text-[#3a1f1d]">
          <h4
            className="text-xl italic mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Legal
          </h4>
          <ul className="flex flex-col gap-3 font-[var(--font-sans)] text-sm p-0 m-0 list-none">
            <li><a href="#legal" className="hover:opacity-70 transition-opacity">Terms of Service</a></li>
            <li><a href="#legal" className="hover:opacity-70 transition-opacity">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Area - Centered Brand Name & Copyright */}
      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }} className="md:mt-[6rem]">
        <h2 
          className="mb-4 text-center"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: '500', color: '#3a1f1d', fontSize: 'clamp(3.5rem, 8vw, 7rem)' }}
        >
          Gabby Newluk
        </h2>
        <p className="font-[var(--font-sans)] text-[0.75rem] md:text-[0.9rem] text-[#3a1f1d] mt-6 text-center leading-[1.5] uppercase tracking-wider">
          © 2026 by Gabby Newluk Clothing.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
