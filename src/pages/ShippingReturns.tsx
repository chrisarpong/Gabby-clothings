import React from "react";
import { motion } from "framer-motion";

export default function ShippingReturns() {
  return (
    <main className="bg-surface relative w-full pt-40 pb-32 min-h-screen">
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto flex flex-col">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-6"
        >
          Customer Service
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-5xl md:text-7xl italic text-primary leading-tight mb-16"
        >
          Shipping & Returns
        </motion.h1>

        <div className="flex flex-col gap-12 max-w-3xl font-sans text-on-surface-variant">
          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Domestic Shipping</h2>
            <p className="leading-relaxed mb-4">
              We offer complimentary standard shipping on all orders over GH₵ 1,000 within Ghana. Standard delivery usually takes between 3 to 5 business days. Express next-day delivery is available for central Accra for an additional GH₵ 50.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">International Shipping</h2>
            <p className="leading-relaxed mb-4">
              We ship worldwide. International orders are handled by DHL Express and usually arrive within 5 to 7 business days. Shipping costs are calculated dynamically at checkout based on location and parcel weight. Please note that customers are responsible for all customs and import duties levied by their local authorities.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Return Policy</h2>
            <p className="leading-relaxed mb-4">
              We accept returns on all Ready-to-Wear garments within 14 days of delivery, provided the item is unworn, in original condition, and has all tags attached. Delivery fees are non-refundable. For returns, please contact our support desk.
            </p>
            <p className="leading-relaxed font-bold">
              Bespoke & Custom Orders: Because custom garments are tailored specifically to your measurements, they are strictly non-refundable. However, we offer two complimentary alterations within 30 days of receipt to ensure your garment fits perfectly.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
