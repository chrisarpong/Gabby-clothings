import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCart } from "../context/CartContext";
import { useToasts } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PatternFormat } from "react-number-format";
import {
  Lock,
  Shield,
  ShoppingBag,
  ChevronLeft,
  Loader2,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Shadcn UI & Custom Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OrderConfirmationCard } from "@/components/ui/order-confirmation-card";

// --- Types & Validation Schema ---

const shippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{8,20}$/, "Enter a valid phone number")
    .min(1, "Phone number is required"),
  address: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "Region / State is required"),
});

type ShippingAddressForm = z.infer<typeof shippingAddressSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const createOrder = useMutation(api.orders.createOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toasts = useToasts();
  const convex = useConvex();

  const [promoInput, setPromoInput] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // State to handle the Pop-Up Modal
  const [confirmedOrder, setConfirmedOrder] = useState<{
    reference: string;
    date: string;
    total: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<ShippingAddressForm>({
    resolver: zodResolver(shippingAddressSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
    },
  });

  const watchPhone = watch("phone");

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount; // Complimentary shipping

  const paystackConfig = {
    reference: `GN-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: watch("email") || "guest@gabby-newluk.com",
    amount: Math.round(total * 100),
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onSubmit = async (data: ShippingAddressForm) => {
    setIsSubmitting(true);

    initializePayment({
      onSuccess: async (response: { reference: string }) => {
        try {
          await createOrder({
            paystackReference: response.reference,
            items: cart.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              priceAtTime: item.price,
            })),
            totalAmount: total,
            shippingFee: 0,
            shippingAddress: {
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              phone: data.phone,
              address: data.address,
              city: data.city,
              region: data.state,
            },
          });

          clearCart();
          toasts.success("Order placed successfully!");
          
          // Format the date for the receipt
          const formattedDate = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date()).replace(',', '');

          // Trigger the Pop-Up Modal instead of navigating away!
          setConfirmedOrder({
            reference: response.reference,
            date: formattedDate,
            total: `GHS ${total.toFixed(2)}`,
          });

        } catch (err) {
          console.error("Order creation failed:", err);
          toasts.error(
            "We received your payment but couldn't finalize the order. Please contact our support team."
          );
        } finally {
          setIsSubmitting(false);
        }
      },
      onClose: () => {
        setIsSubmitting(false);
        toasts.error("Payment was cancelled. Your items are still saved.");
      },
    });
  };

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#F9F8F6]">
        <ShoppingBag className="w-12 h-12 text-[#3a1f1d]/40 mb-6 stroke-[1.5]" />
        <h2 
          className="text-2xl text-[#3a1f1d] mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your cart is empty
        </h2>
        <Button
          onClick={() => navigate("/shop")}
          className="h-[54px] px-10 bg-[#3a1f1d] hover:bg-black text-[#F9F8F6] rounded-none transition-colors shadow-none"
          style={{ fontFamily: "'Jost', sans-serif", fontWeight: "normal" }}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  const inputClassName = "flex h-[52px] w-full bg-white border border-[#3a1f1d]/20 px-5 text-[15px] text-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 focus-visible:outline-none focus-visible:border-[#3a1f1d] disabled:cursor-not-allowed disabled:opacity-50 rounded-none";

  return (
    <>
      <div className="min-h-screen bg-[#F9F8F6] pb-24 flex justify-center w-full" style={{ fontFamily: "'Jost', sans-serif" }}>
        
        <div className="w-full max-w-[1024px] px-6 sm:px-8 pt-8 lg:pt-16">
          
          {/* Back link */}
          <div className="mb-10">
            <Link
              to="/cart"
              className="inline-flex items-center text-[14px] text-[#3a1f1d]/60 hover:text-[#3a1f1d] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Return to cart
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start w-full">
            
            {/* ════════ LEFT COLUMN – Client Details ════════ */}
            <div className="flex-1 w-full">
              
              <h2 
                className="text-[22px] text-[#3a1f1d] mb-6 pb-4 border-b border-[#3a1f1d]/10"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Shipping Details
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-5">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="firstName" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                        First Name
                      </Label>
                      <input
                        id="firstName"
                        {...register("firstName")}
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.firstName && (
                        <p className="text-[13px] text-red-600 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                        Last Name
                      </Label>
                      <input
                        id="lastName"
                        {...register("lastName")}
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <p className="text-[13px] text-red-600 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                      Email Address
                    </Label>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={inputClassName}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-[13px] text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                      Phone Number
                    </Label>
                    <PatternFormat
                      format="+### ## ### ####"
                      allowEmptyFormatting
                      mask="_"
                      value={watchPhone}
                      onValueChange={(values) => {
                        setValue("phone", values.value, { shouldValidate: true });
                      }}
                      onBlur={() => trigger("phone")}
                      id="phone"
                      disabled={isSubmitting}
                      className={inputClassName}
                    />
                    {errors.phone && (
                      <p className="text-[13px] text-red-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                      Street Address
                    </Label>
                    <input
                      id="address"
                      {...register("address")}
                      className={inputClassName}
                      placeholder="Street address, P.O. Box"
                      disabled={isSubmitting}
                    />
                    {errors.address && (
                      <p className="text-[13px] text-red-600 mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="city" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                        City
                      </Label>
                      <input
                        id="city"
                        {...register("city")}
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.city && (
                        <p className="text-[13px] text-red-600 mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-[14px] font-normal text-[#3a1f1d]/80 mb-2 block">
                        Region
                      </Label>
                      <input
                        id="state"
                        {...register("state")}
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                      {errors.state && (
                        <p className="text-[13px] text-red-600 mt-1">{errors.state.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button type="submit" className="hidden" aria-hidden="true" />
              </form>
            </div>

            {/* ════════ RIGHT COLUMN – Order Summary ════════ */}
            <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-10">
              
              <h2 
                className="text-[22px] text-[#3a1f1d] mb-6 pb-4 border-b border-[#3a1f1d]/10"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-[60px] h-[75px] shrink-0 bg-white border border-[#3a1f1d]/5 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#3a1f1d]/20 text-xs font-serif">
                          GN
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[15px] text-[#3a1f1d] font-medium truncate">{item.name}</p>
                        <p className="text-[15px] text-[#3a1f1d] shrink-0">
                          GHS {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-[14px] text-[#3a1f1d]/60 mt-1">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="flex-1 h-[42px] bg-white border border-[#3a1f1d]/20 px-4 text-[13px] text-[#3a1f1d] uppercase tracking-widest placeholder:text-[#3a1f1d]/30 focus:outline-none focus:border-[#3a1f1d] transition-colors rounded-none"
                />
                <Button
                  type="button"
                  onClick={async () => {
                    if (!promoInput.trim()) return;
                    try {
                      const discount = await convex.query(api.promotions.validateCode, { code: promoInput });
                      if (discount) {
                        setDiscountPercent(discount);
                        toasts.success(`${discount}% discount applied!`);
                      } else {
                        toasts.error("Invalid or expired promo code.");
                        setDiscountPercent(0);
                      }
                    } catch (e) {
                      toasts.error("Failed to validate code.");
                    }
                  }}
                  className="h-[42px] px-6 bg-transparent border border-[#3a1f1d] text-[#3a1f1d] hover:bg-[#3a1f1d] hover:text-white transition-colors rounded-none shadow-none text-[11px] uppercase tracking-[0.2em]"
                >
                  Apply
                </Button>
              </div>

              <div className="border-t border-[#3a1f1d]/10 pt-6 space-y-3">
                <div className="flex justify-between text-[15px] text-[#3a1f1d]/80">
                  <span>Subtotal</span>
                  <span>GHS {subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-[15px] text-green-700">
                    <span>Discount Applied ({discountPercent}%)</span>
                    <span>-GHS {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] text-[#3a1f1d]/80">
                  <span>Shipping</span>
                  <span className="italic">Complimentary</span>
                </div>
                <div className="flex justify-between text-[18px] text-[#3a1f1d] pt-5 mt-2 border-t border-[#3a1f1d]/10">
                  <span>Total</span>
                  <span>GHS {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-[14px] text-[#3a1f1d]/70">
                <CreditCard className="w-4 h-4 stroke-[1.5]" />
                <span>Secure payment via Paystack</span>
              </div>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isValid}
                className="w-full mt-6 bg-[#3a1f1d] hover:bg-black text-[#F9F8F6] h-[54px] text-[16px] rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
                style={{ fontWeight: "normal" }}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Complete Order"
                )}
              </Button>

              <div className="mt-8 pt-6 border-t border-[#3a1f1d]/10">
                <div className="flex items-center justify-center gap-6 text-[#3a1f1d]/50 mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 stroke-[1.5]" />
                    <span className="text-[13px] tracking-wide">SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 stroke-[1.5]" />
                    <span className="text-[13px] tracking-wide">256-bit Encryption</span>
                  </div>
                </div>
                <p className="text-[13px] text-center text-[#3a1f1d]/50">
                  Payments are processed securely. Your data is protected.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ════════ SUCCESS MODAL POP-UP ════════ */}
      <AnimatePresence>
        {confirmedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <OrderConfirmationCard
              orderId={confirmedOrder.reference}
              paymentMethod="Paystack Secure"
              dateTime={confirmedOrder.date}
              totalAmount={confirmedOrder.total}
              onGoToAccount={() => navigate("/")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}