export default function Testimonial() {
  return (
    <section className="py-section px-5 md:px-20 bg-surface-container-low border-t border-surface-variant">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        <span className="text-label text-secondary mb-8 block">
          Patron Statements
        </span>
        <h3 className="font-serif text-3xl md:text-5xl italic text-primary leading-snug md:leading-tight mb-10">
          "The attention to detail is unparalleled. Gabby Newluk doesn't just create garments, they craft architectural masterpieces that honor our heritage while looking entirely towards the future."
        </h3>
        <p className="font-label text-on-surface-variant tracking-widest uppercase">
          — Chidi A., Private Client
        </p>
      </div>
    </section>
  );
}
