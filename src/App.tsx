import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SyncUser from "./components/SyncUser";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/toast";

import Home from "./pages/Home";
import ShopAll from "./pages/ShopAll";
import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SizeGuide from "./pages/SizeGuide";
import ShippingReturns from "./pages/ShippingReturns";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import BookAppointment from "./pages/BookAppointment";
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Collections from "./pages/Collections";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <SyncUser />
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col">
          <Header />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<ShopAll />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/account" element={<Account />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/search" element={<Search />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;