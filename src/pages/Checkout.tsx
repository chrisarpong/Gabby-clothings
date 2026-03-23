import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { useCart, type CartItem } from '../context/CartContext';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  const subtotal = cart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
  const delivery = 50.00;
  const total = subtotal + delivery;

  const publicKey = "pk_test_YOUR_PAYSTACK_PUBLIC_KEY"; // TODO: Replace with your actual Paystack public key

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
      className="min-h-[100vh] w-full grid grid-cols-1 md:grid-cols-[1.2fr_1fr]"
    >
      {/* Left Column (Form) */}
      <div className="bg-[#F5F5F3]" style={{ padding: '5rem 10%' }}>
        <h1 
          className="text-[#3a1f1d]" 
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '3rem' }}
        >
          Checkout
        </h1>

        <form className="flex flex-col gap-10" onSubmit={(e) => e.preventDefault()}>
          
          {/* Section 1: Contact Information */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-semibold mb-2">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
              <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
            </div>
          </section>

          {/* Section 2: Shipping Address */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-semibold mb-2">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
            </div>
            <input type="text" placeholder="Address Line 1" className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" placeholder="City" className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
              <input type="text" placeholder="District/State" className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
              <input type="text" placeholder="Country" className="w-full bg-transparent border-b border-[#ccc] py-3 text-sm font-[var(--font-sans)] text-[#3a1f1d] placeholder:text-[#888] outline-none focus:border-[#3a1f1d] transition-colors" />
            </div>
          </section>

          {/* Section 3: Payment */}
          <section className="flex flex-col gap-4 mb-4">
            <h2 className="text-[#3a1f1d] font-[var(--font-sans)] uppercase tracking-widest text-sm font-semibold mb-2">Payment Information</h2>
            <div className="w-full bg-white border border-[#ccc] p-6 flex items-center justify-center text-[#555] font-[var(--font-sans)] text-sm italic">
              Secure Credit/Debit Card Payment via Paystack
            </div>
          </section>

          {/* Confirm Button */}
          <button 
            type="button"
            disabled={!email}
            onClick={() => { initializePayment({ onSuccess, onClose }) }}
            className="w-full bg-[#3a1f1d] text-white font-[var(--font-sans)] uppercase tracking-widest text-sm hover:bg-black transition-colors flex items-center justify-center h-16 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Order & Pay
          </button>

        </form>
      </div>

      {/* Right Column (Order Summary) */}
      <div className="bg-[#EBEBE9]" style={{ padding: '5rem 10%' }}>
        <h2 className="text-[#3a1f1d] font-[var(--font-sans)] font-bold mb-8" style={{ fontSize: '1.5rem' }}>
          Order Summary
        </h2>
        
        {/* Cart Items */}
        <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-[#ccc]">
          {cart.length > 0 ? (
            cart.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-white border border-[#ccc] overflow-hidden" style={{ width: '60px', aspectRatio: '3/4' }}>
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
                    <span className="text-sm font-[var(--font-sans)] text-[#3a1f1d] uppercase">{item.name}</span>
                    <span className="text-xs font-[var(--font-sans)] text-[#555] mt-1">Quantity: {item.quantity}</span>
                  </div>
                </div>
                <span className="text-sm font-[var(--font-sans)] text-[#3a1f1d]">GH₵{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className="text-sm font-[var(--font-sans)] text-[#555] italic">Your cart is empty.</div>
          )}
        </div>

        {/* Totals Base */}
        <div className="flex flex-col gap-4 mb-6 font-[var(--font-sans)] text-sm text-[#3a1f1d]">
          <div className="flex justify-between">
            <span className="text-[#555]">Subtotal</span>
            <span>GH₵{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#555]">Delivery Charge</span>
            <span>GH₵{delivery.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-[#ccc] font-[var(--font-sans)] text-[#3a1f1d]">
          <span className="uppercase tracking-widest text-sm font-bold">Total</span>
          <span className="text-xl font-bold">GH₵{total.toFixed(2)}</span>
        </div>

      </div>
    </motion.div>
  );
};

export default Checkout;
