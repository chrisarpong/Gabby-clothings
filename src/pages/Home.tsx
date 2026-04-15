import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import HeroSection from '../components/HeroSection';
import OurStory from '../components/OurStory';
import CollectionsGrid from '../components/Collections';

import parallaxImage from '../assets/parallax-bg.jpg';

const Home = () => {
  return (
    <main className="w-full bg-[#F5F5F3]">
      <div className="mb-32 md:mb-48">
        <HeroSection />
      </div>

      <div className="mb-32 md:mb-48">
        <CollectionsGrid />
      </div>

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
          <Button asChild variant="link" className="p-0 h-auto font-normal hover:opacity-70 transition-opacity">
            <Link to="/shop" style={{ color: '#3a1f1d', textDecoration: 'underline', fontStyle: 'italic', fontSize: '1.1rem', fontFamily: "'Playfair Display', serif" }}>
              Grab Yours
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-32 md:mb-48">
        <OurStory />
      </div>
    </main>
  );
};

export default Home;
