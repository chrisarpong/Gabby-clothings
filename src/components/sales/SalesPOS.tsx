import React, { useEffect, useRef, useState } from 'react';
import { useStaffAuth } from '../../hooks/useStaffAuth';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { ShoppingBag, Search, Plus, CreditCard, LogOut, Calendar } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStaffQuery, useStaffMutation, useStaffAction } from "../../hooks/useStaffAuth";

export default function SalesPOS({ products, setActiveTab }: { products: any, setActiveTab: any }) {
  const { token, profile } = useStaffAuth();
  const createPOSOrder = useStaffMutation(api.orders.createPOSOrder);
  
  // POS State
  const [cart, setCart] = useState<{id: string, product?: any, quantity: number, price: number, variantSku?: string, variantName?: string, isCustom?: boolean, name?: string, notes?: string, unitPriceOverride?: number, overrideReason?: string}[]>(() => {
    const saved = sessionStorage.getItem(`pos_cart_${profile?._id || 'staff'}`);
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((line: any) => ({ ...line, id: line.id || crypto.randomUUID() }));
  });
  const [customerName, setCustomerName] = useState(() => sessionStorage.getItem(`pos_customerName_${profile?._id || 'staff'}`) || '');
  const [customerEmail, setCustomerEmail] = useState(() => sessionStorage.getItem(`pos_customerEmail_${profile?._id || 'staff'}`) || '');
  const [customerPhone, setCustomerPhone] = useState(() => sessionStorage.getItem(`pos_customerPhone_${profile?._id || 'staff'}`) || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [payInFull, setPayInFull] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [customJobOpen, setCustomJobOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1');
  const [customNotes, setCustomNotes] = useState('');
  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const submitGuardRef = useRef(false);

  // Persist state
  React.useEffect(() => {
    sessionStorage.setItem(`pos_cart_${profile?._id || 'staff'}`, JSON.stringify(cart));
    sessionStorage.setItem(`pos_customerName_${profile?._id || 'staff'}`, customerName);
    sessionStorage.setItem(`pos_customerEmail_${profile?._id || 'staff'}`, customerEmail);
    sessionStorage.setItem(`pos_customerPhone_${profile?._id || 'staff'}`, customerPhone);
  }, [cart, customerName, customerEmail, customerPhone, profile?._id]);
  const saleSignature = JSON.stringify({
    cart: cart.map(item => ({ id: item.product?._id, sku: item.variantSku, quantity: item.quantity, price: item.price, override: item.unitPriceOverride, name: item.name, notes: item.notes })),
    customerName, customerEmail, customerPhone, paymentMethod, payInFull, depositAmount,
  });
  const previousSaleSignatureRef = useRef(saleSignature);
  useEffect(() => {
    if (previousSaleSignatureRef.current !== saleSignature) {
      idempotencyKeyRef.current = crypto.randomUUID();
      previousSaleSignatureRef.current = saleSignature;
    }
  }, [saleSignature]);

  useEffect(() => {
    if (!products?.length) return;
    let removed = 0;
    let changed = 0;
    let summary = '';
    setCart(previous => {
      let didChange = false;
      const next = previous.flatMap(item => {
      if (item.isCustom) return [item];
      const live = products.find((p: any) => p._id === item.product?._id && p.status === 'active');
      if (!live) { removed++; didChange = true; return []; }
      if (live.variants?.length && (!item.variantSku || !live.variants.some((v: any) => v.sku === item.variantSku))) { removed++; didChange = true; return []; }
      const variant = item.variantSku ? live.variants?.find((v: any) => v.sku === item.variantSku) : undefined;
      const available: number = Number(variant?.stock ?? live.stock);
      if (Number.isFinite(available) && available <= 0) { removed++; didChange = true; return []; }
      const quantity = Number.isFinite(available) ? Math.min(item.quantity, Math.max(1, available)) : item.quantity;
      if (quantity !== item.quantity || item.price !== (item.unitPriceOverride ?? live.basePrice) || item.product?._id !== live._id || item.product?.basePrice !== live.basePrice) { didChange = true; summary = 'Cart updated from current inventory'; }
      return [{ ...item, product: live, price: item.unitPriceOverride ?? live.basePrice, quantity }];
      });
      if (removed) summary = `${removed} unavailable item${removed === 1 ? '' : 's'} removed`;
      return didChange ? next : previous;
    });
    if (summary) toast.info(summary);
  }, [products]);
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedVariantSku, setSelectedVariantSku] = useState<string>('');

  const categories = ['All', ...Array.from(new Set(products.map((p: any) => p.category as string)))];

  const filteredProducts = products.filter((p: any) => {
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
    if (product.variants?.length && !variantSku) { toast.error('Choose a variant first'); return; }
    const existing = cart.find(c => c.product._id === product._id && c.variantSku === variantSku);
    if (existing) {
      setCart(cart.map(c => (c.product?._id === product._id && c.variantSku === variantSku) ? { ...c, quantity: Math.min(50, c.quantity + 1) } : c));
    } else {
      let variantName = '';
      if (variantSku && product.variants) {
        const v = product.variants.find((v: any) => v.sku === variantSku);
        if (v) variantName = `${v.color} - ${v.size}`;
      }
      setCart([...cart, { id: crypto.randomUUID(), product, variantSku, variantName, quantity: 1, price: product.basePrice }]);
    }
    toast.success(`${product.name} added to cart`);
    setSelectedProduct(null);
  };

  const removeFromCart = (lineId: string) => {
    setCart(cart.filter(c => c.id !== lineId));
  };

  const updatePriceOverride = (index: number, value: string) => {
    const parsed = value === '' ? undefined : Number(value);
    setCart(previous => previous.map((item, i) => i === index ? { ...item, unitPriceOverride: parsed, price: parsed ?? item.product?.basePrice ?? item.price } : item));
  };

  const updateQuantity = (lineId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === lineId) {
        const variant = c.variantSku ? c.product?.variants?.find((v: any) => v.sku === c.variantSku) : undefined;
        const max = Math.min(50, variant?.stock ?? c.product?.stock ?? 50);
        const newQ = Math.min(max, Math.max(1, c.quantity + delta));
        return { ...c, quantity: newQ };
      }
      return c;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  const salesMin = (item: any) => (item.product?.basePrice || 0) * 0.8;

  const addCustomJob = () => {
    const price = Number(customPrice); const quantity = Number(customQuantity);
    if (!customName.trim() || customName.trim().length > 100 || !Number.isFinite(price) || price < 0.01 || price > 1_000_000 || Math.round(price * 100) !== price * 100 || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      toast.error('Custom job requires a name (1-100), price (0.01-1,000,000 with max 2 decimals), and quantity (1-50).'); return;
    }
    setCart(previous => [...previous, { id: crypto.randomUUID(), isCustom: true, name: customName.trim(), price, unitPriceOverride: price, quantity, notes: customNotes.trim() || undefined }]);
    setCustomName(''); setCustomPrice(''); setCustomQuantity('1'); setCustomNotes(''); setCustomJobOpen(false);
  };

  const handleCheckout = async () => {
    if (submitGuardRef.current) return;
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!customerName.trim()) return toast.error("Customer name required");
    if (!emailValid) return toast.error("Enter a valid customer email");
    for (const item of cart) {
      if (!item.isCustom && item.unitPriceOverride !== undefined) {
        const minimum = profile?.role === 'sales' ? salesMin(item) : 0;
        if (item.unitPriceOverride < minimum || item.unitPriceOverride > (item.product?.basePrice ?? 0) || Math.round(item.unitPriceOverride * 100) !== item.unitPriceOverride * 100) return toast.error(`Price for ${item.product?.name} must be between ₵${minimum.toFixed(2)} and ₵${item.product?.basePrice?.toFixed(2)}.`);
      }
    }
    if (!payInFull && !(Number(depositAmount) > 0 && Number(depositAmount) < cartTotal)) return toast.error("Deposit must be greater than zero and less than the total.");
    if (payInFull && paymentMethod === "cash" && amountTendered !== "" && Number(amountTendered) < cartTotal) return toast.error("Amount tendered is below the total.");

    submitGuardRef.current = true;
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
          productId: c.isCustom ? undefined : c.product?._id,
          name: c.isCustom ? c.name : undefined,
          unitPriceOverride: c.unitPriceOverride,
          notes: c.notes,
          variantSku: c.isCustom ? undefined : (c.variantSku || undefined),
          quantity: c.quantity,
          overrideReason: c.overrideReason,
        })),
        payInFull,
        amountPaid: payInFull ? undefined : Number(depositAmount),
        paymentMethod: paymentMethod === 'cash' || paymentMethod === 'momo' || paymentMethod === 'transfer' ? paymentMethod : 'cash',
        idempotencyKey: idempotencyKeyRef.current,
      });

      toast.success("Order recorded successfully!");
      setCart([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setAmountTendered('');
      const key = profile?._id || 'staff';
      sessionStorage.removeItem(`pos_cart_${key}`);
      sessionStorage.removeItem(`pos_customerName_${key}`);
      sessionStorage.removeItem(`pos_customerEmail_${key}`);
      sessionStorage.removeItem(`pos_customerPhone_${key}`);
      setActiveTab('history');
    } catch (err: any) {
      toast.error(err.message || "Failed to record order");
    } finally {
      setIsProcessing(false);
      submitGuardRef.current = false;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full">
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
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(categories as string[]).map((cat: string) => (
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
          </div>

          <div className="flex-1 overflow-y-auto p-4 relative">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product: any) => (
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
              <button type="button" onClick={() => setCustomJobOpen(value => !value)} className="w-full border border-primary px-3 py-2 text-xs uppercase tracking-widest text-primary">{customJobOpen ? 'Close custom job' : 'Add custom job'}</button>
              {customJobOpen && <div className="space-y-2 border border-outline-variant/30 p-3">
                <input value={customName} onChange={e => setCustomName(e.target.value)} maxLength={100} placeholder="Job name" className="w-full border p-2 text-sm" />
                <input value={customPrice} onChange={e => setCustomPrice(e.target.value)} type="number" min="0.01" step="0.01" placeholder="Price (GHS)" className="w-full border p-2 text-sm" />
                <input value={customQuantity} onChange={e => setCustomQuantity(e.target.value)} type="number" min="1" max="50" placeholder="Quantity" className="w-full border p-2 text-sm" />
                <input value={customNotes} onChange={e => setCustomNotes(e.target.value)} maxLength={200} placeholder="Notes" className="w-full border p-2 text-sm" />
                <button type="button" onClick={addCustomJob} className="bg-primary text-surface px-3 py-2 text-xs uppercase tracking-widest">Add job</button>
              </div>}
            {cart.length === 0 ? (
              <div className="text-center text-on-surface-variant py-6 text-sm bg-surface-container-lowest border border-outline-variant/20">Cart is empty</div>
            ) : (
              <div className="space-y-4 mb-6 border border-outline-variant/30 p-3 bg-surface-container-lowest">
                {cart.map((item, idx) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-outline-variant/20 pb-3 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold uppercase text-primary truncate">{item.isCustom ? item.name : item.product?.name}</h4>
                      {item.isCustom && <span className="text-[10px] uppercase tracking-widest text-primary">Custom job</span>}
                      {item.variantName && (
                        <p className="text-[10px] uppercase text-on-surface-variant mt-0.5">{item.variantName}</p>
                      )}
                      <p className="text-on-surface-variant text-xs mt-1">₵{item.price.toLocaleString()}</p>
                      {!item.isCustom && <div className="mt-1"><label className="text-[9px] uppercase text-on-surface-variant">Adjust price</label><input type="number" step="0.01" min={salesMin(item)} max={item.product?.basePrice} value={item.unitPriceOverride ?? ''} onChange={e => updatePriceOverride(idx, e.target.value)} className="ml-1 w-20 border p-1 text-xs" placeholder="Optional" /><input maxLength={200} value={item.overrideReason || ''} onChange={e => setCart(previous => previous.map((line, i) => i === idx ? { ...line, overrideReason: e.target.value } : line))} className="ml-1 w-24 border p-1 text-xs" placeholder="Reason" /><p className="text-[9px] text-on-surface-variant">Sales range ₵{salesMin(item).toFixed(2)}–₵{item.product?.basePrice?.toFixed(2)}</p></div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-outline-variant bg-surface">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 text-primary hover:bg-surface-container">-</button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 text-primary hover:bg-surface-container">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-error text-xs hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Name *</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" />
                {!customerName.trim() && <p className="text-[10px] text-error mt-1">Customer name is required.</p>}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Email *</label>
                <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" />
                {customerEmail.length > 0 && !emailValid && <p className="text-[10px] text-error mt-1">Enter a valid email address.</p>}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Customer Phone</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors">
                  <option value="cash">Cash</option>
                  <option value="momo">MoMo</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              <div className="flex gap-3 text-xs">
                <button type="button" onClick={() => setPayInFull(true)} className={payInFull ? 'font-bold text-primary' : 'text-on-surface-variant'}>Pay in full</button>
                <button type="button" onClick={() => setPayInFull(false)} className={!payInFull ? 'font-bold text-primary' : 'text-on-surface-variant'}>Deposit</button>
              </div>
              {!payInFull && <input type="number" min="0.01" max={cartTotal - 0.01} value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="Deposit amount" className="w-full bg-surface-container-lowest border border-outline-variant/50 text-sm p-3" />}

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Amount Tendered</label>
                  <input 
                    type="number" 
                    value={amountTendered} 
                    onChange={e => setAmountTendered(e.target.value)} 
                    placeholder="Enter amount paid..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary text-sm p-3 focus:outline-none transition-colors" 
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-2 py-4 border-t border-outline-variant/30 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm uppercase tracking-widest text-primary">Total</span>
                  <span className="font-serif text-2xl text-primary">₵{cartTotal.toLocaleString()}</span>
                </div>
                
                {paymentMethod === 'cash' && amountTendered !== '' && (
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span className="font-bold text-[10px] uppercase tracking-widest">Change / Balance</span>
                    <span className="font-mono text-lg text-primary">
                      ₵{Math.max(0, Number(amountTendered) - cartTotal).toFixed(2)}
                    </span>
                  </div>
                )}
                {!payInFull && <div className="flex justify-between text-xs text-on-surface-variant"><span>Balance due</span><span>₵{Math.max(0, cartTotal - Number(depositAmount || 0)).toFixed(2)}</span></div>}
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0 || !customerName.trim() || !emailValid || (payInFull && paymentMethod === 'cash' && amountTendered !== '' && Number(amountTendered) < cartTotal) || (!payInFull && !(Number(depositAmount) > 0 && Number(depositAmount) < cartTotal))}
                className="w-full py-4 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
