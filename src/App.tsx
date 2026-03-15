import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Collections from './components/Collections';
import OurStory from './components/OurStory';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-black-deep)]">
      <Header />
      <main>
        <HeroSection />
        <Collections />
        <OurStory />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
