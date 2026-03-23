import Header from './Header';
import heroImage from '../assets/hero-model.png';
import placeholderProduct from '../assets/collection-accessories.png'; // Using accessories image as a placeholder for the promo box

const HeroSection = () => {
  return (
    <section
      className="w-full h-screen relative bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
      id="home"
    >
      <Header />

      {/* 3. Left Content Block */}
      <div className="absolute bottom-[15%] left-[5%] max-w-[400px] z-10">
        <h1
          className="text-6xl md:text-8xl italic text-white leading-[1.1] mb-6"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Style, <br />
          Redefined
        </h1>
        <p className="font-[var(--font-sans)] text-white font-normal mb-[2rem] leading-relaxed text-lg">
          Uncomplicated, essential pieces you'll reach for again and again
        </p>
        <a
          href="#collections"
          className="inline-block bg-transparent border border-white text-white px-[30px] py-[10px] font-[var(--font-sans)] tracking-widest uppercase text-sm hover:bg-white hover:text-black transition-colors"
        >
          Shop All
        </a>
      </div>

      {/* 4. Right Promo Box */}
      <div className="absolute bottom-0 right-[5%] bg-[#F5F5F3] p-[1.5rem] flex items-center gap-[1.5rem] z-20 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        {/* Left side of box: Square image */}
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <img
            src={placeholderProduct}
            alt="Promo Product"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side of box: Flexbox column */}
        <div className="flex flex-col">
          <h3
            className="text-2xl italic text-[var(--color-text-primary)] mb-2"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            The mid-season <br /> sale is on!
          </h3>
          <p className="font-[var(--font-sans)] text-sm text-[var(--color-text-primary)] mb-4">
            Up to 40% Off
          </p>
          <a
            href="#collections"
            className="font-[var(--font-sans)] text-sm text-[var(--color-text-primary)] underline hover:opacity-70 transition-opacity"
          >
            Shop Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
