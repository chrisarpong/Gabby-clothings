import collectionKaftans from '../assets/collection-kaftans.png';
import collectionAccessories from '../assets/collection-accessories.png';
import heroModel from '../assets/hero-model.png';

const collections = [
  {
    title: 'Shop Men',
    image: heroModel,
    alt: 'Premium Men clothing collection',
  },
  {
    title: 'Shop Accessories',
    image: collectionAccessories,
    alt: 'Luxury accessories collection',
  },
  {
    title: 'Shop Women',
    image: collectionKaftans,
    alt: 'Premium Women clothing collection',
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {collections.map((item, index) => (
            <a
              key={item.title}
              href="#shop"
              className="group relative flex flex-col items-center cursor-pointer overflow-hidden"
              style={{ animationDelay: `${index * 0.2}s` }}
              id={`collection-${index}`}
            >
              {/* Image Container with Wix-style overlay filter */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--color-bg-secondary)] mb-6">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover opacity-90 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
                />
                {/* Subtle light overlay that disappears on hover */}
                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-500" />
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
