"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaystackPayment } from "react-paystack";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCart } from "../../../src/context/CartContext";
import { toast } from "sonner";
import { Lock, Shield, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CheckoutBlockProps {
  cartItems: CartItem[];
}

export default function Checkout({ cartItems }: CheckoutBlockProps) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const createOrder = useMutation(api.orders.createOrder);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "", // Region
    zipCode: "",
    country: "GH",
  });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // No dummy shipping fees or taxes for custom tailoring

  const paystackConfig = {
    reference: `GN-${Date.now()}`,
    email: shippingAddress.email || "guest@gabby-newluk.com",
    amount: Math.round(total * 100), // Paystack uses pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
        },
        {
          display_name: "Phone",
          variable_name: "phone",
          value: shippingAddress.phone,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleCompleteOrder = () => {
    // Exact bare-minimum check suitable for bespoke clothing clients
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.email || !shippingAddress.phone) {
      toast.error("Please fill in your primary contact details.");
      return;
    }

    setIsSubmitting(true);

    initializePayment({
      onSuccess: async (response: { reference: string }) => {
        try {
          await createOrder({
            paystackReference: response.reference,
            items: cartItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              priceAtTime: item.price,
            })),
            totalAmount: total,
            shippingFee: 0,
            shippingAddress: { ...shippingAddress, region: shippingAddress.state || shippingAddress.city },
          });

          clearCart();
          toast.success("Payment confirmed! Your order is being processed.");

          navigate("/order-confirmation", {
            state: {
              reference: response.reference,
              customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
              email: shippingAddress.email,
              items: cartItems,
              subtotal,
              shipping: 0,
              total,
              shippingAddress,
            },
          });
        } catch (err) {
          console.error("Order creation failed:", err);
          toast.error("Payment received but order save failed. Please contact support.");
        } finally {
          setIsSubmitting(false);
        }
      },
      onClose: () => {
        setIsSubmitting(false);
        toast.error("Payment securely cancelled.");
      },
    });
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-[1300px] mx-auto pt-40 pb-24 px-12 md:px-24 lg:px-32 xl:px-40 flex flex-col gap-16 text-[#3a1f1d]">
      
      {/* Header Separation & Title */}
      <div className="flex flex-col items-center text-center gap-4">
        <h1 className="text-4xl md:text-5xl font-bold italic" style={{ fontFamily: "'Playfair Display', serif" }}>
          Secure Checkout
        </h1>
        <p className="text-[#3a1f1d]/50 text-[11px] tracking-[0.2em] uppercase">
          Complete your tailoring order
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px] gap-16 lg:gap-24 w-full items-start">
        {/* Left Column: Client Details Section */}
        <section className="flex flex-col gap-10">
          <div className="flex items-center gap-3 border-b border-[#3a1f1d]/10 pb-4">
            <User className="h-5 w-5 opacity-70" />
            <h2 className="text-xl font-medium tracking-widest uppercase text-[15px]">Client Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 mt-2">
            <div className="flex flex-col gap-3">
              <Label htmlFor="firstName" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">First Name *</Label>
              <Input
                id="firstName"
                placeholder="Ex. John"
                className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
                value={shippingAddress.firstName}
                onChange={(e) => handleAddressChange("firstName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="lastName" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Ex. Doe"
                className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
                value={shippingAddress.lastName}
                onChange={(e) => handleAddressChange("lastName", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="email" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email for order tracking"
                className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
                value={shippingAddress.email}
                onChange={(e) => handleAddressChange("email", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="phone" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="For fitting coordination"
                className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Label htmlFor="address" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">Delivery / Fitting Address (Optional)</Label>
            <Input
              id="address"
              placeholder="Where should we dispatch to?"
              className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
              value={shippingAddress.address}
              onChange={(e) => handleAddressChange("address", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-2">
            <div className="flex flex-col gap-3">
              <Label htmlFor="city" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">City (Optional)</Label>
              <Input
                id="city"
                className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="state" className="text-[#3a1f1d]/60 uppercase text-[10px] tracking-widest font-bold">Region (Optional)</Label>
              <Input
                id="state"
                className="border-0 border-b border-[#3a1f1d]/20 rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-[#3a1f1d] transition-colors h-8 shadow-none"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Right Column: Order Summary Section */}
        <section className="flex flex-col gap-10 lg:pl-12 lg:border-l border-[#3a1f1d]/5 relative lg:-top-4">
          <div className="flex items-center gap-3 border-b border-[#3a1f1d]/10 pb-4">
            <ShoppingBag className="h-5 w-5 opacity-70" />
            <h2 className="text-xl font-medium tracking-widest uppercase text-[15px]">Order Summary</h2>
          </div>
          
          <div className="flex flex-col gap-8">
            {cartItems.map((item) => (
                <div key={item.id} className="flex gap-6 items-center">
                  <div className="relative w-24 h-32 rounded-md overflow-hidden shrink-0 bg-[#F9F8F6] border border-[#3a1f1d]/5">
                    <img
                      src={item.image || "https://via.placeholder.com/120"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/120"; }}
                    />
                    <div className="absolute top-0 right-0 bg-[#3a1f1d]/10 backdrop-blur-md text-[#3a1f1d] text-[10px] font-bold px-2.5 py-1 rounded-bl-lg">
                      {item.quantity}x
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[16px] font-medium text-[#3a1f1d] leading-snug">{item.name}</p>
                    <p className="text-[13px] opacity-60 text-[#3a1f1d] mt-1 italic">Tailored to measurements</p>
                  </div>
                  <div className="text-lg font-bold text-[#3a1f1d]">
                    GH₵ {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

          <div className="flex flex-col gap-3 pt-8 mt-4 border-t border-[#3a1f1d]/10">
            <div className="flex justify-between items-center text-xl lg:text-3xl font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span>Total Commitment</span>
              <span>GH₵ {total.toFixed(2)}</span>
            </div>
            <p className="text-[9px] text-[#3a1f1d]/50 uppercase tracking-[0.2em] text-right">Final transaction processing securely handled online</p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center gap-6 mt-4">
            <Button
              size="lg"
              onClick={handleCompleteOrder}
              disabled={isSubmitting}
              className="w-full bg-[#3a1f1d] hover:bg-black text-white h-[72px] rounded-none text-[13px] uppercase tracking-[0.3em] font-medium transition-all hover:scale-[1.01]"
            >
              <Lock className="h-4 w-4 mr-3 opacity-60" />
              {isSubmitting ? "Initiating Secure Payment..." : `Complete Order ( GH₵ ${total.toFixed(2)} )`}
            </Button>

            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#3a1f1d]/40 text-center">
              <Shield className="h-3 w-3 shrink-0" />
              <span>Payments heavily secured via Paystack. Your data is encrypted.</span>
            </div>

            <button
              onClick={() => navigate('/cart')}
              className="mt-6 text-[11px] uppercase tracking-[0.15em] text-[#3a1f1d]/60 hover:text-[#3a1f1d] transition-colors border-b border-transparent hover:border-[#3a1f1d]"
            >
              Return to Cart
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}