const OurStory = () => {
  return (
    <section 
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        minHeight: '70vh',
        backgroundColor: '#F5F5F3',
        overflow: 'hidden'
      }} 
      className="md:flex-row flex-col" // Tailwind overrides for mobile fallback if desired, though prompt asked for flex-row structure
      id="story"
    >
      {/* Left Side (Text Box) */}
      <div 
        style={{
          flex: 1,
          padding: '5rem 10%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 2
        }}
      >
        <h2
          className="text-4xl md:text-5xl italic text-[#3a1f1d] mb-[2rem]"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Our Story
        </h2>
        <p className="font-[var(--font-sans)] text-[#3a1f1d] leading-[1.6] text-lg">
          Gabby Newluk is about effortless sophistication. We create the foundational tailored pieces that simplify dressing, so you can focus on what matters.
        </p>
      </div>

      {/* Right Side (Image Wrapper) */}
      <div 
        style={{
          flex: 1,
          position: 'relative',
          minHeight: '400px',
          overflow: 'hidden'
        }}
        className="w-full"
      >
        {/* 
          * To use an image from the assets folder:
          * 1. import storyImg from '../assets/your-image.jpg';
          * 2. src={storyImg}
          */}
        <img
          src="https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1000&auto=format&fit=crop"
          alt="Our Story"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
    </section>
  );
};

export default OurStory;
