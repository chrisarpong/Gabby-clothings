import storyPortrait from '../assets/story-portrait.png';

const OurStory = () => {
  return (
    <section id="story" className="section bg-[var(--color-black-deep)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch min-h-[600px]">
          {/* Text column */}
          <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16 lg:py-0 order-2 lg:order-1">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl italic text-[var(--color-white)] mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Our Story
            </h2>
            <p className="text-[var(--color-white-soft)] font-light leading-[1.9] text-sm md:text-base mb-8 max-w-md">
              Gabby Newluk is about effortless sophistication. We create the
              foundational pieces that simplify dressing, so you can focus on
              what matters. Every kaftan and agbada is meticulously handcrafted
              using the finest fabrics, blending traditional African artistry
              with contemporary elegance.
            </p>
            <a
              href="#contact"
              className="inline-block self-start text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] border-b border-[var(--color-gold)]/40 pb-1 hover:border-[var(--color-gold)] transition-all duration-300"
              id="read-more-story"
            >
              Read More
            </a>
          </div>

          {/* Image column */}
          <div className="relative aspect-square lg:aspect-auto overflow-hidden order-1 lg:order-2">
            <img
              src={storyPortrait}
              alt="Portrait of a man wearing premium embroidered kaftan"
              className="w-full h-full object-cover"
            />
            {/* Subtle gold border accent */}
            <div className="absolute inset-0 border border-[var(--color-gold)]/10 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
