import { useState } from "react";

function CollectionImage({ src, alt, title, extraClass = "" }: { src: string; alt: string; title: string; extraClass?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative h-[400px] sm:h-[500px] md:h-[819px] group cursor-pointer overflow-hidden ${extraClass}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-surface-variant animate-pulse z-0" />
      )}
      <img
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 relative z-0 ${loaded ? "opacity-100" : "opacity-0"}`}
        src={src}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-primary/40 reveal-overlay flex items-center justify-center z-10 transition-opacity">
        <h3 className="font-serif text-3xl md:text-4xl text-on-primary italic">
          {title}
        </h3>
      </div>
    </div>
  );
}

export default function Collections() {
  return (
    <section className="py-section px-5 md:px-20 bg-surface">
      <div className="max-w-[1536px] mx-auto">
        <div className="flex flex-col items-center mb-16">
          <span className="text-label text-secondary mb-4">Explore</span>
          <h2 className="font-serif text-4xl md:text-5xl italic text-primary">
            The Collections
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <CollectionImage
            alt="Men's Agbada collection."
            src="/assets/agbada 2.jpeg"
            title="Agbada"
          />
          <CollectionImage
            alt="Men's Kaftan collection."
            src="/assets/kaftan.jpeg"
            title="Kaftan"
            extraClass="mt-0 md:mt-12"
          />
          <CollectionImage
            alt="Men's Custom Fits collection."
            src="/assets/7.jpg"
            title="Custom Fits"
          />
        </div>
      </div>
    </section>
  );
}
