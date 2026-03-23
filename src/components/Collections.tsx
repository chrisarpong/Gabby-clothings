import collectionKaftans from '../assets/collection-kaftans.png';
import collectionAccessories from '../assets/collection-accessories.png';
import heroModel from '../assets/hero-model.png';

const collections = [
  {
    title: 'Kaftans',
    image: collectionKaftans,
    alt: 'Premium Kaftans collection',
  },
  {
    title: 'Agbadas (3 Pieces)',
    image: heroModel,
    alt: 'Luxury Agbadas collection',
  },
  {
    title: 'Shirts',
    image: collectionAccessories,
    alt: 'Elegant Shirts collection',
  },
  {
    title: 'Exclusives',
    image: heroModel,
    alt: 'Exclusive pieces collection',
  },
];

const Collections = () => {
  return (
    <section id="collections" className="section bg-[var(--color-bg-primary)] border-t border-[var(--color-border)]">
      <div className="max-w-[1300px] mx-auto px-10 md:px-16">
        {/* Heading */}
        <div className="text-center mb-20 animate-fade-in">
          <h2
            className="text-4xl md:text-5xl italic text-[var(--color-text-primary)] mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            The Collections
          </h2>
          <p className="text-base text-[var(--color-text-secondary)] font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            Explore our latest arrivals in men and accessories. Modern silhouettes met with traditional craftsmanship.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {collections.map((item, index) => (
            <a
              key={item.title}
              href="#shop"
              className="group relative flex flex-col items-center cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
              id={`collection-${index}`}
            >
              {/* Image Container with Wix-style overlay filter */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-bg-secondary)] mb-6 group">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover opacity-90 grayscale-[0.3] transition-all duration-500 ease group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                />
                {/* Subtle light overlay that disappears on hover */}
                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                  <a href="#shop" className="opacity-0 group-hover:opacity-100 text-white uppercase tracking-wider text-sm border border-white px-4 py-2 transition-opacity duration-500">
                    Shop Now
                  </a>
                </div>
              </div>

              {/* Title with Wix-style underline */}
              <div className="text-center">
                <p
                  className="text-xl italic text-[var(--color-text-primary)] transition-all duration-300 relative inline-block"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {item.title}
                  <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[var(--color-text-primary)]/30 group-hover:bg-[var(--color-text-primary)] transform transition-colors duration-300" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
