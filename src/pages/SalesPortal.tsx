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

  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariantSku, setSelectedVariantSku] = useState<string>('');
  
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

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      setSelectedVariantSku(product.variants[0].sku);
    } else {
      setSelectedVariantSku('');
    }
  };

  const addToCart = (product: any, variantSku?: string) => {
    const existing = cart.find(c => c.product._id === product._id && c.variantSku === variantSku);
    if (existing) {
      setCart(cart.map(c => (c.product._id === product._id && c.variantSku === variantSku) ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      let variantName = '';
      if (variantSku && product.variants) {
        const v = product.variants.find((v: any) => v.sku === variantSku);
        if (v) variantName = `${v.color} - ${v.size}`;
      }
      setCart([...cart, { product, variantSku, variantName, quantity: 1, price: product.basePrice }]);
    }
    toast.success(`${product.name} added to cart`);
    setSelectedProduct(null);
  };

  const removeFromCart = (productId: string, variantSku?: string) => {
    setCart(cart.filter(c => !(c.product._id === productId && c.variantSku === variantSku)));
  };

  const updateQuantity = (productId: string, variantSku: string | undefined, delta: number) => {
    setCart(cart.map(c => {
      if (c.product._id === productId && c.variantSku === variantSku) {
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
          variantSku: c.variantSku,
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
        <div className="flex-1 flex flex-col border-r border-surface-variant bg-surface-container-lowest relative">
          <div className="p-4 border-b border-surface-variant flex flex-col gap-4">
            <div className="flex gap-4">
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
            
            {/* Category Filter Tabs */}
            {activeTab === 'pos' && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest whitespace-nowrap border transition-colors ${
                      activeCategory === cat 
                        ? 'border-primary bg-primary text-surface' 
                        : 'border-outline-variant bg-surface text-primary hover:border-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 relative">
            {activeTab === 'pos' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div key={product._id} className="border border-outline-variant/30 bg-surface p-3 flex flex-col group cursor-pointer hover:border-primary transition-colors" onClick={() => openProductModal(product)}>
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

            {/* Product Detail Modal Overlay */}
            {selectedProduct && (
              <div className="absolute inset-0 bg-surface/95 z-20 flex flex-col md:flex-row overflow-y-auto border-t border-outline-variant/20 p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-full md:w-1/2 p-4">
                  <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-sm shadow-sm">
                    {selectedProduct.images?.[0] ? (
                      <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline">No image</div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-4 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{selectedProduct.category}</span>
                      <h2 className="font-serif text-3xl text-primary mt-1">{selectedProduct.name}</h2>
                      <p className="text-xl text-primary mt-2">₵{selectedProduct.basePrice.toLocaleString()}</p>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="text-on-surface-variant hover:text-primary">✕</button>
                  </div>
                  
                  <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Select Variant</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.variants.map((variant: any) => (
                          <button
                            key={variant.sku}
                            onClick={() => setSelectedVariantSku(variant.sku)}
                            disabled={variant.stock === 0}
                            className={`p-3 border text-left text-sm transition-colors ${
                              selectedVariantSku === variant.sku 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-outline-variant bg-surface hover:border-primary disabled:opacity-50 disabled:bg-surface-container disabled:hover:border-outline-variant'
                            }`}
                          >
                            <span className="block font-medium">{variant.color} - {variant.size}</span>
                            <span className="block text-[10px] mt-1 text-on-surface-variant">Stock: {variant.stock}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-6 flex gap-3">
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="px-6 py-3 border border-outline-variant text-primary font-sans text-xs tracking-widest uppercase hover:bg-surface-container transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => addToCart(selectedProduct, selectedVariantSku)}
                      disabled={selectedProduct.variants?.length > 0 && !selectedVariantSku}
                      className="flex-1 py-3 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors disabled:opacity-50"
                    >
                      Add to Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Cart & Checkout */}
        <div className="w-96 flex flex-col bg-surface shadow-xl z-10 overflow-y-auto">
          <div className="p-4 border-b border-surface-variant sticky top-0 bg-surface z-10">
            <h2 className="font-bold uppercase tracking-widest text-primary text-sm">Current Order</h2>
          </div>
          
          <div className="p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center text-on-surface-variant py-6 text-sm bg-surface-container-lowest border border-outline-variant/20">Cart is empty</div>
            ) : (
              <div className="space-y-4 mb-6 border border-outline-variant/30 p-3 bg-surface-container-lowest">
                {cart.map((item, idx) => (
                  <div key={`${item.product._id}-${item.variantSku}-${idx}`} className="flex justify-between items-center border-b border-outline-variant/20 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold uppercase text-primary truncate">{item.product.name}</h4>
                      {item.variantName && (
                        <p className="text-[10px] uppercase text-on-surface-variant mt-0.5">{item.variantName}</p>
                      )}
                      <p className="text-on-surface-variant text-xs mt-1">₵{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-outline-variant bg-surface">
                        <button onClick={() => updateQuantity(item.product._id, item.variantSku, -1)} className="px-2 py-1 text-primary hover:bg-surface-container">-</button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.variantSku, 1)} className="px-2 py-1 text-primary hover:bg-surface-container">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.product._id, item.variantSku)} className="text-error text-xs hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Name *</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Email *</label>
                <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Phone</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors">
                  <option value="cash">Cash</option>
                  <option value="momo">MoMo / Transfer (Manual)</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center py-4 border-t border-outline-variant/30 mt-4">
                <span className="font-bold text-sm uppercase tracking-widest text-primary">Total</span>
                <span className="font-serif text-2xl text-primary">₵{cartTotal.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="w-full py-4 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
