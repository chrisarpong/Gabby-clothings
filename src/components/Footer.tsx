import { TextField } from '@mui/material';

const Footer = () => {
  const muiBrandStyles = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': { borderColor: '#3a1f1d' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
  };

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
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-16 md:gap-10 relative z-10 w-full px-4 md:px-0">
        {/* Column 1: Join the List */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h3
            className="text-2xl md:text-3xl italic mb-4 text-[#3a1f1d]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Join the List
          </h3>
          <p className="font-[var(--font-sans)] text-[13px] md:text-sm mb-8 md:max-w-sm text-[#3a1f1d]/80 leading-relaxed max-w-[280px] md:max-w-full">
            Early access, private sales, and the latest from our studio, straight to your inbox.
          </p>
          <form className="flex flex-col items-center md:items-start gap-5 font-[var(--font-sans)] w-full max-w-[280px] md:max-w-sm">
            <TextField
              fullWidth
              variant="outlined"
              label="EMAIL ADDRESS"
              type="email"
              sx={muiBrandStyles}
            />
            <label className="flex items-start md:items-center gap-3 text-sm mt-1 cursor-pointer text-[#3a1f1d] w-full text-left md:text-left">
              <input type="checkbox" className="accent-[#3a1f1d] mt-1 md:mt-0 w-4 h-4 shrink-0" />
              <span className="opacity-80 text-xs leading-relaxed">Yes, I agree to receive marketing emails.</span>
            </label>
            <button 
              type="submit"
              className="mt-4 text-xs font-medium uppercase tracking-[0.2em] border-b border-[#3a1f1d] pb-1 hover:opacity-60 transition-opacity"
            >
              Join Now
            </button>
          </form>
        </div>

        {/* Column 2: Shop */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left text-[#3a1f1d]">
          <h4 className="text-xs uppercase tracking-[0.2em] opacity-80 mb-6 font-medium">
            Shop
          </h4>
          <ul className="flex flex-col font-[var(--font-sans)] text-[13px] md:text-sm p-0 m-0 list-none w-full">
            <li><a href="#shop" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">All Products</a></li>
            <li><a href="#shop" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Kaftans</a></li>
            <li><a href="#shop" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Agbadas</a></li>
            <li><a href="#shop" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Accessories</a></li>
          </ul>
        </div>

        {/* Column 3: Help */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left text-[#3a1f1d]">
          <h4 className="text-xs uppercase tracking-[0.2em] opacity-80 mb-6 font-medium">
            Help
          </h4>
          <ul className="flex flex-col font-[var(--font-sans)] text-[13px] md:text-sm p-0 m-0 list-none w-full">
            <li><a href="#faq" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Contact Us</a></li>
            <li><a href="#faq" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">FAQ</a></li>
            <li><a href="#faq" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Shipping & Returns</a></li>
            <li><a href="#faq" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Size Guide</a></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left text-[#3a1f1d]">
          <h4 className="text-xs uppercase tracking-[0.2em] opacity-80 mb-6 font-medium">
            Legal
          </h4>
          <ul className="flex flex-col font-[var(--font-sans)] text-[13px] md:text-sm p-0 m-0 list-none w-full">
            <li><a href="#legal" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Terms of Service</a></li>
            <li><a href="#legal" className="block py-2.5 md:py-1.5 hover:opacity-70 transition-opacity">Privacy Policy</a></li>
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
        <p className="font-[var(--font-sans)] text-[0.85rem] mt-6 text-center leading-[1.5]" style={{ color: '#4a3b32' }}>
          &copy; {new Date().getFullYear()} Gabby Newluk. All Rights Reserved.{' '}
          <a
            href="https://stadnet-technologies.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit hover:underline"
            style={{ textUnderlineOffset: '4px' }}
          >
            Stadnet Technologies
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
