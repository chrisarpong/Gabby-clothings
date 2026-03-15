import collectionKaftans from '../assets/collection-kaftans.png';
import collectionAccessories from '../assets/collection-accessories.png';
import heroModel from '../assets/hero-model.png';

const collections = [
  {
    title: 'Shop Kaftans',
    image: collectionKaftans,
    alt: 'Premium African kaftans and agbadas on display',
  },
  {
    title: 'Shop Accessories',
    image: collectionAccessories,
    alt: 'Luxury African menswear accessories including fila cap and sandals',
  },
  {
    title: 'Shop Agbadas',
    image: heroModel,
    alt: 'Premium white agbada with gold embroidery',
  },
];

const Collections = () => {
  return (
    <section id="collections" className="section bg-[var(--color-black-soft)]">
      <div className="max-w-[1400px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl italic text-[var(--color-white)] mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            The Collections
          </h2>
          <p className="text-sm md:text-base text-[var(--color-white-soft)] font-light tracking-wide max-w-md mx-auto">
            Explore our latest arrivals in premium kaftans,
            <br />
            agbadas, and accessories.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {collections.map((item, index) => (
            <a
              key={item.title}
              href="#shop"
              className="group relative aspect-[3/4] overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.15}s` }}
              id={`collection-${index}`}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-[var(--color-black-deep)]/30 group-hover:bg-[var(--color-black-deep)]/50 transition-all duration-500" />

              {/* Title */}
              <div className="absolute top-6 left-6">
                <p
                  className="text-lg md:text-xl italic text-[var(--color-white)] underline underline-offset-4 decoration-[var(--color-gold)] decoration-1 group-hover:text-[var(--color-gold)] transition-colors duration-300"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {item.title}
                </p>
              </div>

              {/* Arrow indicator on hover */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-6 h-6 text-[var(--color-gold)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collections;
