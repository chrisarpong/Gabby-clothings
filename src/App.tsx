import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import PublicLayout from './layouts/PublicLayout';
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../convex/_generated/api';


// Public Pages
import Home from './pages/Home';
import CollectionsPage from './pages/CollectionsPage';
import ShopPage from './pages/ShopPage';
import CategoryPage from './pages/CategoryPage';
import CustomTailoring from './pages/CustomTailoring';
import ProductDetailPage from './pages/ProductDetailPage';
import StoryPage from './pages/StoryPage';
import CartPage from './pages/CartPage';
import SearchResults from './pages/SearchResults';
import Success from './pages/Success';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';

// Static Info Pages
import SizeGuide from './pages/SizeGuide';
import ShippingReturns from './pages/ShippingReturns';
import Legal from './pages/Legal';

import Admin from './pages/Admin';

import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-center" toastOptions={{
        className: 'font-sans text-sm rounded-none border border-outline-variant/30 shadow-none bg-surface text-primary',
      }} />
      <Routes>
        {/* Admin Route - Custom State based tabs */}
        <Route path="/admin/*" element={<Admin />} />

        {/* Public Routes - with standard Header/Footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/custom-tailoring" element={<CustomTailoring />} />
          <Route path="/atelier" element={<CustomTailoring />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/success" element={<Success />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
