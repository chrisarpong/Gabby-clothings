import heroImage from '../assets/hero-model.png';

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-end overflow-hidden bg-[var(--color-black-deep)]"
    >
      {/* Background image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={heroImage}
          alt="Gabby Newluk model in premium white agbada with gold embroidery"
          className="w-full h-full object-cover object-top opacity-80"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-black-deep)] via-[var(--color-black-deep)]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-black-deep)]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 w-full pb-20 md:pb-28 lg:pb-32">
        <div className="max-w-xl">
          {/* Tagline */}
          <p
            className="text-xs md:text-sm uppercase tracking-[0.4em] text-[var(--color-gold)] mb-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            Redefining African Elegance
          </p>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6 opacity-0 animate-fade-in-up"
            style={{
              fontFamily: 'var(--font-serif)',
              animationDelay: '0.5s',
            }}
          >
            <span className="italic text-[var(--color-white)]">Style,</span>
            <br />
            <span className="gold-shimmer">Redefined</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-base md:text-lg text-[var(--color-white-muted)] font-light leading-relaxed mb-10 max-w-md opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.7s' }}
          >
            Premium Kaftans & Agbadas — uncomplicated, essential pieces
            crafted for the modern African gentleman.
          </p>

          {/* CTA Button */}
          <a
            href="#collections"
            className="inline-block border border-[var(--color-gold)] text-[var(--color-gold)] text-sm uppercase tracking-[0.3em] px-10 py-4 font-light hover:bg-[var(--color-gold)] hover:text-[var(--color-black-deep)] transition-all duration-500 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.9s' }}
            id="cta-shop-collection"
          >
            Shop Collection
          </a>
        </div>
      </div>

      {/* Sale promo badge - bottom right floating element (like the template) */}
      <div
        className="hidden lg:flex absolute bottom-16 right-10 z-10 flex-col items-center bg-[var(--color-black-card)]/90 backdrop-blur-sm border border-[var(--color-gold)]/20 px-8 py-6 max-w-[280px] opacity-0 animate-fade-in"
        style={{ animationDelay: '1.2s' }}
      >
        <p
          className="text-lg italic text-[var(--color-gold)] mb-1"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          New Collection Out Now!
        </p>
        <p className="text-xs text-[var(--color-white-soft)] tracking-wide">
          Exclusive pieces &nbsp;&bull;&nbsp;{' '}
          <a
            href="#collections"
            className="underline underline-offset-4 hover:text-[var(--color-gold)] transition-colors"
          >
            Shop Now
          </a>
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
