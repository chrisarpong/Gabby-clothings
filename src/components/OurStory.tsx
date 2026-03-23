const OurStory = () => {
  return (
    <section className="flex flex-col md:flex-row min-h-[80vh] w-full" id="story">
      {/* Left Side (Text Box) */}
      <div className="flex-1 bg-[#F5F5F3] flex flex-col justify-center py-[10%] px-[15%]">
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

      {/* Right Side (Image) */}
      <div className="flex-1 w-full h-[50vh] md:h-auto object-cover relative">
        {/* 
          * To use an image from the assets folder:
          * 1. import storyImg from '../assets/your-image.jpg';
          * 2. src={storyImg}
          */}
        <img
          src="https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1000&auto=format&fit=crop"
          alt="Our Story"
          className="w-full h-full object-cover absolute inset-0"
        />
      </div>
    </section>
  );
};

export default OurStory;
