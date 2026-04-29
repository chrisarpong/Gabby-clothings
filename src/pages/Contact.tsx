import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const submitMessage = useMutation(api.contact.submitMessage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitMessage(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (_e) {
      toast.error('Failed to send message. Please try again.');
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#F5F5F3]"
      style={{ paddingTop: '130px', paddingBottom: '6rem' }}
    >
      <div className="max-w-6xl mx-auto px-[5%]">

        {/* Header */}
        <motion.div className="mb-16" variants={fadeUp} initial="hidden" animate="visible">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>
            Get In Touch
          </p>
          <h1 className="text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Contact Us
          </h1>
          <div className="h-px bg-[#3a1f1d]/10 max-w-[120px]" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-16 md:gap-24">
          {/* Left: Info */}
          <div className="flex flex-col gap-12">
            {[
              {
                label: 'Visit Our Atelier',
                lines: ['12 Independence Avenue', 'Accra, Ghana'],
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                ),
              },
              {
                label: 'Email Us',
                lines: ['hello@gabbynewluk.com', 'bookings@gabbynewluk.com'],
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                ),
              },
              {
                label: 'Call or WhatsApp',
                lines: ['+233 24 000 0000'],
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                ),
              },
              {
                label: 'Opening Hours',
                lines: ['Monday – Friday: 9AM – 6PM', 'Saturday: 10AM – 4PM', 'Sunday: By Appointment Only'],
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
              },
            ].map((item, i) => (
              <motion.div key={item.label} className="flex gap-5" variants={fadeUp} custom={i} initial="hidden" animate="visible">
                <div className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-[#3a1f1d]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {item.icon}
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#3a1f1d]/40 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {item.label}
                  </p>
                  {item.lines.map((l) => (
                    <p key={l} className="text-sm text-[#3a1f1d]/80 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>{l}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Form */}
          <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
            {sent ? (
              <div className="flex flex-col items-start gap-4 py-8">
                <div className="w-12 h-12 rounded-full bg-[#3a1f1d] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl italic text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Message Received</h2>
                <p className="text-sm text-[#3a1f1d]/60 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Thank you for reaching out. A member of our team will respond within 24–48 hours.
                </p>
                <Button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  style={{ backgroundColor: 'transparent', borderColor: '#3a1f1d', border: '1px solid #3a1f1d', color: '#3a1f1d', padding: '12px 28px', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">YOUR NAME</label>
                    <Input 
                      required 
                      value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Kofi Mensah"
                      className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d] w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">EMAIL ADDRESS</label>
                    <Input 
                      required type="email"
                      value={form.email} onChange={(e: any) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="kofi@example.com"
                      className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d] w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">SUBJECT</label>
                  <Input 
                    value={form.subject} onChange={(e: any) => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Bespoke Suit Inquiry"
                    className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d] w-full"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">YOUR MESSAGE</label>
                  <textarea 
                    required rows={6}
                    value={form.message} onChange={(e: any) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us how we can help you..."
                    className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#3a1f1d] w-full resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1.25rem' }}
                >
                  Send Message
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
