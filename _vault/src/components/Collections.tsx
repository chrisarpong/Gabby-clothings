import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import img1 from '../assets/1.jpg';
import img2 from '../assets/2.webp';
import img3 from '../assets/3.jpg';
import { motion } from 'framer-motion';

const Collections = () => {
  const cards = [
    { title: 'Shop Men', img: img1 },
    { title: 'Shop Women', img: img2 },
    { title: 'Shop Accessories', img: img3 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8 } 
    }
  };

  return (
    <section id="collections" className="bg-[#F5F5F3] w-full" style={{ padding: '10rem 5%' }}>
      {/* Heading Container */}
      <motion.div 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem', paddingTop: '5rem' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h2
          className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-[1rem]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          The Collections
        </h2>
        <p className="font-[var(--font-sans)] text-sm text-[#3a1f1d] max-w-[400px] leading-relaxed">
          Explore our latest arrivals in men, women and accessories.
        </p>
      </motion.div>

      {/* Grid Container */}
      <motion.div 
        className="w-full max-w-[1200px] mx-auto px-[20px] grid justify-center"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="group relative block overflow-hidden bg-white border border-[#3a1f1d]/5 shadow-sm aspect-[3/4]">
            <Button asChild variant="ghost" className="block w-full h-full p-0 overflow-hidden bg-transparent hover:bg-transparent rounded-none">
              <Link to="/shop">
                {/* Image */}
                <img
                  src={card.img}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Overlay Text */}
                <div className="absolute top-[1.5rem] left-[1.5rem] z-20">
                  <h3 
                    className="text-sm font-[var(--font-sans)] tracking-widest uppercase text-[#3a1f1d] bg-[#F5F5F3] px-3 py-1"
                  >
                    {card.title}
                  </h3>
                </div>
              </Link>
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Collections;
