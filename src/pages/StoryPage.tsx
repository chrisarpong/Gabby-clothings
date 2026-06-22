import { motion } from "framer-motion";
import { useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import ReactMarkdown from "react-markdown";

export default function StoryPage() {
  const contentBlock = useQuery(api.content.get, { key: "story_page" });
  const data = contentBlock?.data || {};

  const coverImageUrl = data.imageId 
    ? `${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/getFile?storageId=${data.imageId}` 
    : "/assets/17.jpeg";

  const heading = data.heading || "Obsessed with the Architecture of the Human Form.";
  const markdownBody = data.markdownBody || `
Gabby's journey began in the bustling markets of Accra, surrounded by a kaleidoscope of printed wax fabrics and the rhythmic hum of vintage sewing machines. He learned early that a garment must endure both the physical climate and the test of time.

After decades of honing the craft, the dedication remains the same: an absolute obsession with perfect fit and form. Every seam is intentional, every dart calculated. It is a quiet rebellion against mass production—a return to the intimately personal relationship between an artisan and their patron.
  `;
  return (
    <main className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          initial={{ scale: 1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          style={{ backgroundImage: "url('/assets/16.jpeg')" }}
        />
        <div className="absolute inset-0 bg-primary/50 mix-blend-multiply" />
        
        <div className="relative z-10 text-center text-white px-5 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl italic leading-tight mb-8"
          >
            Rooted in Tradition.<br />Tailored for the Future.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="font-sans text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed text-pretty"
          >
            Gabby Newluk blends the rich, vibrant heritage of Ghanaian textiles with sleek, modern architectural silhouettes. We don't just make clothes; we construct identity through cloth and thread.
          </motion.p>
        </div>
      </section>

      {/* The Founder / The Craft */}
      <section className="py-24 md:py-32 lg:py-40 px-5 md:px-20 max-w-[1536px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-1/2 aspect-[4/5] bg-surface-container overflow-hidden"
          >
            <img 
              src={coverImageUrl} 
              alt="Portrait of the Master Tailor" 
              className="w-full h-full object-cover grayscale"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <span className="font-label text-sm tracking-[0.2em] uppercase text-outline mb-6 block">
              The Master Tailor
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-primary mb-8 italic">
              {heading}
            </h2>
            <div className="space-y-6 font-sans text-lg text-on-surface-variant leading-relaxed prose prose-lg prose-p:text-on-surface-variant max-w-none">
              <ReactMarkdown>{markdownBody}</ReactMarkdown>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sustainability & Materials (Grid Section) */}
      <section className="bg-primary text-white py-24 md:py-40">
        <div className="max-w-[1536px] mx-auto px-5 md:px-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <span className="font-label text-sm tracking-[0.2em] uppercase text-white/60 mb-6 block">Our Philosophy</span>
            <h2 className="font-serif text-4xl md:text-5xl italic">A Commitment to Craft.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-primary transition-colors duration-500">
                 <span className="font-serif text-2xl italic">I</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 italic">Ethical Sourcing</h3>
              <p className="font-sans text-white/80 leading-relaxed">
                We prioritize locally made textiles, supporting Ghanaian weavers and dyers. When we look abroad, we select only premium organic silks, raw linens, and heritage wools with transparent supply chains.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-primary transition-colors duration-500">
                <span className="font-serif text-2xl italic">II</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 italic">Zero Waste Philosophy</h3>
              <p className="font-sans text-white/80 leading-relaxed">
                Slow fashion demands respect for the material. Off-cuts from our custom creations are meticulously repurposed into limited-edition accessories or architectural patchworks.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-primary transition-colors duration-500">
                <span className="font-serif text-2xl italic">III</span>
              </div>
              <h3 className="font-serif text-2xl mb-4 italic">Generational Durability</h3>
              <p className="font-sans text-white/80 leading-relaxed">
                We construct garments to outlast fleeting trends. Employing reinforced French seams and hand-stitched bar tacks, a Gabby Newluk piece is meant to be worn, loved, and passed down.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
