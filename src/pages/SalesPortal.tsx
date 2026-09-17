import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { ShoppingBag, Search, Plus, CreditCard, LogOut, Calendar } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function SalesPortal() {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const products = useQuery(api.products.getActive) || [];
  const createPOSOrder = useMutation(api.orders.createPOSOrder);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  
  // POS State
  const [cart, setCart] = useState<{product: any, quantity: number, price: number}[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLoaded || (user && convexUser === undefined)) {
    return <div className="min-h-screen bg-surface flex items-center justify-center font-sans tracking-widest text-primary text-sm uppercase">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <ShoppingBag className="w-12 h-12 mb-4 text-outline" />
        <h1 className="font-serif text-3xl mb-2 text-primary">Sales Portal</h1>
        <p className="text-on-surface-variant mb-8">Please sign in to access the point of sale.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/sales">
          <button className="px-6 py-3 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors rounded-none">
            Log In
          </button>
        </SignInButton>
      </div>
    );
  }

  // Basic check: must be staff
  if (!convexUser?.roleId && convexUser?.role === 'client') {
    return <Navigate to="/" replace />;
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.product._id === product._id);
    if (existing) {
      setCart(cart.map(c => c.product._id === product._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { product, quantity: 1, price: product.basePrice }]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(c => c.product._id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.product._id === productId) {
        const newQ = Math.max(1, c.quantity + delta);
        return { ...c, quantity: newQ };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!customerName || !customerEmail) return toast.error("Customer name and email required");

    setIsProcessing(true);
    try {
      await createPOSOrder({
        customerDetails: {
          firstName: customerName.split(' ')[0],
          lastName: customerName.split(' ').slice(1).join(' ') || 'Customer',
          email: customerEmail,
          phone: customerPhone,
        },
        items: cart.map(c => ({
          productId: c.product._id,
          productName: c.product.name,
          quantity: c.quantity,
          price: c.price,
        })),
        shippingFee: 0,
        amountPaid: cartTotal,
        amountDue: 0,
        isDeposit: false,
        paymentMethod,
      });

      toast.success("Order recorded successfully!");
      setCart([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setActiveTab('history');
    } catch (err: any) {
      toast.error(err.message || "Failed to record order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest font-sans flex flex-col">
      <header className="bg-surface border-b border-surface-variant px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="font-serif text-2xl text-primary tracking-tight">Sales POS</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-primary hidden sm:block">Welcome, {user.firstName}</span>
          <a href="/" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Exit
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Products */}
        <div className="flex-1 flex flex-col border-r border-surface-variant bg-surface-container-lowest">
          <div className="p-4 border-b border-surface-variant flex gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface-container text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex bg-surface-container rounded-sm border border-outline-variant p-1">
              <button 
                onClick={() => setActiveTab('pos')}
                className={`px-4 py-1 text-xs uppercase tracking-widest ${activeTab === 'pos' ? 'bg-primary text-surface' : 'text-primary'}`}
              >
                POS
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-1 text-xs uppercase tracking-widest ${activeTab === 'history' ? 'bg-primary text-surface' : 'text-primary'}`}
              >
                History
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'pos' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product._id} className="border border-outline-variant/30 bg-surface p-3 flex flex-col group cursor-pointer hover:border-primary transition-colors" onClick={() => addToCart(product)}>
                    <div className="aspect-square bg-surface-container mb-3 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-outline text-xs">No image</div>
                      )}
                    </div>
                    <h3 className="font-bold text-xs uppercase text-primary line-clamp-1">{product.name}</h3>
                    <p className="text-on-surface-variant text-sm mt-1">₵{product.basePrice.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'history' && (
              <div className="text-center py-20 text-on-surface-variant">
                <p>History view is under construction.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Cart & Checkout */}
        <div className="w-96 flex flex-col bg-surface shadow-xl z-10">
          <div className="p-4 border-b border-surface-variant">
            <h2 className="font-bold uppercase tracking-widest text-primary text-sm">Current Order</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center text-on-surface-variant py-10 text-sm">Cart is empty</div>
            ) : (
              cart.map(item => (
                <div key={item.product._id} className="flex justify-between items-center border-b border-outline-variant/20 pb-3">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase text-primary truncate">{item.product.name}</h4>
                    <p className="text-on-surface-variant text-xs mt-1">₵{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-outline-variant">
                      <button onClick={() => updateQuantity(item.product._id, -1)} className="px-2 py-1 text-primary hover:bg-surface-container">-</button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product._id, 1)} className="px-2 py-1 text-primary hover:bg-surface-container">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.product._id)} className="text-error text-xs hover:underline">Remove</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-surface-variant bg-surface-container-lowest space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Name *</label>
              <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-surface border border-outline-variant text-sm p-2" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Email *</label>
              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full bg-surface border border-outline-variant text-sm p-2" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Phone</label>
              <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-surface border border-outline-variant text-sm p-2" placeholder="050 000 0000" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-surface border border-outline-variant text-sm p-2">
                <option value="cash">Cash</option>
                <option value="momo">MoMo / Transfer (Manual)</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center py-2 border-t border-outline-variant/30 mt-2">
              <span className="font-bold text-sm uppercase tracking-widest text-primary">Total</span>
              <span className="font-serif text-2xl text-primary">₵{cartTotal.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              className="w-full py-3 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
