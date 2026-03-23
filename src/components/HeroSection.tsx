import Header from './Header';
import heroBg from '../assets/6.jpg';
import promoImg from '../assets/8.jpg';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section
      className="w-[100vw] h-[100vh] relative overflow-hidden bg-cover bg-center bg-no-repeat"
      /* 
       * To use an image from the assets folder:
       * 1. import heroBg from '../assets/your-image.jpg';
       * 2. style={{ backgroundImage: `url(${heroBg})` }}
       */
      style={{ backgroundImage: `url(${heroBg})` }}
      id="home"
    >
      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Absolutely Positioned Header */}
      <Header />

      {/* Left-aligned Text Overlay */}
      <motion.div 
        className="absolute left-[5%] top-1/2 -translate-y-1/2 max-w-[500px] z-10 text-white"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
      >
        <h1
          className="text-6xl md:text-8xl italic leading-[1.1] mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Style, <br />
          Redefined
        </h1>
        <p className="font-[var(--font-sans)] font-normal mb-[2rem] leading-relaxed text-lg text-white">
          Uncomplicated, essential pieces you'll reach for again and again.
        </p>
        <a
          href="#collections"
          className="inline-block bg-transparent border border-white text-white px-[30px] py-[10px] font-[var(--font-sans)] tracking-widest uppercase text-sm hover:bg-white hover:text-black transition-colors"
        >
          Shop All
        </a>
      </motion.div>

      {/* Right Promo Box */}
      <motion.div 
        style={{
          position: 'absolute', 
          bottom: '5%', 
          right: '5%', 
          backgroundColor: '#F5F5F3', 
          padding: '2rem', 
          display: 'flex', 
          gap: '1.5rem', 
          alignItems: 'center', 
          maxWidth: '480px', 
          zIndex: 50, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Left side of box: Square tiny thumbnail */}
        <div style={{ width: '140px', height: '140px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
          {/* 
            * To use an image from the assets folder:
            * 1. import promoImg from '../assets/your-image.jpg';
            * 2. src={promoImg}
            */}
          <img
            src={promoImg} 
            alt="Promo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0 }}
          />
        </div>

        {/* Right side of box: Flexbox column */}
        <div className="flex flex-col gap-[1rem] flex-1">
          <h3
            className="text-2xl italic text-[#3a1f1d]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            The mid-season <br /> sale is on!
          </h3>

          <div className="flex flex-row justify-between items-center w-full">
            <p className="font-[var(--font-sans)] text-sm text-[#1a1a1a]">
              Up to 40% Off
            </p>
            <a
              href="#collections"
              className="font-[var(--font-sans)] text-[#1a1a1a] text-sm underline hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              Shop Now
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
