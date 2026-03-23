import Header from './Header';

const HeroSection = () => {
  return (
    <section
      className="w-[100vw] h-[100vh] relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=2000&auto=format&fit=crop')` }}
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
      <div className="absolute bottom-0 right-[5%] bg-[#F5F5F3] p-[1.5rem] flex items-center gap-[1.5rem] z-30 max-w-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-[#1a1a1a]">
        {/* Left side of box: Square tiny thumbnail */}
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <img
            src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=200&auto=format&fit=crop"
            alt="Promo Product"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side of box: Flexbox column */}
        <div className="flex flex-col">
          <h3
            className="text-2xl italic mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            The mid-season <br /> sale is on!
          </h3>
          <p className="font-[var(--font-sans)] text-sm mb-4">
            Up to 40% Off
          </p>
          <a
            href="#collections"
            className="font-[var(--font-sans)] text-[#1a1a1a] text-sm underline hover:opacity-70 transition-opacity"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
