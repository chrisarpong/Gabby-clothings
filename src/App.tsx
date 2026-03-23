import HeroSection from './components/HeroSection';
import Collections from './components/Collections';
import ParallaxDivider from './components/ParallaxDivider';
import OurStory from './components/OurStory';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <main>
        <HeroSection />
        <Collections />
        <ParallaxDivider />
        <OurStory />
      </main>
      <Footer />
    </div>
  );
}

export default App;
