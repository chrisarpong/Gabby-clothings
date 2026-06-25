import React, { useState } from "react";
import { motion } from "framer-motion";
import { Focus } from "lucide-react";
import '@google/model-viewer';

const ModelViewer = 'model-viewer' as unknown as React.FC<any>;

export default function HowToMeasure() {
  const [activeMeasurement, setActiveMeasurement] = useState<string | null>(null);
  const modelRef = React.useRef<any>(null);

  const steps = [
    {
      id: "chest",
      title: "Chest",
      description: "Wrap the measuring tape around the fullest part of your chest, under your armpits and over your shoulder blades. Keep the tape measure level and comfortably loose.",
      tips: "Stand naturally and breathe out before reading the measurement.",
      image: "/images/chest_measure.png",
      orbit: "0deg 80deg 0.8m",
      target: "0m 0.25m 0m"
    },
    {
      id: "waist",
      title: "Waist",
      description: "Measure around your natural waistline, which is usually just above your belly button and below your rib cage. Keep the tape measure level.",
      tips: "Don't suck in your stomach. Keep the tape comfortably loose.",
      image: "/images/waist_measure.png",
      orbit: "0deg 80deg 0.8m",
      target: "0m 0.15m 0m"
    },
    {
      id: "sleeve",
      title: "Sleeve",
      description: "Place your hand on your hip so your arm is slightly bent. Measure from the center back of your neck, across your shoulder, and down to your wrist bone.",
      tips: "It is often easier to have a friend help you with this measurement.",
      image: "/images/sleeve_measure.png",
      orbit: "45deg 80deg 0.8m",
      target: "0m 0.22m 0m"
    },
    {
      id: "inseam",
      title: "Inseam",
      description: "Measure from the uppermost part of your inner thigh down to the bottom of your ankle.",
      tips: "You can also take a pair of pants that fit you well and measure the inner seam from the crotch to the hem.",
      image: "/images/inseam_measure.png",
      orbit: "0deg 85deg 0.8m",
      target: "0m 0.05m 0m"
    }
  ];

  // Default camera settings
  const activeStep = steps.find(s => s.id === activeMeasurement);
  const currentOrbit = activeStep ? activeStep.orbit : "0deg 80deg 2.2m";
  const currentTarget = activeStep ? activeStep.target : "0m 0.15m 0m";

  const handleFocus = (id: string) => {
    setActiveMeasurement(id);
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface pt-32 pb-32">
      <div className="max-w-[1536px] mx-auto px-5 md:px-10 w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:mb-24 text-center max-w-3xl mx-auto"
        >
          <span className="font-label text-sm tracking-[0.2em] uppercase text-outline block mb-4">The Masterclass</span>
          <h1 className="font-serif text-4xl md:text-6xl text-primary italic mb-6">How to Measure</h1>
          <p className="font-sans text-on-surface-variant text-lg">
            A precise fit begins with accurate measurements. Follow our comprehensive visual guide below to ensure your custom garments drape flawlessly. We recommend having a friend or partner assist you for the best results.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 items-start w-full">
          
          {/* Left Column: 3D Mannequin (Sticky) */}
          <div className="w-full lg:w-[40%] flex flex-col items-center justify-center lg:sticky lg:top-32 h-[60vh] lg:h-[75vh]">
            <div className="relative w-full h-full bg-surface-container overflow-hidden rounded-sm select-none border border-outline/10 shadow-inner">
              <ModelViewer
                ref={modelRef}
                src="/assets/mannequin.glb?v=11"
                camera-controls
                auto-rotate={!activeMeasurement}
                rotation-per-second="30deg"
                disable-zoom
                shadow-intensity="1"
                camera-target={currentTarget}
                camera-orbit={currentOrbit}
                style={{ width: "100%", height: "100%", outline: "none" }}
                onClick={() => setActiveMeasurement(null)}
              >
              </ModelViewer>
              
              {/* 3D Controls overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md px-6 py-3 rounded-full border border-outline/10 flex items-center gap-4 text-primary font-sans text-xs tracking-widest uppercase shadow-sm whitespace-nowrap z-20 pointer-events-none">
                <span><span className="font-serif italic mr-1">1.</span> Drag to Rotate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Masterclass Scroll */}
          <div className="w-full lg:w-[60%] flex flex-col pt-4 lg:pt-0">
            <div className="flex flex-col gap-12">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row gap-8 bg-surface-container p-6 rounded-sm border transition-all duration-500 ${activeMeasurement === step.id ? 'border-primary shadow-md' : 'border-outline/10 shadow-sm'}`}
                >
                  {/* Image Side */}
                  <div className="w-full md:w-5/12 h-64 md:h-auto shrink-0 relative overflow-hidden rounded-sm bg-surface group">
                    <img 
                      src={step.image} 
                      alt={`Measuring ${step.title}`} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0"
                    />
                  </div>
                  
                  {/* Text Side */}
                  <div className="w-full md:w-7/12 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="font-label text-4xl text-brand-bone/30 block">
                          0{index + 1}
                        </span>
                        <h4 className="font-serif text-3xl text-primary italic">{step.title}</h4>
                      </div>
                      <button 
                        onClick={() => handleFocus(step.id)}
                        className={`p-2 rounded-full transition-colors ${activeMeasurement === step.id ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant hover:bg-surface-variant hover:text-primary'}`}
                        title="Focus 3D View"
                      >
                        <Focus size={18} />
                      </button>
                    </div>
                    
                    <p className="font-sans text-on-surface-variant text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    
                    <div className="bg-surface p-4 rounded-sm border-l-2 border-primary mt-auto">
                      <p className="font-sans text-sm text-on-surface-variant">
                        <strong className="text-primary font-semibold tracking-wide uppercase text-xs mr-2">Tailor's Tip:</strong> {step.tips}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
