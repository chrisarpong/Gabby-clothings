export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          alt="High fashion portrait of a model in elegant bespoke African attire."
          className="w-full h-full object-cover object-center"
          src="/assets/4.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-primary/90"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center px-5 md:px-20 pt-24 md:pt-32 lg:pt-40">
        <h1 className="font-serif text-5xl md:text-[64px] leading-tight tracking-tight text-on-primary italic mb-8 max-w-4xl">
          Bespoke Elegance
        </h1>
        <button className="bg-primary border border-secondary text-on-primary text-label px-8 py-4 hover:bg-secondary hover:text-on-secondary transition-colors duration-300">
          Discover the Collection
        </button>
      </div>
    </section>
  );
}
