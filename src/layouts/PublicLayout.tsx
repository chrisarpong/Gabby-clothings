import React, { Suspense, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { X } from 'lucide-react';

export default function PublicLayout() {
  const maintenanceMode = useQuery(api.settings.getByKey, { key: 'maintenanceMode' });
  const isBannerActive = useQuery(api.settings.getByKey, { key: 'isBannerActive' });
  const announcementBannerText = useQuery(api.settings.getByKey, { key: 'announcementBannerText' });

  const [isDismissed, setIsDismissed] = useState(true); // default true to prevent flicker before effect

  useEffect(() => {
    if (!sessionStorage.getItem('gabby_banner_dismissed')) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('gabby_banner_dismissed', 'true');
  };

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
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 flex flex-col min-h-screen watermark-bg">
      {!isDismissed && (isBannerActive?.value === true || isBannerActive?.value === 'true') && announcementBannerText?.value && (
        <div className="bg-primary text-on-primary text-xs tracking-widest uppercase text-center py-2 px-4 font-label relative flex items-center justify-center">
          <span>{announcementBannerText.value}</span>
          <button 
            onClick={handleDismiss} 
            className="absolute right-4 hover:text-surface-tint transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
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
