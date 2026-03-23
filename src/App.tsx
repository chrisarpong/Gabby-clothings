import HeroSection from './components/HeroSection';
import Collections from './components/Collections';
import ParallaxDivider from './components/ParallaxDivider';
import OurStory from './components/OurStory';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <main>
        <HeroSection />
        <Collections />
        <ParallaxDivider />
        <OurStory />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
