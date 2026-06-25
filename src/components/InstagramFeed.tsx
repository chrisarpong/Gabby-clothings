import React from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

const feedImages = [
  "/assets/3.jpg",
  "/assets/agbada 2.jpeg",
  "/assets/kaftan.jpeg",
  "/assets/4.jpg",
  "/assets/Royalty .jpeg"
];

export default function InstagramFeed() {
  return (
    <section className="py-24 bg-surface">
      <div className="flex flex-col items-center mb-12 text-center px-5">
        <a href="https://www.instagram.com/gabbynewlukclothing" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group cursor-pointer">
          <Instagram className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
          <h2 className="font-label text-sm tracking-[0.2em] uppercase text-primary border-b border-transparent group-hover:border-primary pb-1 transition-colors">
            @GabbyNewluk
          </h2>
        </a>
      </div>

      <div className="flex w-full overflow-hidden">
        {feedImages.map((src, idx) => (
          <motion.a 
            href="https://www.instagram.com/gabbynewlukclothing"
            target="_blank" rel="noopener noreferrer"
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="relative block aspect-square w-1/2 md:w-1/3 lg:w-1/5 shrink-0 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
               <Instagram className="w-6 h-6 text-surface" />
            </div>
            <img 
              src={src} 
              alt={`Instagram post ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
              loading="lazy"
            />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
