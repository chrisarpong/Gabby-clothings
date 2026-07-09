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
              At Gabby Newluk, we are committed to protecting your personal data in compliance with the Ghana Data Protection Act, 2012 (Act 843). We collect your personal information (including name, email, phone number, address, and physical measurements) solely for the purposes of processing your custom-fit orders, managing fittings, communicating regarding your order status, and improving our services.
            </p>
            <p className="leading-relaxed mb-4">
              <strong>Data Retention:</strong> Your precise body measurements are securely stored to facilitate seamless future orders. You may request the deletion of your measurement profile at any time by contacting us. We do not retain sensitive payment data on our servers; all transactions are securely processed by Paystack.
            </p>
            <p className="leading-relaxed mb-4">
              <strong>Your Rights:</strong> Under the Data Protection Act, you have the right to access, correct, or request the erasure of your personal data. We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Terms of Service</h2>
            <p className="leading-relaxed mb-4">
              By placing an order or booking an appointment on our platform, you agree to our Terms of Service. Prices and availability of products are subject to change without notice. All prices are displayed and billed in Ghanaian Cedi (GH₵).
            </p>
            <p className="leading-relaxed mb-4">
              <strong>Cancellations:</strong> Due to the custom-fit nature of our garments, once an order goes into production (typically 24 hours after confirmation and payment), it cannot be cancelled. 
            </p>
            <p className="leading-relaxed mb-4">
              <strong>Refunds & Returns:</strong> We do not offer refunds on custom-tailored garments. If your garment requires adjustments due to an error on our part, we will provide complimentary alterations. For ready-to-wear items, returns are accepted within 7 days of delivery provided the item is unworn and in its original condition.
            </p>
            <p className="leading-relaxed mb-4">
              <strong>Dispute Resolution:</strong> Any disputes arising under these Terms shall be governed by the laws of the Republic of Ghana, and subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-3xl text-primary mb-4">Intellectual Property</h2>
            <p className="leading-relaxed mb-4">
              All content on this website, including but not limited to textile designs, garment designs, photography, text, and logos, is the exclusive property of Gabby Newluk and protected by international and Ghanaian intellectual property laws. Unauthorized reproduction is strictly prohibited.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
