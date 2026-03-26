import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const sections = [
  {
    title: 'Privacy Policy',
    updated: 'Last updated: 26 March 2026',
    items: [
      { heading: 'Information We Collect', body: 'We collect personal information you provide when placing an order or booking an appointment — including your name, email address, phone number, and shipping address. We may also collect non-personal browsing data including IP address and device type to improve site performance.' },
      { heading: 'How We Use Your Information', body: 'Your data is used exclusively to process orders, fulfil appointment bookings, and communicate order and appointment updates. We do not sell, rent, or share your personal information with third parties for marketing purposes.' },
      { heading: 'Payment Security', body: 'All payment transactions are processed through Paystack, a PCI-DSS compliant payment gateway. Gabby Newluk does not store or have access to your card details.' },
      { heading: 'Cookies', body: 'We use essential cookies to maintain your session and cart. By using our website, you consent to the use of cookies as described in this policy.' },
      { heading: 'Your Rights', body: 'You have the right to request access to, correction of, or deletion of your personal data at any time. To exercise these rights, contact us at privacy@gabbynewluk.com.' },
      { heading: 'Data Retention', body: 'We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy, or as required by law.' },
    ],
  },
  {
    title: 'Terms & Conditions',
    updated: 'Last updated: 26 March 2026',
    items: [
      { heading: 'Use of the Website', body: 'By accessing and using this website, you accept and agree to be bound by these Terms & Conditions. If you do not agree, please refrain from using this site.' },
      { heading: 'Products & Pricing', body: 'All prices are displayed in Ghanaian Cedis (GHS) and are subject to change without notice. We reserve the right to decline any order at our discretion.' },
      { heading: 'Bespoke Orders', body: 'All bespoke orders require a non-refundable (or conditionally refundable) deposit to commence. Once production begins, orders cannot be cancelled. Changes may be accommodated at our discretion and may attract additional charges.' },
      { heading: 'Intellectual Property', body: 'All content on this website including images, text, logos, and designs are the intellectual property of Gabby Newluk. Unauthorised reproduction or redistribution of any material is strictly prohibited.' },
      { heading: 'Limitation of Liability', body: 'Gabby Newluk shall not be liable for any indirect, incidental, or consequential loss arising from the use of our products or services, to the extent permitted by applicable Ghanaian law.' },
      { heading: 'Governing Law', body: 'These terms are governed by the laws of the Republic of Ghana. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ghana.' },
      { heading: 'Contact', body: 'For any legal enquiries, contact us at legal@gabbynewluk.com or visit our atelier at 12 Independence Avenue, Accra, Ghana.' },
    ],
  },
];

const Legal = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-[#F5F5F3]" style={{ paddingTop: '130px', paddingBottom: '6rem' }}>
    <div className="max-w-4xl mx-auto px-[5%]">

      <motion.div className="mb-16" variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>Documentation</p>
        <h1 className="text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>Legal & Privacy</h1>
        <div className="h-px bg-[#3a1f1d]/10 max-w-[120px]" />
      </motion.div>

      {sections.map((section, si) => (
        <motion.div key={section.title} className="mb-16" variants={fadeUp} custom={si + 1} initial="hidden" animate="visible">
          <div className="flex items-baseline justify-between mb-8 pb-4 border-b border-[#3a1f1d]/10">
            <h2 className="text-2xl italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>{section.title}</h2>
            <span className="text-[10px] uppercase tracking-wider text-[#3a1f1d]/30 hidden md:block" style={{ fontFamily: "'Jost', sans-serif" }}>{section.updated}</span>
          </div>
          <div className="flex flex-col gap-8">
            {section.items.map((item) => (
              <div key={item.heading} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 pb-8 border-b border-[#3a1f1d]/06">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#3a1f1d]/70 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>{item.heading}</p>
                <p className="text-sm text-[#3a1f1d]/70 leading-[1.8]" style={{ fontFamily: "'Jost', sans-serif" }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default Legal;
