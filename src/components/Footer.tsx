const Footer = () => {
  return (
    <footer 
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#F5F5F3',
        overflow: 'hidden',
        zIndex: 10,
        padding: '5rem 5% 2rem 5%'
      }}
    >
      {/* Inner Container for Links */}
      <div 
        className="grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr]" // Allowing mobile wrap
        style={{
          display: 'grid',
          gap: '3rem',
          width: '100%',
          position: 'relative',
          zIndex: 5
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
              className="bg-transparent border border-[#3a1f1d] text-[#3a1f1d] px-[30px] py-[10px] mt-[1rem] w-fit hover:bg-[#3a1f1d] hover:text-[#F5F5F3] transition-colors"
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

      {/* Copyright Line */}
      <div className="mt-[5rem] relative z-20 font-[var(--font-sans)] text-[#3a1f1d] text-xs">
        <p>&copy; 2026 by Gabby Newluk Clothing.</p>
      </div>

      {/* The Giant Watermark Logo */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-8%',
          right: '-2%',
          fontFamily: "'Playfair Display', serif",
          fontStyle: 'italic',
          fontSize: '18vw',
          lineHeight: '0.7',
          color: '#3a1f1d',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        Gabby Newluk
      </div>
    </footer>
  );
};

export default Footer;
