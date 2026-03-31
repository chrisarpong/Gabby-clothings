import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { useCart, type CartItem } from '../context/CartContext';
import { useUser } from '@clerk/react';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useUser();

  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
  const [firstName, setFirstName] = useState(user?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState('');

  const subtotal = cart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
  const delivery = 50.00;
  const total = subtotal + delivery;

  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: total * 100, // Multiplied by 100 for lowest currency unit (Pesewas)
    publicKey: publicKey,
    currency: 'GHS'
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = () => {
    clearCart();
    navigate('/order-confirmation');
  };

  const onClose = () => {
    console.log('Payment closed');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full pt-40 pb-24 bg-[#F5F5F3]"
    >
      <div className="max-w-6xl mx-auto w-full px-6 flex flex-col items-center">
        <h1 
          className="text-[#3a1f1d] text-center w-full mb-16" 
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontStyle: 'italic' }}
        >
          Checkout
        </h1>

        <div className="w-full grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-12 lg:gap-20 items-start">
          
          {/* Left Column (Form) */}
          <div className="w-full">
            <form className="flex flex-col space-y-16" onSubmit={(e) => e.preventDefault()}>
              
              {/* Section 1: Contact Information */}
              <section className="flex flex-col gap-4">
                <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-bold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                    <label className="flex items-center gap-2 cursor-pointer w-fit mt-1">
                      <input type="checkbox" className="w-4 h-4 accent-[#3a1f1d]" defaultChecked />
                      <span className="text-[#3a1f1d] font-[var(--font-sans)] text-sm">Email me a digital receipt.</span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-8">
                    <select className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] outline-none focus:border-[#3a1f1d] transition-colors">
                      <option value="">Select Network Provider (Optional)</option>
                      <option value="mtn">MTN</option>
                      <option value="vodafone">Telecel</option>
                      <option value="airteltigo">AT (AirtelTigo)</option>
                    </select>
                    <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                  </div>
                </div>
              </section>

              {/* Section 2: Shipping Address */}
              <section className="flex flex-col gap-4">
                <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-bold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                  <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                </div>
                <input type="text" placeholder="Address Line 1" className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors mt-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                  <input type="text" placeholder="City" className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                  <input type="text" placeholder="District/State" className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                  <input type="text" placeholder="Country" className="w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-4 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
                </div>
              </section>

              {/* Section 3: Payment */}
              <section className="flex flex-col gap-4">
                <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-bold mb-4">Payment Information</h2>
                <div className="w-full bg-white/40 border border-[#3a1f1d]/10 p-10 flex flex-col items-center justify-center text-[#3a1f1d]/80 font-[var(--font-sans)] text-sm italic py-10 border-dashed">
                  <p>Secure Credit/Debit Card Payment via Paystack</p>
                  <div className="flex items-center gap-3 mt-6">
                    <span style={{ background: '#ffffff', padding: '6px 14px', fontSize: '0.8rem', color: '#3a1f1d', border: '1px solid rgba(58,31,29,0.1)', fontFamily: "'Jost', sans-serif" }}>Card</span>
                    <span style={{ background: '#ffffff', padding: '6px 14px', fontSize: '0.8rem', color: '#3a1f1d', border: '1px solid rgba(58,31,29,0.1)', fontFamily: "'Jost', sans-serif" }}>Mobile Money</span>
                  </div>
                </div>
              </section>

              {/* Account Creation Opt-In */}
              <div className="flex flex-col pt-4">
                <label className="flex items-center gap-4 cursor-pointer w-full p-6 bg-white/40 border border-[#3a1f1d]/10">
                  <input type="checkbox" className="w-5 h-5 accent-[#3a1f1d] cursor-pointer" />
                  <span className="text-[#3a1f1d] font-[var(--font-sans)] text-sm tracking-wide">Create an account to track this order and save my measurements.</span>
                </label>
              </div>

              {/* Confirm Button */}
              <button 
                type="button"
                disabled={!email}
                onClick={() => { initializePayment({ onSuccess, onClose }) }}
                className="block w-full bg-[#3a1f1d] text-[#F5F5F3] py-6 text-center uppercase tracking-[0.3em] font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Confirm Order & Pay
              </button>

            </form>
          </div>

          {/* Right Column (Order Summary) */}
          <div className="w-full bg-transparent border border-[#3a1f1d]/10 p-8 lg:p-10 sticky top-[120px]">
            <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-bold mb-8 text-center sm:text-left">
              Order Summary
            </h2>
            
            {/* Cart Items */}
            <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-[#3a1f1d]/10">
              {cart.length > 0 ? (
                cart.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-white border border-[#3a1f1d]/10 overflow-hidden shrink-0" style={{ width: '60px', aspectRatio: '3/4' }}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1593030761757-71fae46fa0c5?q=80&w=200&auto=format&fit=crop';
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-[var(--font-sans)] font-semibold tracking-wider text-[#3a1f1d] uppercase">{item.name}</span>
                        <span className="text-xs font-[var(--font-sans)] text-[#3a1f1d]/70 mt-1">Quantity: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-[var(--font-sans)] text-[#3a1f1d] font-medium">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm font-[var(--font-sans)] text-[#3a1f1d]/60 italic">Your cart is empty.</div>
              )}
            </div>

            {/* Totals Base */}
            <div className="flex flex-col gap-5 mb-8 font-[var(--font-sans)] text-sm border-b border-[#3a1f1d]/10 pb-8">
              <div className="flex justify-between items-center text-[#3a1f1d]/80">
                <span className="tracking-wider">Subtotal</span>
                <span className="font-medium text-[#3a1f1d]">GH₵ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[#3a1f1d]/80">
                <span className="tracking-wider">Delivery</span>
                <span className="font-medium text-[#3a1f1d]">GH₵ {delivery.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-4 text-[#3a1f1d]">
              <span className="uppercase tracking-widest text-sm font-bold">Total</span>
              <span className="text-2xl font-[var(--font-serif)] italic">GH₵ {total.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
