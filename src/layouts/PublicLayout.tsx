import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';

export default function PublicLayout() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
