import React from 'react';
import { motion } from 'framer-motion';

export default function PageLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-surface pt-32 px-5 md:px-20 max-w-[1536px] mx-auto w-full">
      {/* Title Area Skeleton */}
      <div className="mb-12 md:mb-20 space-y-4">
        <div className="h-16 md:h-24 bg-surface-variant/50 w-3/4 md:w-1/2 animate-pulse rounded-sm" />
        <div className="h-6 bg-surface-variant/50 w-full md:w-1/3 animate-pulse rounded-sm" />
      </div>

      {/* Hero / Main Image Skeleton */}
      <div className="w-full h-[400px] md:h-[600px] bg-surface-variant/30 animate-pulse rounded-sm mb-16" />

      {/* Grid skeleton (similar to Shop or Collections) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="w-full aspect-[3/4] bg-surface-variant/40 animate-pulse rounded-sm" />
            <div className="h-4 bg-surface-variant/50 w-2/3 animate-pulse rounded-sm" />
            <div className="h-4 bg-surface-variant/50 w-1/3 animate-pulse rounded-sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
