import { Link } from "react-router-dom";

export default function Studio() {
  return (
    <section className="py-section px-5 md:px-20 bg-surface">
      <div className="max-w-[1536px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
        <div className="col-span-1 md:col-span-5 flex flex-col items-start md:pr-12 mb-16 md:mb-0">
          <span className="text-label text-secondary mb-6">
            Custom Services
          </span>
          <h2 className="font-serif text-4xl md:text-5xl italic text-primary mb-8">
            Custom Tailoring
          </h2>
          <p className="font-sans text-lg text-on-surface-variant mb-10 leading-relaxed">
            Garments crafted to your exact measurements, designed for your lifestyle.
            We believe clothing should be an extension of your architecture—not
            merely worn, but inhabited. Experience the pinnacle of African
            craftsmanship in a private consultation.
          </p>
          <Link to="/custom-tailoring" className="inline-block border border-primary text-primary hover:bg-primary hover:text-on-primary text-label px-8 py-4 transition-colors duration-300">
            Request a Fitting
          </Link>
        </div>
        <div className="col-span-1 md:col-span-7 relative h-[400px] md:h-[800px]">
          <img
            alt="Tailor working in studio."
            className="w-full h-full object-cover"
            src="/assets/3.jpg"
          />
          <div className="absolute -bottom-10 -left-10 w-[65%] md:w-1/2 md:h-1/2 border-[6px] border-surface shadow-2xl">
            <img
              alt="Detail of fabric texture."
              className="w-full h-full object-cover"
              src="/assets/Royalty .jpeg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
