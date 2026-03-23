import parallaxBg from '../assets/4.jpg';

const ParallaxDivider = () => {
  return (
    <section 
      className="h-[80vh] relative bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${parallaxBg})` }}
    >
      {/* The Limited Collection Promo Box */}
      <div className="absolute bottom-0 left-[5%] bg-[#F5F5F3] p-[3rem] text-center max-w-[400px] z-20 shadow-xl">
        <h3
          className="text-3xl md:text-4xl italic text-[#3a1f1d]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The Limited Collection
        </h3>
        <p className="font-[var(--font-sans)] text-sm text-[#3a1f1d] my-[1.5rem] leading-relaxed">
          Select styles from our core collections are now available for a limited time
        </p>
        <a
          href="#shop-limited"
          className="font-[var(--font-serif)] italic text-lg text-[#3a1f1d] underline hover:no-underline transition-all"
        >
          Grab Yours
        </a>
      </div>
    </section>
  );
};

export default ParallaxDivider;
