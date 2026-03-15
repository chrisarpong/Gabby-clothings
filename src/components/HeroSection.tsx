import heroImage from '../assets/hero-model.png';

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-[var(--color-bg-primary)] px-6 md:px-10 py-20 lg:py-0"
    >
      <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Text Content - Left Side */}
        <div className="relative z-10 order-2 lg:order-1 pt-12 lg:pt-0">
          <div className="max-w-xl animate-fade-in-up">
            <h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-bold leading-[0.9] text-[var(--color-text-primary)] mb-8"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Style, <br />
              <span className="italic font-light">Redefined</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] font-light leading-relaxed mb-10 max-w-sm">
              Uncomplicated, essential pieces you'll reach for again and again.
            </p>

            <a
              href="#collections"
              className="btn-ghost-dark"
              id="cta-shop-collection"
            >
              Shop All
            </a>
          </div>
        </div>

        {/* Hero Image - Right Side */}
        <div className="relative order-1 lg:order-2 h-[50vh] lg:h-[80vh] w-full animate-fade-in">
          <div className="absolute inset-0 border border-[var(--color-border)] transform translate-x-4 translate-y-4 -z-10" />
          <img
            src={heroImage}
            alt="Gabby Newluk model in premium clothing"
            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
          />
          
          {/* Floating Promotional Box - matching Wix template */}
          <div className="absolute bottom-6 -left-6 md:-left-12 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-8 md:p-10 max-w-[280px] shadow-sm animate-fade-in animation-delay-800">
            <h3 className="text-xl md:text-2xl italic text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              The mid-season <br /> sale is on!
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] font-light mb-4">
              Up to 40% Off
            </p>
            <a
              href="#collections"
              className="text-xs uppercase tracking-widest text-[var(--color-text-primary)] border-b border-[var(--color-text-primary)] pb-1 hover:opacity-70 transition-opacity"
            >
              Shop Now
            </a>
          </div>
        </div>
      </div>

      {/* Subtle background text or line element as seen in editor templates */}
      <div className="hidden lg:block absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] text-[var(--color-text-secondary)] opacity-30">
        Premium Craftsmanship &bull; Timeless Design
      </div>
    </section>
  );
};

export default HeroSection;
