import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { X, User, ShoppingBag, CreditCard, ChevronRight, Ruler } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

interface AdminCreateOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCreateOrderDrawer({ isOpen, onClose }: AdminCreateOrderDrawerProps) {
  const users = useQuery(api.users.getAll) || [];
  const products = useQuery(api.products.getAll) || [];
  const createOrder = useMutation(api.orders.createPOSOrder);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [productType, setProductType] = useState('catalog'); // 'catalog' | 'custom'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [overridePrice, setOverridePrice] = useState('');
  
  const [measurements, setMeasurements] = useState<Record<string, string>>({
    chest: '', waist: '', hips: '', shoulder: '', sleeve: '', inseam: '', neck: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [paymentStructure, setPaymentStructure] = useState('full'); // 'full' or 'deposit'

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedUser(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setProductType('catalog');
      setSelectedProductId('');
      setCustomProductName('');
      setOverridePrice('');
      setMeasurements({ chest: '', waist: '', hips: '', shoulder: '', sleeve: '', inseam: '', neck: '' });
      setPaymentMethod('paystack');
      setPaymentStructure('full');
    }
  }, [isOpen]);

  const handleUserSelect = (userId: string) => {
    const user = users.find((u: any) => u._id === userId);
    if (user) {
      setSelectedUser(user);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    } else {
      setSelectedUser(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMeasurements({ chest: '', waist: '', hips: '', shoulder: '', sleeve: '', inseam: '', neck: '' });
    }
  };

  const product = products.find((p: any) => p._id === selectedProductId);
  const finalPrice = productType === 'catalog' 
    ? (overridePrice ? Number(overridePrice) : (product?.basePrice || 0))
    : Number(overridePrice);
  const amountToCharge = paymentStructure === 'deposit' ? finalPrice / 2 : finalPrice;

  const handlePaystackSuccess = async (reference: string) => {
    try {
      setIsSubmitting(true);
      await createOrder({
        userId: selectedUser?._id,
        customerDetails: { email, firstName, lastName, phone },
        items: [{
          productId: productType === 'catalog' ? (selectedProductId as any) : undefined,
          quantity: 1,
          productName: productType === 'catalog' ? (product?.name || 'Custom Item') : customProductName,
          price: finalPrice,
          measurements: Object.values(measurements).some(v => v) ? measurements : undefined,
        }],
        shippingFee: 0,
        amountPaid: amountToCharge,
        amountDue: finalPrice - amountToCharge,
        isDeposit: paymentStructure === 'deposit',
        paymentMethod: 'paystack',
        paystackReference: reference
      });
      toast.success("Order created successfully!");
      onClose();
    } catch (e) {
      toast.error("Failed to finalize order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualPayment = async () => {
    try {
      setIsSubmitting(true);
      await createOrder({
        userId: selectedUser?._id,
        customerDetails: { email, firstName, lastName, phone },
        items: [{
          productId: productType === 'catalog' ? (selectedProductId as any) : undefined,
          quantity: 1,
          productName: productType === 'catalog' ? (product?.name || 'Custom Item') : customProductName,
          price: finalPrice,
          measurements: Object.values(measurements).some(v => v) ? measurements : undefined,
        }],
        shippingFee: 0,
        amountPaid: amountToCharge,
        amountDue: finalPrice - amountToCharge,
        isDeposit: paymentStructure === 'deposit',
        paymentMethod: paymentMethod,
      });
      toast.success(`Order created successfully via ${paymentMethod}!`);
      onClose();
    } catch (e) {
      toast.error("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paystack Config
  const paystackConfig = {
    reference: `manual_${new Date().getTime()}`,
    email: email || 'pos@gabby.com',
    amount: amountToCharge * 100, // in pesewas
    currency: 'GHS',
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleSubmitPayment = () => {
    if (paymentMethod === 'paystack') {
      initializePayment({
        onSuccess: (ref: any) => handlePaystackSuccess(ref.reference),
        onClose: () => toast.error("Payment window closed"),
      });
    } else {
      handleManualPayment();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-surface-container-lowest shadow-2xl z-[110] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
              <h2 className="font-serif text-2xl text-primary">Tailor's Office</h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-variant/30 rounded-full transition-colors text-on-surface-variant">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Step 1: Client */}
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <User className="w-5 h-5" /> 1. Client Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Select Existing Client (Optional)</label>
                      <select 
                        className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm"
                        onChange={(e) => handleUserSelect(e.target.value)}
                        value={selectedUser?._id || ''}
                      >
                        <option value="">-- New Walk-in Client --</option>
                        {users.map((u: any) => (
                          <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">First Name *</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder="John" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Last Name *</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder="Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Email *</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder="john@example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder="+233..." />
                    </div>
                  </div>
                  <button 
                    disabled={!firstName || !lastName || !email}
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Next: Product Selection <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: Product */}
              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> 2. Product Selection
                  </h3>
                  
                  <div className="flex bg-surface-container rounded-xl p-1 mb-4">
                    <button 
                      onClick={() => setProductType('catalog')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${productType === 'catalog' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      Select from Catalog
                    </button>
                    <button 
                      onClick={() => setProductType('custom')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${productType === 'custom' ? 'bg-primary text-white shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                    >
                      New Custom-Fit Commission
                    </button>
                  </div>

                  <div className="space-y-4">
                    {productType === 'catalog' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-on-surface-variant mb-1">Select Product Base *</label>
                          <select 
                            className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm"
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            value={selectedProductId}
                          >
                            <option value="">-- Choose Product --</option>
                            {products.map((p: any) => (
                              <option key={p._id} value={p._id}>{p.name} - GHS {p.basePrice}</option>
                            ))}
                          </select>
                        </div>
                        {selectedProductId && (
                          <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Custom Price Override (Optional)</label>
                            <input type="number" value={overridePrice} onChange={e => setOverridePrice(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder={`GHS ${product?.basePrice}`} />
                            <p className="text-xs text-on-surface-variant mt-1">Leave blank to use default base price.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-on-surface-variant mb-1">Garment Name/Description *</label>
                          <input type="text" value={customProductName} onChange={e => setCustomProductName(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder="e.g. 3-Piece Agbada with Gold Embroidery" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-on-surface-variant mb-1">Agreed Price (GHS) *</label>
                          <input type="number" value={overridePrice} onChange={e => setOverridePrice(e.target.value)} className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm" placeholder="1500" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 bg-surface-variant/30 text-on-surface rounded-xl font-medium">Back</button>
                    <button 
                      disabled={productType === 'catalog' ? !selectedProductId : (!customProductName || !overridePrice)}
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      Next: Measurements <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Measurements */}
              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <User className="w-5 h-5" /> 3. Digital Tape Measure
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(measurements).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1 capitalize">{key}</label>
                        <input 
                          type="text" 
                          value={measurements[key]} 
                          onChange={e => setMeasurements({...measurements, [key]: e.target.value})} 
                          className="w-full p-3 bg-surface-container border border-outline-variant/50 rounded-xl text-sm font-mono" 
                          placeholder='e.g. 42"' 
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 bg-surface-variant/30 text-on-surface rounded-xl font-medium">Back</button>
                    <button 
                      onClick={() => setStep(4)}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2"
                    >
                      Next: Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> 4. Payment Processing
                  </h3>
                  
                  <div className="p-4 bg-surface-variant/10 border border-outline-variant/30 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Product:</span>
                      <span className="font-medium text-on-surface">{productType === 'catalog' ? product?.name : customProductName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Total Price:</span>
                      <span className="font-medium text-on-surface">GHS {finalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-2">Payment Structure</label>
                      <div className="flex gap-4">
                        <label className="flex-1 flex items-center p-3 bg-surface-container border border-outline-variant/50 rounded-xl cursor-pointer">
                          <input type="radio" checked={paymentStructure === 'full'} onChange={() => setPaymentStructure('full')} className="mr-2" />
                          <span className="text-sm font-medium">Full (100%)</span>
                        </label>
                        <label className="flex-1 flex items-center p-3 bg-surface-container border border-outline-variant/50 rounded-xl cursor-pointer">
                          <input type="radio" checked={paymentStructure === 'deposit'} onChange={() => setPaymentStructure('deposit')} className="mr-2" />
                          <span className="text-sm font-medium">Deposit (50%)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-on-surface-variant mb-2">Payment Method</label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 bg-surface-container border border-outline-variant/50 rounded-xl cursor-pointer">
                          <input type="radio" checked={paymentMethod === 'paystack'} onChange={() => setPaymentMethod('paystack')} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium block">Paystack (MoMo / Card)</span>
                            <span className="text-xs text-on-surface-variant">Triggers online prompt for client</span>
                          </div>
                        </label>
                        <label className="flex items-center p-3 bg-surface-container border border-outline-variant/50 rounded-xl cursor-pointer">
                          <input type="radio" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium block">Cash</span>
                            <span className="text-xs text-on-surface-variant">Physical cash received</span>
                          </div>
                        </label>
                        <label className="flex items-center p-3 bg-surface-container border border-outline-variant/50 rounded-xl cursor-pointer">
                          <input type="radio" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium block">Direct Bank Transfer</span>
                            <span className="text-xs text-on-surface-variant">Manual transfer verification</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-xl flex items-center justify-between">
                      <span className="text-primary font-medium">Amount to Charge Now:</span>
                      <span className="text-xl font-bold text-primary">GHS {amountToCharge.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(3)} className="flex-1 py-3 bg-surface-variant/30 text-on-surface rounded-xl font-medium">Back</button>
                    <button 
                      onClick={handleSubmitPayment}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-primary text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : `Charge GHS ${amountToCharge.toFixed(2)}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
