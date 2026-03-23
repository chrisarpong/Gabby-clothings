const Footer = () => {
  return (
    <footer className="bg-[#F5F5F3] text-[#3a1f1d] pt-[6rem] pb-[2rem] px-[5%] relative overflow-hidden">
      {/* Top Area - Links & Newsletter */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-[3rem] relative z-10 w-full max-w-[1400px] mx-auto">
        
        {/* Column 1: Join the List */}
        <div className="flex flex-col">
          <h3
            className="text-2xl italic mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Join the List
          </h3>
          <p className="font-[var(--font-sans)] text-sm mb-6 max-w-sm">
            Early access, private sales, and the latest from our studio, straight to your inbox.
          </p>
          <form className="flex flex-col gap-4 font-[var(--font-sans)]">
            <input
              type="email"
              placeholder="Email Address"
              className="border-b border-t-0 border-l-0 border-r-0 border-[#3a1f1d] bg-transparent py-[10px] w-full outline-none placeholder:text-[#3a1f1d]/50 focus:ring-0"
            />
            <label className="flex items-start gap-2 text-sm mt-2 cursor-pointer">
              <input type="checkbox" className="mt-1 border-[#3a1f1d] bg-transparent text-[#3a1f1d] focus:ring-[#3a1f1d]" />
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
        <div className="flex flex-col">
          <h4
            className="text-xl italic mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Shop
          </h4>
          <ul className="flex flex-col gap-3 font-[var(--font-sans)] text-sm p-0 m-0">
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">All Products</a></li>
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">Kaftans</a></li>
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">Agbadas</a></li>
            <li><a href="#shop" className="hover:opacity-70 transition-opacity">Accessories</a></li>
          </ul>
        </div>

        {/* Column 3: Help */}
        <div className="flex flex-col">
          <h4
            className="text-xl italic mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Help
          </h4>
          <ul className="flex flex-col gap-3 font-[var(--font-sans)] text-sm p-0 m-0">
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">Contact Us</a></li>
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">FAQ</a></li>
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">Shipping & Returns</a></li>
            <li><a href="#faq" className="hover:opacity-70 transition-opacity">Size Guide</a></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div className="flex flex-col">
          <h4
            className="text-xl italic mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Legal
          </h4>
          <ul className="flex flex-col gap-3 font-[var(--font-sans)] text-sm p-0 m-0">
            <li><a href="#legal" className="hover:opacity-70 transition-opacity">Terms of Service</a></li>
            <li><a href="#legal" className="hover:opacity-70 transition-opacity">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Area - Copyright & Giant Logo */}
      <div className="mt-[5rem] flex justify-between items-end relative w-full z-10 hidden md:flex min-h-[15vw]">
        {/* Left Side: Copyright */}
        <p className="font-[var(--font-sans)] text-xs mb-4 z-20">
          &copy; 2026 by Gabby Newluk Clothing.
        </p>

        {/* Right Side: Giant Logo Watermark */}
        <div 
          style={{ 
            position: 'absolute',
            bottom: '-20px',
            right: '0',
            fontFamily: "'Playfair Display', serif", 
            fontStyle: 'italic', 
            fontSize: '15vw', 
            lineHeight: '0.8', 
            color: '#3a1f1d',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          Gabby Newluk
        </div>
      </div>

      {/* Mobile Bottom Area */}
      <div className="mt-16 flex flex-col gap-8 md:hidden relative z-10 w-full">
        <div 
          className="font-[var(--font-serif)] italic text-6xl leading-[0.8] text-[#3a1f1d] opacity-10 pointer-events-none"
        >
          Gabby Newluk
        </div>
        <p className="font-[var(--font-sans)] text-xs opacity-70">
          &copy; 2026 by Gabby Newluk Clothing.
        </p>
      </div>

    </footer>
  );
};

export default Footer;
