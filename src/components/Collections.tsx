import img1 from '../assets/1.jpg';
import img2 from '../assets/2.webp';
import img3 from '../assets/3.jpg';

const Collections = () => {
  const cards = [
    { title: 'Shop Men', img: img1 },
    { title: 'Shop Women', img: img2 },
    { title: 'Shop Accessories', img: img3 },
  ];

  return (
    <section id="collections" className="bg-[#F5F5F3] w-full" style={{ padding: '10rem 5%' }}>
      {/* Heading Container */}
      <div className="text-center">
        <h2
          className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-[1rem]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The Collections
        </h2>
        <p className="font-[var(--font-sans)] text-sm text-[#3a1f1d] max-w-[400px] mx-auto mb-[5rem] leading-relaxed">
          Explore our latest arrivals in men, women and accessories.
        </p>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2rem] w-full max-w-[1400px] mx-auto">
        {cards.map((card, idx) => (
          <div key={idx} className="relative aspect-[3/4] overflow-hidden group">
            {/* Image */}
            <img
              src={card.img}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Overlay Text */}
            <a
              href="#shop"
              className="absolute top-[1.5rem] left-[1.5rem] z-10 text-xl md:text-2xl italic text-[#3a1f1d] underline hover:no-underline transition-all"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {card.title}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Collections;
