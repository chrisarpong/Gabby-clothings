import Header from './Header';
import heroBg from '../assets/6.jpg';

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

      {/* Left Content Block */}
      <div className="absolute bottom-[20%] left-[5%] max-w-[500px] z-20 text-white">
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
      </div>

      {/* Right Promo Box */}
      <div 
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
      >
        {/* Left side of box: Square tiny thumbnail */}
        <div style={{ width: '140px', height: '140px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
          {/* 
            * To use an image from the assets folder:
            * 1. import promoImg from '../assets/your-image.jpg';
            * 2. src={promoImg}
            */}
          <img
            src="https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=400&auto=format&fit=crop"
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
      </div>
    </section>
  );
};

export default HeroSection;
