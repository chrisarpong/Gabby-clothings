import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import OurStory from '../components/OurStory';

import parallaxImage from '../assets/parallax-bg.jpg';

const Home = () => {
  return (
    <main className="w-full bg-[#F5F5F3]">
      <div className="mb-32 md:mb-48">
        <HeroSection />
      </div>

      {/* Restored Collections Grid */}
      <section className="mb-32 md:mb-48" style={{ padding: '6rem 5%', backgroundColor: '#F5F5F3' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.5rem', color: '#3a1f1d', marginBottom: '1rem', textAlign: 'center' }}>
          The Collections
        </h2>
        <p style={{ textAlign: 'center', color: '#555', marginBottom: '4rem', fontFamily: "'Jost', sans-serif" }}>
          Explore our latest arrivals in men, women and accessories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Men's Collection */}
          <div style={{ position: 'relative', height: '600px', backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" alt="Men's Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Link to="/shop" style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', textDecoration: 'underline', color: '#3a1f1d', fontSize: '1.2rem', zIndex: 10 }}>
              Shop Men
            </Link>
          </div>

          {/* Accessories Collection */}
          <div style={{ position: 'relative', height: '600px', backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1572715376701-98568319fd0b?q=80&w=800&auto=format&fit=crop" alt="Accessories" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Link to="/shop" style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', textDecoration: 'underline', color: '#3a1f1d', fontSize: '1.2rem', zIndex: 10 }}>
              Shop Accessories
            </Link>
          </div>

          {/* Women's Collection */}
          <div style={{ position: 'relative', height: '600px', backgroundColor: '#e0e0e0', overflow: 'hidden' }}>
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" alt="Women's Collection" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <Link to="/shop" style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', textDecoration: 'underline', color: '#3a1f1d', fontSize: '1.2rem', zIndex: 10 }}>
              Shop Women
            </Link>
          </div>

        </div>
      </section>

      {/* Parallax Divider */}
      <div 
        style={{
          minHeight: '100vh', 
          width: '100%', 
          backgroundImage: `url(${parallaxImage})`, 
          backgroundAttachment: 'fixed', 
          backgroundPosition: 'center', 
          backgroundSize: 'cover', 
          backgroundRepeat: 'no-repeat',
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-start', 
          padding: '0 10%', 
          marginBottom: '8rem'
        }}
        className="md:mb-[12rem]"
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 0 }}></div>
        
        {/* Wix-Style Floating Promo Box */}
        <div 
          style={{ 
            backgroundColor: '#EBE8E1', 
            padding: '4rem 3rem', 
            maxWidth: '450px', 
            textAlign: 'center', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 10
          }}
        >
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.2rem', color: '#3a1f1d', marginBottom: '1rem' }}>
            The Limited Collection
          </h3>
          <p style={{ color: '#555', marginBottom: '2rem', lineHeight: '1.6', fontFamily: "'Jost', sans-serif" }}>
            Select styles from our core collections are now available for a limited time
          </p>
          <Link to="/shop" style={{ color: '#3a1f1d', textDecoration: 'underline', fontStyle: 'italic', fontSize: '1.1rem', fontFamily: "'Playfair Display', serif" }}>
            Grab Yours
          </Link>
        </div>
      </div>

      <div className="mb-32 md:mb-48">
        <OurStory />
      </div>
    </main>
  );
};

export default Home;
