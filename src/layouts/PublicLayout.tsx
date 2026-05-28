import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';

export default function PublicLayout() {
  const maintenanceMode = useQuery(api.settings.getByKey, { key: 'maintenanceMode' });
  const isBannerActive = useQuery(api.settings.getByKey, { key: 'isBannerActive' });
  const announcementBannerText = useQuery(api.settings.getByKey, { key: 'announcementBannerText' });

  if (maintenanceMode?.value === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-primary font-sans text-center px-4">
        <div>
          <h1 className="text-2xl font-serif mb-4">Under Maintenance</h1>
          <p>Gabby Newluk is currently undergoing maintenance. Please check back soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 flex flex-col min-h-screen">
      {isBannerActive?.value === true && announcementBannerText?.value && (
        <div className="bg-primary text-on-primary text-xs tracking-widest uppercase text-center py-2 px-4 font-label">
          {announcementBannerText.value}
        </div>
      )}
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
