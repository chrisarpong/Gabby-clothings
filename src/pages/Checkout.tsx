import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { usePaystackPayment } from "react-paystack";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Lock, ChevronLeft, ShieldCheck, Package } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  country: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

// ─── Constants ───────────────────────────────────────────────────────────────

const SHIPPING_FEE = 50; // GH₵ flat rate

const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0ece8'/%3E%3C/svg%3E";

// ─── Shared input class ───────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-4 text-[13px] text-[#3a1f1d] placeholder:text-[#3a1f1d]/30 outline-none transition-colors focus:border-[#3a1f1d]/60";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartCount, totalPrice, clearCart } = useCart();
  const createOrder = useMutation(api.orders.createOrder);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    country: "Ghana",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const subtotal = totalPrice;
  const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  // ── Paystack config ──────────────────────────────────────────────────────

  const paystackConfig = {
    reference: `GN-${Date.now()}`,
    email: formData.email || "guest@gabby-newluk.com",
    amount: Math.round(total * 100), // Paystack uses pesewas (1/100 of GH₵)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${formData.firstName} ${formData.lastName}`.trim(),
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: formData.phone,
        },
        {
          display_name: "Shipping Address",
          variable_name: "shipping_address",
          value: `${formData.address}, ${formData.city}, ${formData.region}, ${formData.country}`,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  // ── Validation ───────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Enter a valid email";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.address.trim()) errors.address = "Street address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.region.trim()) errors.region = "Region is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    initializePayment({
      onSuccess: async (response: { reference: string }) => {
        try {
          // Phase 3 handshake: save order to Convex, clear cart
          await createOrder({
            paystackReference: response.reference,
            items: cart.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              priceAtTime: item.price,
            })),
            totalAmount: total,
            shippingFee: shipping,
            shippingAddress: { ...formData },
          });

          clearCart();
          toast.success("Payment confirmed! Your order is being prepared.");

          navigate("/order-confirmation", {
            state: {
              reference: response.reference,
              customerName: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              items: cart,
              subtotal,
              shipping,
              total,
              shippingAddress: formData,
            },
          });
        } catch (err) {
          console.error("Order creation failed:", err);
          toast.error(
            "Payment received but order save failed. Please contact support."
          );
        } finally {
          setIsSubmitting(false);
        }
      },
      onClose: () => {
        setIsSubmitting(false);
        toast.error("Payment cancelled.");
      },
    });
  };

  // ── Empty cart guard ─────────────────────────────────────────────────────

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#F9F8F6] px-6 pb-24 pt-36 text-[#3a1f1d] md:px-12 md:pt-44"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-[#3a1f1d]/10 bg-white px-8 py-16 text-center shadow-sm md:px-16">
          <Package className="mb-6 h-12 w-12 opacity-20" />
          <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#3a1f1d]/45">
            Checkout
          </p>
          <h1
            className="mb-5 text-4xl italic text-[#3a1f1d] md:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Your bag is empty
          </h1>
          <p className="max-w-md text-sm leading-7 text-[#3a1f1d]/60">
            Add a few pieces to your bag and we'll bring the atelier checkout
            experience right back.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center justify-center rounded-full border border-[#3a1f1d] px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-[#3a1f1d] transition-colors hover:bg-[#3a1f1d] hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    );
  }

  // ── Main Checkout ────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d]"
    >
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-12 md:pb-32 md:pt-40">

        {/* Top nav */}
        <div className="mb-10 flex items-center justify-between border-b border-[#3a1f1d]/10 pb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#3a1f1d]/60 transition-colors hover:text-[#3a1f1d]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#3a1f1d]/45 md:inline-flex">
            <Lock className="h-3.5 w-3.5" />
            Secure Checkout
          </div>
        </div>

        {/* Page title */}
        <div className="mb-14 text-center md:mb-20">
          <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-[#3a1f1d]/45">
            Gabby Newlük
          </p>
          <h1
            className="text-4xl italic text-[#3a1f1d] md:text-5xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Finalize Your Order
          </h1>
        </div>

        {/* Main grid */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20"
        >
          {/* ── LEFT: Form ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-12 lg:col-span-7">

            {/* Contact Info */}
            <section>
              <h2 className="mb-7 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#3a1f1d]">
                <span className="text-[#3a1f1d]/30">01.</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Email Address" error={formErrors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="christian@example.com"
                    className={`${inputBase} ${formErrors.email ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                  />
                </Field>
                <Field label="Phone Number" error={formErrors.phone}>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="020 000 0000"
                    className={`${inputBase} ${formErrors.phone ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                  />
                </Field>
              </div>
            </section>

            <div className="h-px w-full bg-[#3a1f1d]/8" />

            {/* Shipping Address */}
            <section>
              <h2 className="mb-7 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#3a1f1d]">
                <span className="text-[#3a1f1d]/30">02.</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="First Name" error={formErrors.firstName}>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`${inputBase} ${formErrors.firstName ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                  />
                </Field>
                <Field label="Last Name" error={formErrors.lastName}>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`${inputBase} ${formErrors.lastName ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="House Number &amp; Street" error={formErrors.address}>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. 12 Tailor Street"
                      className={`${inputBase} ${formErrors.address ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                    />
                  </Field>
                </div>
                <Field label="City / Town" error={formErrors.city}>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Accra"
                    className={`${inputBase} ${formErrors.city ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                  />
                </Field>
                <Field label="Region" error={formErrors.region}>
                  <input
                    id="region"
                    name="region"
                    type="text"
                    required
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="e.g. Greater Accra"
                    className={`${inputBase} ${formErrors.region ? "border-red-500/50" : "border-[#3a1f1d]/15"}`}
                  />
                </Field>
                <div className="md:col-span-2">
                  <label className="mb-2 block ml-1 text-[10px] uppercase tracking-[0.24em] text-[#3a1f1d]/55">
                    Country
                  </label>
                  <input
                    disabled
                    value="Ghana"
                    className="w-full cursor-not-allowed rounded-xl border border-[#3a1f1d]/10 bg-[#F9F8F6] px-4 py-4 text-[13px] text-[#3a1f1d]/50 outline-none"
                  />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-[#3a1f1d]/8" />

            {/* Payment */}
            <section>
              <h2 className="mb-7 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#3a1f1d]">
                <span className="text-[#3a1f1d]/30">03.</span>
                Payment
              </h2>
              <div className="flex items-center gap-4 rounded-2xl border border-[#3a1f1d]/15 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3a1f1d]/5">
                  <ShieldCheck className="h-5 w-5 text-[#3a1f1d]/60" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#3a1f1d]">
                    Secured by Paystack
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#3a1f1d]/50">
                    Pay with Mobile Money (Momo) or Card — you'll be redirected
                    to a secure Paystack modal.
                  </p>
                </div>
              </div>
            </section>

            {/* Mobile pay button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-[#3a1f1d] px-6 py-4 text-white shadow-[0_18px_40px_rgba(58,31,29,0.14)] transition-all hover:-translate-y-0.5 hover:bg-black disabled:opacity-60 lg:hidden"
            >
              <Lock className="h-4 w-4 opacity-70" />
              <span className="text-[12px] font-medium uppercase tracking-[0.22em]">
                {isSubmitting ? "Processing…" : `Pay GH₵ ${total.toFixed(2)}`}
              </span>
            </button>
          </div>

          {/* ── RIGHT: Order Summary ────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 rounded-3xl border border-[#3a1f1d]/10 bg-white p-8 shadow-[0_24px_70px_rgba(58,31,29,0.06)] md:p-10">
              <h3 className="mb-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3a1f1d]">
                Your Bag ({cartCount})
              </h3>

              {/* Cart items */}
              <div className="mb-8 flex max-h-[45vh] flex-col gap-5 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-24 w-18 shrink-0 overflow-hidden rounded-xl border border-[#3a1f1d]/10 bg-[#F9F8F6]">
                      <img
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-1">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[13px] font-medium leading-5 text-[#3a1f1d]">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-[13px] font-medium text-[#3a1f1d]">
                          GH₵ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#3a1f1d]/45">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-5 h-px w-full bg-[#3a1f1d]/8" />

              {/* Totals */}
              <div className="mb-5 flex flex-col gap-3">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-[#3a1f1d]/55">
                  <span>Subtotal</span>
                  <span>GH₵ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-[#3a1f1d]/55">
                  <span>Shipping</span>
                  <span>GH₵ {shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-8 h-px w-full bg-[#3a1f1d]/8" />

              <div className="mb-8 flex items-end justify-between gap-4">
                <span className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#3a1f1d]">
                  Total Due
                </span>
                <span
                  className="text-3xl italic text-[#3a1f1d]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  GH₵ {total.toFixed(2)}
                </span>
              </div>

              {/* Desktop pay button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="hidden w-full items-center justify-center gap-3 rounded-full bg-[#3a1f1d] px-6 py-4 text-white shadow-[0_18px_40px_rgba(58,31,29,0.14)] transition-all hover:-translate-y-0.5 hover:bg-black disabled:opacity-60 lg:flex"
              >
                <Lock className="h-4 w-4 opacity-70" />
                <span className="text-[12px] font-medium uppercase tracking-[0.22em]">
                  {isSubmitting ? "Processing…" : `Pay GH₵ ${total.toFixed(2)}`}
                </span>
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#3a1f1d]/35">
                <Lock className="h-3 w-3" />
                Secured by Paystack
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ml-1 text-[10px] uppercase tracking-[0.24em] text-[#3a1f1d]/55">
        {label}
      </label>
      {children}
      {error && <p className="ml-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
