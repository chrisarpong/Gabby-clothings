import React from "react";
import { motion } from "framer-motion";

export default function HowToMeasure() {
  const steps = [
    {
      title: "Chest",
      description: "Measure around the fullest part of your chest, keeping the tape horizontal. Ensure the tape is snug but not tight.",
      image: "https://images.unsplash.com/photo-1593030103066-0093718efce9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Waist",
      description: "Measure around the narrowest part of your waist, typically just above your belly button. Leave a little room for comfort.",
      image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Hips",
      description: "Stand with your feet together and measure around the fullest part of your hips and rear.",
      image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Shoulders",
      description: "Measure across your back from the edge of one shoulder to the edge of the other.",
      image: "https://images.unsplash.com/photo-1588661621532-62cebb5e7ea8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Inseam",
      description: "Measure from the uppermost inner part of your thigh down to the bottom of your ankle.",
      image: "https://images.unsplash.com/photo-1594938298596-1eb6c0ec028e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    }
  ];

  return (
    <main className="min-h-screen bg-surface text-on-surface pt-32 pb-32">
      <div className="max-w-[1536px] mx-auto px-5 md:px-20 w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
        >
          <span className="font-label text-sm tracking-[0.2em] uppercase text-outline block mb-4">Measurement Guide</span>
          <h1 className="font-serif text-4xl md:text-6xl text-primary italic mb-6">How to Measure</h1>
          <p className="font-sans text-on-surface-variant text-lg">
            A precise fit begins with accurate measurements. Follow our comprehensive visual guide below to ensure your custom garments drape flawlessly. We recommend having a friend or partner assist you for the best results.
          </p>
        </motion.div>

        <div className="flex flex-col gap-24">
          {steps.map((step, index) => (
            <motion.div 
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
            >
              <div className="w-full md:w-1/2">
                <div className="aspect-square md:aspect-[4/3] bg-surface-container overflow-hidden">
                  <img 
                    src={step.image} 
                    alt={`How to measure ${step.title}`}
                    className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <span className="font-label text-6xl text-brand-bone/30 block mb-4">0{index + 1}</span>
                <h2 className="font-serif text-4xl text-primary mb-6 italic">{step.title}</h2>
                <p className="font-sans text-on-surface-variant text-lg leading-relaxed max-w-lg">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center border-t border-surface-variant pt-16"
        >
          <h3 className="font-serif text-3xl text-primary italic mb-4">Need Assistance?</h3>
          <p className="font-sans text-on-surface-variant mb-8 max-w-lg mx-auto">
            If you're unsure about taking your own measurements, our master tailors are available for a virtual consultation.
          </p>
          <a href="/custom-tailoring" className="inline-block bg-primary text-on-primary px-8 py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors">
            Book Virtual Consultation
          </a>
        </motion.div>

      </div>
    </main>
  );
}
