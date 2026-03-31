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
  const [phone, setPhone] = useState('');

  const subtotal = cart.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
  const delivery = 50.00;
  const total = subtotal + delivery;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: total * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    currency: 'GHS'
  };

  const initializePayment = usePaystackPayment(config);

  const inputClasses = "w-full border-0 border-b border-[#3a1f1d]/20 bg-transparent py-6 text-base font-medium text-[#3a1f1d] placeholder:text-[#3a1f1d]/20 focus:border-[#3a1f1d] outline-none transition-all";
  const labelClasses = "uppercase tracking-[0.3em] text-[10px] font-bold text-[#3a1f1d]/40 mb-1 block";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full pt-56 pb-32 bg-[#F5F5F3] flex flex-col items-center text-[#3a1f1d]"
    >
      <div className="max-w-7xl w-full px-8 flex flex-col items-center">
        <div className="text-center mb-24">
          <h1 className="text-7xl italic mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Finalize Order</h1>
          <p className="uppercase tracking-[0.5em] text-[11px] opacity-40">Bespoke Tailoring Request</p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-32 items-start">

          <div className="w-full space-y-28">
            <section>
              <h2 className="uppercase tracking-[0.4em] text-xs font-bold mb-12 border-b border-[#3a1f1d]/10 pb-6">01. Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                  <label className={labelClasses}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="atelier@client.com" />
                </div>
                <div>
                  <label className={labelClasses}>Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} placeholder="+233 XX XXX XXXX" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="uppercase tracking-[0.4em] text-xs font-bold mb-12 border-b border-[#3a1f1d]/10 pb-6">02. Shipping</h2>
              <div className="grid grid-cols-2 gap-16">
                <input type="text" placeholder="First Name" className={inputClasses} />
                <input type="text" placeholder="Last Name" className={inputClasses} />
              </div>
              <input type="text" placeholder="House Number & Street" className={`${inputClasses} mt-12`} />
              <div className="grid grid-cols-3 gap-16 mt-12">
                <input type="text" placeholder="City" className={inputClasses} />
                <input type="text" placeholder="Region" className={inputClasses} />
                <input type="text" placeholder="Country" className={inputClasses} />
              </div>
            </section>

            <button
              onClick={() => initializePayment({ onSuccess: () => { clearCart(); navigate('/order-confirmation'); }, onClose: () => { } })}
              className="w-full bg-[#3a1f1d] text-[#F5F5F3] py-8 text-center uppercase tracking-[0.5em] text-sm font-bold hover:bg-black transition-all shadow-2xl"
            >
              Pay Now — GH₵ {total.toFixed(2)}
            </button>
          </div>

          {/* Right: Modern Summary Bag */}
          <div className="bg-white p-12 border border-[#3a1f1d]/5 shadow-2xl sticky top-52">
            <h2 className="uppercase tracking-[0.4em] text-[10px] font-bold mb-12 text-center opacity-40">Your Bag</h2>
            <div className="space-y-8 mb-12 pb-12 border-b border-[#3a1f1d]/10">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-6">
                    <img src={item.image} alt="" className="w-16 h-20 object-cover border border-[#3a1f1d]/5" />
                    <span className="uppercase tracking-widest font-bold text-[10px]">{item.name} <span className="opacity-40 ml-3">x{item.quantity}</span></span>
                  </div>
                  <span className="font-bold tracking-tighter">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-6 text-[11px] tracking-[0.2em] uppercase opacity-50 mb-10">
              <div className="flex justify-between"><span>Subtotal</span><span>GH₵ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>GH₵ {delivery.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-between items-end border-t border-[#3a1f1d]/10 pt-10">
              <span className="uppercase tracking-[0.4em] text-xs font-bold text-[#3a1f1d]">Total Due</span>
              <span className="text-3xl italic font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                GH₵ {total.toFixed(2)}
              </span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;