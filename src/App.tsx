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
const HowToMeasure = lazy(() => import('./pages/HowToMeasure'));
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
const Legal = lazy(() => import('./pages/Legal'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'));

const Admin = lazy(() => import('./pages/Admin'));

import ScrollToTop from './components/ScrollToTop';
import { useUser } from '@clerk/clerk-react';

function UserSync() {
  const { user, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);
  const hasSynced = React.useRef(false);

  useEffect(() => {
    if (isLoaded && user && !hasSynced.current) {
      hasSynced.current = true;
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      }).catch(() => {}); // Silently fail — non-critical
    }
  }, [isLoaded, user]);

  return null;
}

import { useCartStore } from './store/cartStore';

function CartSync() {
  const { user, isLoaded } = useUser();
  const cartItems = useCartStore(state => state.items);
  const syncCart = useMutation(api.carts.syncCart);
  const dbCartItems = useQuery(api.carts.getCart);
  
  const hasSyncedInitial = React.useRef(false);

  // Initial load from DB -> Zustand
  useEffect(() => {
    if (isLoaded && user && dbCartItems !== undefined && !hasSyncedInitial.current) {
      if (dbCartItems.length > 0) {
        useCartStore.setState({ items: dbCartItems as any });
      }
      hasSyncedInitial.current = true;
    }
  }, [isLoaded, user, dbCartItems]);

  // Sync Zustand -> DB when items change
  useEffect(() => {
    if (isLoaded && user && hasSyncedInitial.current) {
      syncCart({ items: cartItems as any }).catch(() => {});
    }
  }, [cartItems, isLoaded, user]);

  return null;
}

import { useCurrencyStore } from './store/currencyStore';

function CurrencySync() {
  const dbRates = useQuery(api.currency.getRates);
  const setRates = useCurrencyStore(state => state.setRates);
  const hasSynced = React.useRef(false);

  useEffect(() => {
    if (dbRates && Object.keys(dbRates).length > 0 && !hasSynced.current) {
      setRates(dbRates as Record<string, number>);
      hasSynced.current = true;
    }
  }, [dbRates, setRates]);

  return null;
}

import CookieBanner from './components/CookieBanner';
import NewsFlashModal from './components/NewsFlashModal';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <UserSync />
      <CartSync />
      <CurrencySync />
      <CookieBanner />
      <NewsFlashModal />
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
          <Route path="/studio" element={<CustomTailoring />} />
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
          <Route path="/how-to-measure" element={<HowToMeasure />} />
          <Route path="/shipping" element={<ShippingReturns />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/news/:slug" element={<NewsArticlePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
