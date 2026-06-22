import { useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const contentBlock = useQuery(api.content.get, { key: "home_hero" });
  const data = contentBlock?.data || {};

  const heading = data.heading || "Custom Elegance";
  const subHeading = data.subHeading || "";
  
  const images = (data.images && data.images.length > 0) 
    ? data.images.map((id: string) => `${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/getFile?storageId=${id}`)
    : ["/assets/4.jpg"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [images.length]);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img
          alt="High fashion portrait of a model in elegant custom African attire."
          className="w-full h-full object-cover object-center transition-opacity duration-1000"
          src={images[currentImageIndex]}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-primary/90"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center px-5 md:px-20 pt-24 md:pt-32 lg:pt-40">
        <h1 className="font-serif text-5xl md:text-[64px] leading-tight tracking-tight text-on-primary italic mb-4 max-w-4xl">
          {heading}
        </h1>
        {subHeading && (
          <p className="text-on-primary/80 font-sans text-lg md:text-xl max-w-2xl mb-8">
            {subHeading}
          </p>
        )}
        <button 
          onClick={() => navigate('/collections')}
          className="bg-primary border border-secondary text-on-primary text-label px-8 py-4 hover:bg-secondary hover:text-on-secondary transition-colors duration-300"
        >
          Discover the Collection
        </button>
      </div>
    </section>
  );
}
