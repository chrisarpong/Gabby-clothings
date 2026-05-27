import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PublicLayout() {
  return (
    <div className="bg-surface text-on-surface font-sans antialiased selection:bg-primary/20 flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
