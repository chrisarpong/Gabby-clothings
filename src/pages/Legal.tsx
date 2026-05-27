import React from "react";
import { motion } from "framer-motion";

export default function Legal() {
  return (
    <main className="bg-surface relative w-full pt-40 pb-32 min-h-screen">
      <section className="px-5 md:px-20 max-w-[1536px] mx-auto flex flex-col">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-6"
        >
          Company Information
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-5xl md:text-7xl italic text-primary leading-tight mb-16"
        >
          Legal & Privacy
        </motion.h1>

        <div className="flex flex-col gap-12 max-w-3xl font-sans text-on-surface-variant">
          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Privacy Policy</h2>
            <p className="leading-relaxed mb-4">
              Gabby Newluk is committed to protecting your privacy. We use your personal information (such as your name, email, phone number, and physical measurements) only to process your orders, improve our service, and communicate with you. Your precise measurements are stored securely to allow for swift custom garment orders. We never sell or share your data with third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Terms of Service</h2>
            <p className="leading-relaxed mb-4">
              By placing an order on our platform, you agree to our Terms of Service. Prices and availability of products are subject to change without notice. All prices are displayed and billed in GH₵.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Intellectual Property</h2>
            <p className="leading-relaxed mb-4">
              All content on this website, including but not limited to textile designs, photography, text, and logos, is the exclusive property of Gabby Newluk and protected by international intellectual property laws.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
