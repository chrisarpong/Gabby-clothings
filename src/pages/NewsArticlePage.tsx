import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function NewsArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const posts = useQuery(api.posts.getAll);

  if (posts === undefined) {
    return (
      <main className="min-h-screen bg-surface pt-32 pb-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </main>
    );
  }

  const article = posts?.find(p => p.slug === slug && p.status === 'published');

  if (!article) {
    return (
      <main className="min-h-screen bg-surface pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-4xl text-primary mb-4">Article Not Found</h1>
        <p className="font-sans text-on-surface-variant mb-8">The news or blog post you are looking for does not exist or has been removed.</p>
        <Link to="/" className="border border-primary text-primary px-8 py-3 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-on-primary transition-colors">
          Return Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface pt-32 pb-32">
      <article className="max-w-3xl mx-auto px-5 md:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link to="/" className="inline-flex items-center gap-2 font-label text-[10px] tracking-widest uppercase text-outline hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant bg-surface-container px-3 py-1">
              {article.category?.replace('_', ' ') || "Uncategorized"}
            </span>
            <span className="font-label text-[10px] tracking-widest uppercase text-outline flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {new Date(article._creationTime).toLocaleDateString()}
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-8">
            {article.title}
          </h1>

          {article.coverImageId && (
            <div className="w-full aspect-video bg-surface-container overflow-hidden mb-12 border border-surface-variant">
              <img 
                src={article.coverImageId} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg prose-headings:font-serif prose-headings:text-primary prose-headings:font-normal prose-p:font-sans prose-p:text-on-surface-variant prose-p:leading-relaxed prose-a:text-primary hover:prose-a:text-primary/70 prose-a:transition-colors prose-strong:text-primary max-w-none"
        >
          <ReactMarkdown>
            {article.content}
          </ReactMarkdown>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-surface-variant">
          <p className="font-label text-[10px] tracking-widest uppercase text-outline text-center">
            Gabby Newluk
          </p>
        </div>
      </article>
    </main>
  );
}
