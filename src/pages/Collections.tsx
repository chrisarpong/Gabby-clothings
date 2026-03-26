import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import img1 from '../assets/1.jpg';
import img4 from '../assets/4.jpg';
import img5 from '../assets/5.jpg';
import img7 from '../assets/7.jpg';
import kaftans from '../assets/collection-kaftans.png';
import accessories from '../assets/collection-accessories.png';

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.2 } },
};

const collections = [
  {
    title: 'The Heritage Kaftans',
    subtitle: 'Timeless Elegance, Reimagined',
    description:
      'Crafted from the finest hand-woven fabrics, our Heritage Kaftans blend traditional West African artistry with contemporary silhouettes. Each piece is a testament to generational craftsmanship.',
    image: kaftans,
    accent: img4,
    link: '/shop',
    cta: 'Explore Kaftans',
  },
  {
    title: 'The Bespoke Agbadas',
    subtitle: 'Commanding Presence',
    description:
      'Our Agbada collection is designed for the modern gentleman who demands distinction. Hand-embroidered panels, sweeping proportions, and luxurious drape define every garment.',
    image: img1,
    accent: img5,
    link: '/shop',
    cta: 'Explore Agbadas',
  },
  {
    title: 'The Accessories Edit',
    subtitle: 'Details That Define',
    description:
      'From intricately beaded caps to hand-stitched leather sandals, our accessories collection completes the Gabby Newluk look with finishing touches of understated luxury.',
    image: accessories,
    accent: img7,
    link: '/shop',
    cta: 'Explore Accessories',
  },
];

const Collections = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#F5F5F3]"
    >
      {/* Hero Banner */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: '70vh' }}
      >
        <div className="absolute inset-0 z-0">
          <img
            src={img4}
            alt="Collections Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p
            className="uppercase tracking-[0.35em] text-white/70 text-xs mb-6"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            Gabby Newluk — Season 2026
          </p>
          <h1
            className="text-white mb-6"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
              lineHeight: 1.1,
            }}
          >
            The Collections
          </h1>
          <p
            className="text-white/80 max-w-[500px] leading-relaxed"
            style={{ fontFamily: "'Jost', sans-serif", fontSize: '1.1rem' }}
          >
            Three pillars of bespoke West African luxury — each collection a
            narrative woven in fabric and form.
          </p>
        </motion.div>
      </div>

      {/* Collection Sections */}
      <div className="w-full">
        {collections.map((col, idx) => {
          const isReversed = idx % 2 !== 0;

          return (
            <motion.section
              key={col.title}
              className="w-full"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              {/* Full-Width Immersive Banner */}
              <motion.div
                className="relative w-full overflow-hidden flex items-end"
                style={{ height: '85vh', minHeight: '550px' }}
                variants={fadeIn}
              >
                <img
                  src={col.image}
                  alt={col.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Overlay Content */}
                <div
                  className={`relative z-10 w-full flex flex-col md:flex-row ${
                    isReversed ? 'md:flex-row-reverse' : ''
                  } items-end md:items-end justify-between gap-8 md:gap-16`}
                  style={{ padding: '4rem 5% 5rem' }}
                >
                  <motion.div
                    className="flex flex-col max-w-[550px]"
                    variants={fadeUp}
                  >
                    <p
                      className="uppercase tracking-[0.3em] text-white/60 text-xs mb-3"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      Collection {String(idx + 1).padStart(2, '0')}
                    </p>
                    <h2
                      className="text-white mb-3"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: 'italic',
                        fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                        lineHeight: 1.15,
                      }}
                    >
                      {col.title}
                    </h2>
                    <p
                      className="text-white/60 mb-2 uppercase tracking-[0.2em] text-xs"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {col.subtitle}
                    </p>
                    <p
                      className="text-white/80 leading-relaxed mb-6"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '0.95rem',
                        maxWidth: '450px',
                      }}
                    >
                      {col.description}
                    </p>
                    <Link
                      to={col.link}
                      className="inline-block w-fit border border-white text-white uppercase tracking-widest text-xs hover:bg-white hover:text-[#3a1f1d] transition-colors duration-300"
                      style={{
                        padding: '14px 36px',
                        fontFamily: "'Jost', sans-serif",
                        letterSpacing: '0.15em',
                      }}
                    >
                      {col.cta}
                    </Link>
                  </motion.div>
                </div>
              </motion.div>

              {/* Accent Detail Strip */}
              <div
                className="w-full grid grid-cols-1 md:grid-cols-2"
                style={{ minHeight: '400px' }}
              >
                <motion.div
                  className={`bg-[#EBE8E1] flex flex-col justify-center ${
                    isReversed ? 'md:order-2' : 'md:order-1'
                  }`}
                  style={{ padding: '4rem 5%' }}
                  variants={fadeUp}
                >
                  <p
                    className="text-[#3a1f1d]/50 uppercase tracking-[0.3em] text-xs mb-4"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    The Details
                  </p>
                  <h3
                    className="text-[#3a1f1d] mb-4"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: 'italic',
                      fontSize: '1.8rem',
                    }}
                  >
                    Craftsmanship Beyond Compare
                  </h3>
                  <p
                    className="text-[#3a1f1d]/70 leading-relaxed mb-8"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '0.9rem',
                      maxWidth: '420px',
                    }}
                  >
                    Every stitch tells a story. Our master artisans pour
                    generations of knowledge into each piece, ensuring that
                    every garment carries the weight of heritage and the
                    lightness of modern elegance.
                  </p>
                  <Link
                    to="/book-appointment"
                    className="text-[#3a1f1d] underline italic text-sm hover:opacity-70 transition-opacity"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Book a Private Fitting →
                  </Link>
                </motion.div>
                <motion.div
                  className={`overflow-hidden ${
                    isReversed ? 'md:order-1' : 'md:order-2'
                  }`}
                  variants={fadeIn}
                >
                  <img
                    src={col.accent}
                    alt={`${col.title} detail`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out"
                    style={{ minHeight: '400px' }}
                  />
                </motion.div>
              </div>
            </motion.section>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.section
        className="w-full flex flex-col items-center text-center bg-[#3a1f1d]"
        style={{ padding: '6rem 5%' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <p
          className="uppercase tracking-[0.3em] text-white/50 text-xs mb-4"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Ready to Elevate Your Wardrobe?
        </p>
        <h2
          className="text-white mb-6"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
          }}
        >
          Discover the Full Catalogue
        </h2>
        <Link
          to="/shop"
          className="border border-white text-white uppercase tracking-widest text-xs hover:bg-white hover:text-[#3a1f1d] transition-colors duration-300"
          style={{
            padding: '14px 40px',
            fontFamily: "'Jost', sans-serif",
            letterSpacing: '0.15em',
          }}
        >
          Shop All Pieces
        </Link>
      </motion.section>
    </motion.div>
  );
};

export default Collections;
