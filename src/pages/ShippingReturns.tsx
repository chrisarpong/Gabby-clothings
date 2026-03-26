import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const sections = [
  {
    title: 'Delivery & Shipping',
    items: [
      { q: 'Local Delivery (Accra & Greater Accra)', a: 'All orders within Accra and Greater Accra are delivered within 2–3 business days from completion. A flat GHS 50 delivery fee applies.' },
      { q: 'National Delivery (Ghana)', a: 'Orders to all other regions in Ghana are shipped via courier within 4–7 business days. A flat GHS 100 shipping fee applies.' },
      { q: 'International Shipping', a: 'We ship globally via DHL Express. International orders typically arrive within 7–14 business days depending on destination. Shipping fees and duties are calculated at checkout based on destination.' },
      { q: 'Bespoke & Custom Orders', a: 'Bespoke garments are not shipped until final fitting approval is granted. Production timelines range from 2–6 weeks depending on complexity. You will be notified at every stage.' },
      { q: 'Order Tracking', a: 'Once your order is dispatched, a tracking number will be sent to your email address. You can track your parcel in real time via the courier\u2019s website.' },
    ],
  },
  {
    title: 'Returns & Exchanges',
    items: [
      { q: 'Ready-to-Wear Items', a: 'Ready-to-wear items may be returned within 14 days of delivery. Items must be unworn, unwashed, and in original condition with all tags attached. A GHS 30 restocking fee applies.' },
      { q: 'Bespoke & Custom Orders', a: 'Due to the personalised nature of bespoke garments, we are unable to accept returns on custom-made pieces. However, we will work with you on alterations and adjustments at no additional cost within 30 days of delivery.' },
      { q: 'Faulty or Incorrect Items', a: 'If you receive a faulty item or the wrong order, please contact us within 48 hours of delivery at hello@gabbynewluk.com with photos. We will arrange a full replacement or refund at no cost to you.' },
      { q: 'How to Initiate a Return', a: 'Email us at returns@gabbynewluk.com with your order number and reason for return. Our team will provide a return label and instructions within 24 hours.' },
    ],
  },
  {
    title: 'Refund Policy',
    items: [
      { q: 'Refund Timeline', a: 'Once your returned item is received and inspected, refunds are processed within 5–10 business days to your original payment method.' },
      { q: 'Consultation Deposits', a: 'Appointment deposits are fully refundable up to 48 hours before your scheduled appointment. Cancellations within 48 hours may forfeit the deposit.' },
      { q: 'Paystack Payments', a: 'All card and mobile money payments are processed securely through Paystack. Refunds are returned to the original card or MoMo wallet.' },
    ],
  },
];

const ShippingReturns = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-[#F5F5F3]" style={{ paddingTop: '130px', paddingBottom: '6rem' }}>
    <div className="max-w-4xl mx-auto px-[5%]">

      <motion.div className="mb-16" variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>Policies</p>
        <h1 className="text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Shipping & Returns</h1>
        <div className="h-px bg-[#3a1f1d]/10 max-w-[120px]" />
        <p className="mt-6 text-sm text-[#3a1f1d]/60 max-w-[520px] leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
          We are committed to ensuring your order arrives safely and that your experience is perfect. Please read our policies below carefully.
        </p>
      </motion.div>

      {sections.map((section, si) => (
        <motion.div key={section.title} className="mb-14" variants={fadeUp} custom={si + 1} initial="hidden" animate="visible">
          <h2 className="text-2xl italic text-[#3a1f1d] mb-8 pb-4 border-b border-[#3a1f1d]/10" style={{ fontFamily: "'Playfair Display', serif" }}>
            {section.title}
          </h2>
          <div className="flex flex-col gap-8">
            {section.items.map((item) => (
              <div key={item.q} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 pb-8 border-b border-[#3a1f1d]/06">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#3a1f1d]/70" style={{ fontFamily: "'Jost', sans-serif" }}>{item.q}</p>
                <p className="text-sm text-[#3a1f1d]/70 leading-[1.8]" style={{ fontFamily: "'Jost', sans-serif" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      <motion.div className="bg-[#3a1f1d] p-8 mt-6" variants={fadeUp} custom={4} initial="hidden" animate="visible">
        <p className="text-xs uppercase tracking-widest text-white/50 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>Still Have Questions?</p>
        <p className="text-sm text-white/70 mb-4 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>Our team is available Monday–Friday, 9AM–6PM (GMT). We aim to respond to all enquiries within 24 hours.</p>
        <a href="/contact" className="text-xs uppercase tracking-widest text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors" style={{ fontFamily: "'Jost', sans-serif" }}>Contact Us →</a>
      </motion.div>
    </div>
  </motion.div>
);

export default ShippingReturns;
