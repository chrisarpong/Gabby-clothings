import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');

  const subscribe = useMutation(api.subscribers.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        await subscribe({ email });
        setStatus('submitted');
        setTimeout(() => {
          setEmail('');
          setStatus('idle');
        }, 3000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <section className="py-24 md:py-32 bg-primary text-surface px-5 sm:px-10 text-center relative overflow-hidden">
      {/* Subtle background element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/assets/6.jpg')] bg-cover bg-center mix-blend-overlay"></div>
      
      <div className="max-w-3xl mx-auto flex flex-col items-center relative z-10">
        <span className="font-label text-xs tracking-[0.3em] uppercase text-surface/70 mb-6 block">
          The Inner Circle
        </span>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl italic mb-6">
          Join the Atelier
        </h2>
        <p className="font-sans text-surface/80 max-w-lg mx-auto mb-12 leading-relaxed">
          Subscribe to receive exclusive access to private capsule drops, bespoke events, and editorial insights.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address" 
            className="flex-1 bg-transparent border-b border-surface/30 px-2 py-3 text-surface placeholder:text-surface/50 focus:outline-none focus:border-surface transition-colors font-sans rounded-none"
            required
          />
          <button 
            type="submit"
            className="font-label text-[11px] tracking-widest uppercase px-8 py-4 bg-surface text-primary hover:bg-surface-tint transition-colors whitespace-nowrap min-w-[140px]"
          >
            {status === 'submitted' ? 'Subscribed' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
