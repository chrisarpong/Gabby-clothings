import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { useCart } from "../context/CartContext";
import { useUser } from "@clerk/react";
import { TextField } from "@mui/material";
import { Button } from "../components/ui/Button";

// npm install react-paystack (if not already installed)

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop";

const Checkout = () => {
  const { cart, clearCart, cartCount, totalPrice } = useCart();
  const navigate = useNavigate();
  const { user } = useUser();

  // ── Form state ──
  const [email, setEmail] = useState(
    user?.primaryEmailAddress?.emailAddress || ""
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Ghana");
  const [phone, setPhone] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ── Price calculation ──
  const subtotal = totalPrice;
  const delivery = cart.length > 0 ? 50.0 : 0;
  const total = subtotal + delivery;

  // ── Paystack config ──
  const config = {
    reference: new Date().getTime().toString(),
    email: email || "guest@gabby-newluk.com",
    amount: Math.round(total * 100), // pesewas (smallest currency unit)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${firstName} ${lastName}`,
        },
        {
          display_name: "Shipping Address",
          variable_name: "shipping_address",
          value: `${street}, ${city}, ${region}, ${country}`,
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: phone,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  // ── Form validation ──
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email";
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!street.trim()) errors.street = "Street address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!region.trim()) errors.region = "Region is required";
    if (!country.trim()) errors.country = "Country is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handle Pay ──
  const handlePayNow = () => {
    if (!validateForm()) return;

    initializePayment({
      onSuccess: () => {
        clearCart();
        navigate("/order-confirmation");
      },
      onClose: () => {
        // User closed the popup — do nothing
      },
    });
  };

  // ── Reusable classes ──
  const muiBrandStyles = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': { borderColor: '#3a1f1d' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
  };

  // ── Empty cart ──
  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full pt-56 pb-32 bg-[#F9F8F6] flex flex-col items-center text-[#3a1f1d]"
      >
        <h1
          className="text-5xl italic mb-6"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: "normal" }}
        >
          Your bag is empty
        </h1>
        <p className="uppercase tracking-[0.3em] text-[11px] opacity-40 mb-12">
          Add items to get started
        </p>
        <Link
          to="/shop"
          className="border border-[#3a1f1d] px-12 py-4 text-sm uppercase tracking-widest hover:bg-[#3a1f1d] hover:text-white transition-all"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full pt-40 pb-32 bg-[#F9F8F6] flex flex-col items-center text-[#3a1f1d]"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <div className="max-w-7xl w-full px-8 flex flex-col items-center">

        {/* ── Back to Cart ── */}
        <div className="w-full mb-12">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-[13px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Cart
          </Link>
        </div>

        {/* ── Header ── */}
        <div className="text-center mb-20">
          <h1
            className="text-6xl lg:text-7xl italic mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: "normal" }}
          >
            Finalize Order
          </h1>
          <p className="uppercase tracking-[0.5em] text-[11px] opacity-40">
            Bespoke Tailoring Request
          </p>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-20 lg:gap-32 items-start">

          {/* ════════ LEFT: Form ════════ */}
          <div className="w-full space-y-20">

            {/* 01. Contact */}
            <section>
              <h2 className="uppercase tracking-[0.4em] text-xs font-bold mb-12 border-b border-[#3a1f1d]/10 pb-6">
                01. Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="EMAIL ADDRESS *" type="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" sx={muiBrandStyles}
                    error={!!formErrors.email} helperText={formErrors.email}
                  />
                </div>
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="PHONE NUMBER" type="tel"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX" sx={muiBrandStyles}
                  />
                </div>
              </div>
            </section>

            {/* 02. Shipping */}
            <section>
              <h2 className="uppercase tracking-[0.4em] text-xs font-bold mb-12 border-b border-[#3a1f1d]/10 pb-6">
                02. Shipping
              </h2>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="FIRST NAME *"
                    value={firstName} onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name" sx={muiBrandStyles}
                    error={!!formErrors.firstName} helperText={formErrors.firstName}
                  />
                </div>
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="LAST NAME *"
                    value={lastName} onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name" sx={muiBrandStyles}
                    error={!!formErrors.lastName} helperText={formErrors.lastName}
                  />
                </div>
              </div>
              <div className="mt-10">
                <TextField 
                  fullWidth variant="outlined" label="HOUSE NUMBER & STREET *"
                  value={street} onChange={(e) => setStreet(e.target.value)}
                  placeholder="House Number & Street" sx={muiBrandStyles}
                  error={!!formErrors.street} helperText={formErrors.street}
                />
              </div>
              <div className="grid grid-cols-3 gap-12 mt-10">
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="CITY *"
                    value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="City" sx={muiBrandStyles}
                    error={!!formErrors.city} helperText={formErrors.city}
                  />
                </div>
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="REGION *"
                    value={region} onChange={(e) => setRegion(e.target.value)}
                    placeholder="Region" sx={muiBrandStyles}
                    error={!!formErrors.region} helperText={formErrors.region}
                  />
                </div>
                <div>
                  <TextField 
                    fullWidth variant="outlined" label="COUNTRY *"
                    value={country} onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country" sx={muiBrandStyles}
                    error={!!formErrors.country} helperText={formErrors.country}
                  />
                </div>
              </div>
            </section>

            {/* ── Pay Now Button ── */}
            <Button
              type="button"
              onClick={handlePayNow}
              style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.4em', padding: '1.75rem', fontSize: '0.875rem', width: '100%', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}
            >
              Pay Now — GH₵ {total.toFixed(2)}
            </Button>
          </div>

          {/* ════════ RIGHT: Order Summary ════════ */}
          <div className="bg-white p-10 lg:p-12 border border-[#3a1f1d]/5 shadow-2xl sticky top-40">
            <h2 className="uppercase tracking-[0.4em] text-[10px] font-bold mb-10 text-center opacity-40">
              Your Bag ({cartCount})
            </h2>

            {/* Cart Items */}
            <div className="space-y-6 mb-10 pb-10 border-b border-[#3a1f1d]/10">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.name}
                      className="w-14 h-[72px] object-cover border border-[#3a1f1d]/5 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <span className="uppercase tracking-widest font-bold text-[10px] truncate">
                      {item.name}
                      <span className="opacity-40 ml-2">x{item.quantity}</span>
                    </span>
                  </div>
                  <span className="font-bold tracking-tighter shrink-0">
                    GH₵{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal & Shipping */}
            <div className="space-y-5 text-[11px] tracking-[0.2em] uppercase opacity-50 mb-8">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>GH₵ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>GH₵ {delivery.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end border-t border-[#3a1f1d]/10 pt-8">
              <span className="uppercase tracking-[0.4em] text-xs font-bold text-[#3a1f1d]">
                Total Due
              </span>
              <span
                className="text-3xl italic font-medium"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                GH₵ {total.toFixed(2)}
              </span>
            </div>

            {/* Secure Checkout Badge */}
            <div className="flex justify-center items-center gap-2 mt-6 opacity-50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <span className="text-[11px]">Secured by Paystack</span>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;