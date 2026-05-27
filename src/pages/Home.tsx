import Hero from '../components/Hero';
import Collections from '../components/Collections';
import Featured from '../components/Featured';
import Atelier from '../components/Atelier';
import Testimonial from '../components/Testimonial';
import FAQ from '../components/FAQ';
import InstagramFeed from '../components/InstagramFeed';
import Newsletter from '../components/Newsletter';

export default function Home() {
  return (
    <main>
      <Hero />
      <Collections />
      <Featured />
      <Atelier />
      <Testimonial />
      <FAQ />
      <InstagramFeed />
      <Newsletter />
    </main>
  );
}
