import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";

export default function CollectionsPage() {
  const catalogs = useQuery(api.catalogs.getAll, {}) || [];
  
  // Transform convex catalogs to local structure or fallback
  const collections = catalogs.length > 0 ? catalogs.map((cat: any) => ({
    title: cat.name,
    desc: cat.description || '',
    slug: cat.slug,
    img: cat.coverImageId 
      ? `${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/getFile?storageId=${cat.coverImageId}` 
      : "/assets/18.jpeg"
  })) : [
    {
      title: "Heritage Kaftans",
      desc: "Fluid silhouettes honoring traditional craftsmanship with modern textiles.",
      slug: "kaftans",
      img: "/assets/18.jpeg"
    },
    {
      title: "Custom Agbadas",
      desc: "Regal, commanding, and architecturally precise. Designed for grand entrances.",
      slug: "agbadas",
      img: "/assets/19.jpeg"
    },
    {
      title: "Accessories",
      desc: "The finishing touches. Hand-tooled leather, pure silk pocket squares, and hardware.",
      slug: "accessories",
      img: "/assets/20.jpeg"
    }
  ];

  return (
    <main className="bg-surface relative w-full pt-20">
      {collections.map((coll, index) => (
        <section key={coll.slug} className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden border-b border-surface-variant">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
            style={{ backgroundImage: `url(${coll.img})` }}
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
          
          <div className={`relative z-10 w-full max-w-[1536px] mx-auto px-5 md:px-20 flex flex-col ${index % 2 !== 0 ? 'items-end text-right' : 'items-start text-left'}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl bg-surface/10 backdrop-blur-sm p-8 md:p-12 border border-white/20"
            >
              <h2 className="font-serif text-5xl md:text-7xl text-white italic mb-6 leading-tight">
                {coll.title}
              </h2>
              <p className="font-sans text-base md:text-lg text-white/90 mb-10 leading-relaxed font-light">
                {coll.desc}
              </p>
              <Link 
                to={`/category/${coll.slug}`} 
                className="inline-block bg-white text-primary font-label text-[11px] tracking-[0.2em] uppercase py-4 px-10 hover:bg-surface-tint transition-colors"
              >
                View Collection
              </Link>
            </motion.div>
          </div>
        </section>
      ))}
    </main>
  );
}
