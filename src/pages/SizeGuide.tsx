import React from "react";
import { motion } from "framer-motion";

export default function SizeGuide() {
  return (
    <main className="bg-surface relative w-full pt-40 pb-32 min-h-screen">
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto text-center md:text-left flex flex-col">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-6"
        >
          Customer Service
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-5xl md:text-7xl italic text-primary leading-tight mb-16"
        >
          Size Guide
        </motion.h1>

        <div className="flex flex-col gap-16 max-w-4xl font-sans text-on-surface-variant">
          <div>
            <h2 className="font-serif text-3xl text-primary mb-6">Men's Top Sizing (Inches)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-surface-variant">
                <thead>
                  <tr className="bg-surface-variant">
                    <th className="p-4 border border-surface-variant">Size</th>
                    <th className="p-4 border border-surface-variant">Chest</th>
                    <th className="p-4 border border-surface-variant">Waist</th>
                    <th className="p-4 border border-surface-variant">Sleeve Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-4 border border-surface-variant">S</td><td className="p-4 border border-surface-variant">36 - 38</td><td className="p-4 border border-surface-variant">28 - 30</td><td className="p-4 border border-surface-variant">33 - 34</td></tr>
                  <tr><td className="p-4 border border-surface-variant">M</td><td className="p-4 border border-surface-variant">39 - 41</td><td className="p-4 border border-surface-variant">32 - 34</td><td className="p-4 border border-surface-variant">34 - 35</td></tr>
                  <tr><td className="p-4 border border-surface-variant">L</td><td className="p-4 border border-surface-variant">42 - 44</td><td className="p-4 border border-surface-variant">36 - 38</td><td className="p-4 border border-surface-variant">35 - 36</td></tr>
                  <tr><td className="p-4 border border-surface-variant">XL</td><td className="p-4 border border-surface-variant">45 - 48</td><td className="p-4 border border-surface-variant">40 - 42</td><td className="p-4 border border-surface-variant">36 - 37</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-primary mb-6">Men's Trouser Sizing (Inches)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-surface-variant">
                <thead>
                  <tr className="bg-surface-variant">
                    <th className="p-4 border border-surface-variant">Size</th>
                    <th className="p-4 border border-surface-variant">Waist</th>
                    <th className="p-4 border border-surface-variant">Inseam</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-4 border border-surface-variant">28</td><td className="p-4 border border-surface-variant">29.5</td><td className="p-4 border border-surface-variant">30</td></tr>
                  <tr><td className="p-4 border border-surface-variant">30</td><td className="p-4 border border-surface-variant">31.5</td><td className="p-4 border border-surface-variant">32</td></tr>
                  <tr><td className="p-4 border border-surface-variant">32</td><td className="p-4 border border-surface-variant">33.5</td><td className="p-4 border border-surface-variant">32.5</td></tr>
                  <tr><td className="p-4 border border-surface-variant">34</td><td className="p-4 border border-surface-variant">35.5</td><td className="p-4 border border-surface-variant">33</td></tr>
                  <tr><td className="p-4 border border-surface-variant">36</td><td className="p-4 border border-surface-variant">37.5</td><td className="p-4 border border-surface-variant">33</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="font-serif text-3xl text-primary mb-6">Custom Fitting</h2>
            <p className="leading-relaxed">
              We highly recommend our Custom Tailoring service for an absolute, perfect fit. You can provide your exact measurements on the Custom Tailoring page and they will be securely saved into your profile for all future orders.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
