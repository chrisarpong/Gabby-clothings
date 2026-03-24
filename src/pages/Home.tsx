import HeroSection from '../components/HeroSection';
import Collections from '../components/Collections';
import OurStory from '../components/OurStory';

const Home = () => {
  return (
    <main className="w-full bg-[#F5F5F3]">
      <div className="mb-32 md:mb-48">
        <HeroSection />
      </div>
      
      <div className="mb-32 md:mb-48">
        <Collections />
      </div>

      {/* Parallax Divider */}
      <div 
        style={{
          width: '100%', 
          height: '70vh', 
          backgroundImage: "url('https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=2000')", 
          backgroundAttachment: 'fixed', 
          backgroundPosition: 'center', 
          backgroundSize: 'cover', 
          position: 'relative', 
        }}
        className="mb-32 md:mb-48"
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
      </div>

      <div className="mb-32 md:mb-48">
        <OurStory />
      </div>
    </main>
  );
};

export default Home;
