import React, { Suspense, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageLoadingSkeleton from '../components/PageLoadingSkeleton';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { ArrowUpRight, Cog, Mail, Sparkles, X } from 'lucide-react';
import logo from '../assets/logo_transparent.png';

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
      <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#f4ebd9] px-6 text-[#352421]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full border border-[#c5a059]/20" />
          <div className="absolute -left-28 top-[30%] h-72 w-72 rounded-full border border-[#c5a059]/20" />
          <div className="absolute -right-48 -top-40 h-[34rem] w-[34rem] rounded-full border border-[#352421]/[0.08]" />
          <div className="absolute -right-28 -top-20 h-[26rem] w-[26rem] rounded-full border border-[#352421]/[0.08]" />
          <div className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-white/45 to-transparent" />
        </div>

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between border-b border-[#352421]/10 py-5 sm:py-7">
          <a href="/" aria-label="Gabby Newluk home" className="flex items-center gap-2.5 sm:gap-3">
            <img src={logo} alt="" className="h-9 w-9 object-contain sm:h-11 sm:w-11" />
            <span className="font-serif text-xl italic tracking-tight sm:text-2xl">Gabby Newluk</span>
          </a>
          <span className="hidden font-label text-[10px] font-bold uppercase tracking-[0.22em] text-[#735c00] sm:block">
            Accra · Ghana
          </span>
        </header>

        <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center py-14 text-center sm:py-20">
          <div className="relative mb-9 flex h-36 w-36 items-center justify-center rounded-full border border-[#c5a059]/50 bg-[#fdfdfb]/55 shadow-[0_20px_70px_rgba(53,36,33,0.08)] sm:mb-12 sm:h-44 sm:w-44">
            <div aria-hidden="true" className="absolute inset-2 rounded-full border border-dashed border-[#c5a059]/45" />
            <Cog aria-hidden="true" className="absolute left-5 top-5 h-8 w-8 animate-spin text-[#735c00] motion-reduce:animate-none sm:left-6 sm:top-6 sm:h-9 sm:w-9" strokeWidth={1.2} />
            <Cog aria-hidden="true" className="absolute bottom-5 right-5 h-7 w-7 animate-[spin_9s_linear_infinite_reverse] text-[#352421]/70 motion-reduce:animate-none sm:bottom-6 sm:right-6 sm:h-8 sm:w-8" strokeWidth={1.2} />
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#352421] text-[#f4ebd9] sm:h-24 sm:w-24">
              <Sparkles aria-hidden="true" className="h-9 w-9" strokeWidth={1.1} />
            </div>
          </div>

          <p className="mb-4 font-label text-[10px] font-bold uppercase tracking-[0.3em] text-[#735c00] sm:text-xs">
            A little care behind the scenes
          </p>
          <h1 className="max-w-3xl font-serif text-5xl italic leading-[1.02] tracking-[-0.045em] sm:text-7xl md:text-8xl">
            Our atelier is <span className="text-[#735c00]">stitching</span> things together.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-[#504443] sm:mt-8 sm:text-base sm:leading-8">
            We’re making a few thoughtful updates behind the scenes. The storefront will be back shortly. Thank you for giving us a little time.
          </p>

          <a
            href="mailto:hello@gabbynewluk.com?subject=Hello%20Gabby%20Newluk"
            className="group mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#352421] px-6 py-3 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#735c00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#735c00] sm:mt-10 sm:px-7"
          >
            <Mail aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
            Contact our team
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.7} />
          </a>
        </section>

        <footer className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 border-t border-[#352421]/10 py-5 text-center sm:flex-row sm:py-6 sm:text-left">
          <p className="font-label text-[9px] font-bold uppercase tracking-[0.2em] text-[#504443]/75">
            © {new Date().getFullYear()} Gabby Newluk
          </p>
          <p className="font-serif text-sm italic text-[#504443]">Crafted in Accra, worn globally.</p>
        </footer>
      </main>
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
