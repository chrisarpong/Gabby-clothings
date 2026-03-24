import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Collections = () => {
  return (
    <div className="bg-[#F5F5F3] min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[130px] pb-32">
        <h1
          className="text-center text-[#3a1f1d] mb-16"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '3.5rem' }}
        >
          The Collections
        </h1>

        <div className="flex flex-col w-full">
          {/* Banner 1: The Heritage Kaftans */}
          <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2000&auto=format&fit=crop"
              alt="The Heritage Kaftans"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="relative z-20 flex flex-col items-center">
              <h2 className="text-white text-3xl md:text-5xl mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                The Heritage Kaftans
              </h2>
              <Link to="/shop" className="bg-white text-[#3a1f1d] px-8 py-3 uppercase tracking-widest text-sm font-semibold hover:bg-opacity-90 transition-all font-[var(--font-sans)]">
                Explore Collection
              </Link>
            </div>
          </div>

          {/* Banner 2: The Bespoke Agbadas */}
          <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src="https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=2000&auto=format&fit=crop"
              alt="The Bespoke Agbadas"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="relative z-20 flex flex-col items-center">
              <h2 className="text-white text-3xl md:text-5xl mb-6 text-center" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                The Bespoke Agbadas
              </h2>
              <Link to="/shop" className="bg-white text-[#3a1f1d] px-8 py-3 uppercase tracking-widest text-sm font-semibold hover:bg-opacity-90 transition-all font-[var(--font-sans)]">
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Collections;
