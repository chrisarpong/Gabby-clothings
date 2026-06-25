import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Scissors, User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type Tab = "tops" | "bottoms";

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState<Tab>("tops");

  const tabs: { id: Tab; label: string }[] = [
    { id: "tops", label: "Shirts & Suiting" },
    { id: "bottoms", label: "Trousers & Bottoms" }
  ];

  return (
    <main className="bg-surface relative w-full pt-32 pb-32 min-h-screen">
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto flex flex-col">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-4"
          >
            The Perfect Fit
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl italic text-primary leading-tight mb-6"
          >
            Size Guide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-on-surface-variant text-lg"
          >
            Our garments are crafted to exacting standards. Find your ideal size below, or opt for our bespoke custom tailoring service for a truly personalized silhouette.
          </motion.p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Sidebar: Navigation & CTAs */}
          <div className="w-full lg:w-1/4 flex flex-col gap-12">
            
            {/* Tabs */}
            <div className="flex flex-col gap-2 relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-6 py-4 font-label text-sm tracking-widest uppercase transition-all duration-300 relative ${
                    activeTab === tab.id ? "text-primary" : "text-on-surface-variant hover:text-primary hover:bg-surface-variant/30"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute left-0 top-0 w-1 h-full bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CTA Cards */}
            <div className="flex flex-col gap-6 mt-8">
              <Link to="/how-to-measure" className="group flex flex-col gap-4 p-6 bg-surface-container border border-surface-variant hover:border-primary/50 transition-colors">
                <Ruler className="text-primary" size={24} />
                <div>
                  <h3 className="font-serif text-xl text-primary mb-2">How to Measure</h3>
                  <p className="font-sans text-sm text-on-surface-variant mb-4">
                    Follow our masterclass guide to taking your own precise measurements.
                  </p>
                  <span className="font-label text-xs tracking-widest uppercase text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
                    View Guide <ChevronRight size={14} />
                  </span>
                </div>
              </Link>

              <Link to="/custom-tailoring" className="group flex flex-col gap-4 p-6 bg-primary text-on-primary hover:bg-surface-tint transition-colors">
                <Scissors size={24} />
                <div>
                  <h3 className="font-serif text-xl mb-2 italic">Bespoke Fit</h3>
                  <p className="font-sans text-sm text-on-primary/80 mb-4">
                    Input your exact measurements for a custom-tailored garment that fits flawlessly.
                  </p>
                  <span className="font-label text-xs tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                    Learn More <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Content: Dynamic Tables */}
          <div className="w-full lg:w-3/4 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-surface-container border border-surface-variant rounded-sm overflow-hidden shadow-sm"
              >
                {activeTab === "tops" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Size</th>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Chest (Inches)</th>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Waist (Inches)</th>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Sleeve (Inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "S", chest: "36 - 38", waist: "28 - 30", sleeve: "33 - 34" },
                          { size: "M", chest: "39 - 41", waist: "32 - 34", sleeve: "34 - 35" },
                          { size: "L", chest: "42 - 44", waist: "36 - 38", sleeve: "35 - 36" },
                          { size: "XL", chest: "45 - 48", waist: "40 - 42", sleeve: "36 - 37" },
                          { size: "XXL", chest: "49 - 52", waist: "44 - 46", sleeve: "37 - 38" },
                        ].map((row) => (
                          <tr key={row.size} className="group hover:bg-surface-variant/30 transition-colors">
                            <td className="p-6 border-b border-surface-variant/50 font-bold text-primary group-hover:text-brand-gold transition-colors">{row.size}</td>
                            <td className="p-6 border-b border-surface-variant/50 text-on-surface-variant">{row.chest}</td>
                            <td className="p-6 border-b border-surface-variant/50 text-on-surface-variant">{row.waist}</td>
                            <td className="p-6 border-b border-surface-variant/50 text-on-surface-variant">{row.sleeve}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "bottoms" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Size</th>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Waist (Inches)</th>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Inseam (Inches)</th>
                          <th className="p-6 border-b border-surface-variant font-medium text-outline uppercase tracking-wider text-xs">Hip (Inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { size: "28", waist: "29.5", inseam: "30", hip: "35" },
                          { size: "30", waist: "31.5", inseam: "32", hip: "37" },
                          { size: "32", waist: "33.5", inseam: "32.5", hip: "39" },
                          { size: "34", waist: "35.5", inseam: "33", hip: "41" },
                          { size: "36", waist: "37.5", inseam: "33", hip: "43" },
                          { size: "38", waist: "39.5", inseam: "34", hip: "45" },
                        ].map((row) => (
                          <tr key={row.size} className="group hover:bg-surface-variant/30 transition-colors">
                            <td className="p-6 border-b border-surface-variant/50 font-bold text-primary group-hover:text-brand-gold transition-colors">{row.size}</td>
                            <td className="p-6 border-b border-surface-variant/50 text-on-surface-variant">{row.waist}</td>
                            <td className="p-6 border-b border-surface-variant/50 text-on-surface-variant">{row.inseam}</td>
                            <td className="p-6 border-b border-surface-variant/50 text-on-surface-variant">{row.hip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
            <div className="mt-8 flex items-start gap-4 p-6 bg-surface-variant/30 border-l-4 border-primary">
              <User className="text-primary shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-serif text-lg text-primary mb-1">Between Sizes?</h4>
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  If your measurements fall between two sizes, we recommend selecting the larger size for a more relaxed drape, or opting for our Custom Tailoring service for an exact match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
