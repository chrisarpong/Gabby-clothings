const OurStory = () => {
  return (
    <section 
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
      id="story"
    >
      {/* Background Image */}
      {/* 
        * To use an image from the assets folder:
        * 1. import storyImg from '../assets/your-image.jpg';
        * 2. src={storyImg}
        */}
      <img
        src="https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=2000&auto=format&fit=crop"
        alt="Our Story"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />

      {/* Text Content (Overlapping Left) */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '5%',
          maxWidth: '400px',
          zIndex: 10,
          backgroundColor: 'rgba(245, 245, 243, 0.85)', // Very subtle soft semi-transparent cream background for readability
          padding: '2rem',
          backdropFilter: 'blur(5px)'
        }}
      >
        <h2
          className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-[1.5rem]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Our Story
        </h2>
        <p className="font-[var(--font-sans)] text-[#3a1f1d] leading-[1.6] text-lg">
          Gabby Newluk is about effortless sophistication. We create the foundational tailored pieces that simplify dressing, so you can focus on what matters.
        </p>
      </div>
    </section>
  );
};

export default OurStory;
