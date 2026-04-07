
import { Link } from 'react-router-dom';

import promoImg from '../assets/8.jpg';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section
      className="w-[100vw] h-[100vh] relative overflow-hidden bg-[#3a1f1d]"
      id="home"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/hero-video.mp4"
      />


      {/* Dark Overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>



      {/* Left-aligned Text Overlay */}
      <motion.div
        className="absolute left-0 right-0 top-1/2 z-10 max-w-[500px] -translate-y-1/2 px-6 text-white md:left-[5%] md:right-auto md:px-0"
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
        <Link
          to="/shop"
          className="bg-transparent border border-white text-white font-[var(--font-sans)] uppercase text-sm transition-all duration-300 hover:bg-white hover:!text-[#3a1f1d]"
          style={{ padding: '12px 32px', letterSpacing: '0.1em', display: 'inline-block', marginTop: '1rem' }}
        >
          Shop All
        </Link>
      </motion.div>

      {/* Right Promo Box */}
      <motion.div
        className="absolute bottom-4 left-0 right-0 z-40 mx-auto flex max-w-[90%] flex-row items-center gap-3 overflow-hidden bg-[#F5F5F3] p-3 shadow-[0_10px_40px_rgba(0,0,0,0.1)] md:bottom-[5%] md:left-auto md:right-[5%] md:mx-0 md:max-w-md md:gap-6 md:p-6"
        style={{
          position: 'absolute'
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Left side of box: Square tiny thumbnail */}
        <div className="h-20 w-20 shrink-0 overflow-hidden border border-black/5 md:h-32 md:w-32">
          {/* * To use an image from the assets folder:
            * 1. import promoImg from '../assets/your-image.jpg';
            * 2. src={promoImg}
            */}
          <img
            src={promoImg}
            alt="Promo"
            className="h-20 w-20 shrink-0 object-cover md:h-32 md:w-32"
            style={{ borderRadius: 0 }}
          />
        </div>

        {/* Right side of box: Flexbox column */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-3">
          <h3
            className="text-sm italic leading-tight text-[#3a1f1d] md:text-xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            The mid-season <br /> sale is on!
          </h3>

          <div className="flex w-full flex-row items-center justify-between gap-2">
            <p className="font-[var(--font-sans)] text-[10px] text-[#1a1a1a] md:text-sm">
              Up to 40% Off
            </p>
            <a
              href="#collections"
              className="whitespace-nowrap font-[var(--font-sans)] text-[10px] text-[#1a1a1a] underline transition-opacity hover:opacity-70 md:text-sm"
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
