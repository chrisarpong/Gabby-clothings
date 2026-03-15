import storyPortrait from '../assets/story-portrait.png';

const OurStory = () => {
  return (
    <section id="story" className="section bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center overflow-hidden bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-sm">
          
          {/* Text Content */}
          <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20 order-2 lg:order-1 h-full">
            <h2
              className="text-4xl md:text-5xl italic text-[var(--color-text-primary)] mb-8"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Our Story
            </h2>
            <div className="w-12 h-[1px] bg-[var(--color-text-primary)] mb-8 opacity-30" />
            <p className="text-[var(--color-text-secondary)] font-light leading-[2] text-base md:text-lg mb-10 max-w-sm">
              Veilux is about effortless sophistication. We create the
              foundational pieces that simplify dressing, so you can focus on
              what matters.
            </p>
            <a
              href="#contact"
              className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-primary)] border-b border-[var(--color-text-primary)] pb-1 w-fit hover:opacity-70 transition-opacity"
              id="read-more-story"
            >
              Read More
            </a>
          </div>

          {/* High Impact Portrait */}
          <div className="relative aspect-[4/5] lg:aspect-auto h-full overflow-hidden order-1 lg:order-2">
            <img
              src={storyPortrait}
              alt="Portrait showing brand aesthetic"
              className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
            />
            {/* Elegant border overlay as seen in luxury templates */}
            <div className="absolute inset-8 border border-white/20 pointer-events-none" />
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default OurStory;
