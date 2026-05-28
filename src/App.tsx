import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import PublicLayout from './layouts/PublicLayout';
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../convex/_generated/api';


// Public Pages
const Home = lazy(() => import('./pages/Home'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CustomTailoring = lazy(() => import('./pages/CustomTailoring'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const StoryPage = lazy(() => import('./pages/StoryPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Success = lazy(() => import('./pages/Success'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Contact = lazy(() => import('./pages/Contact'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));

// Static Info Pages
const SizeGuide = lazy(() => import('./pages/SizeGuide'));
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
const Legal = lazy(() => import('./pages/Legal'));

const Admin = lazy(() => import('./pages/Admin'));

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
        <Route path="/admin/*" element={
          <Suspense fallback={
            <div className="min-h-screen bg-surface-container/30 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <Admin />
          </Suspense>
        } />

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
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/success" element={<Success />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<BookAppointment />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
