import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Clock, ChevronDown, ChevronUp } from "lucide-react";
import PhoneInputCustom from '../components/PhoneInputCustom';

const FloatingInput = ({ label, type = "text", value, onChange, required, name, ...props }: any) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative mt-6 mb-4">
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary transition-colors text-primary peer"
        {...props}
      />
      <label
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-label ${
          focused || hasValue
            ? "-top-4 text-[10px] tracking-widest uppercase text-primary font-bold"
            : "top-2 text-xs tracking-wide text-on-surface-variant uppercase"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

const FloatingTextarea = ({ label, value, onChange, required, name, rows = 4, ...props }: any) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className="relative mt-6 mb-4">
      <textarea
        name={name}
        value={value}
        required={required}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
        className="block w-full bg-transparent border-b border-outline-variant py-2 focus:outline-none focus:border-primary transition-colors text-primary peer resize-none"
        {...props}
      />
      <label
        className={`absolute left-0 transition-all duration-300 pointer-events-none font-label ${
          focused || hasValue
            ? "-top-4 text-[10px] tracking-widest uppercase text-primary font-bold"
            : "top-2 text-xs tracking-wide text-on-surface-variant uppercase"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

const faqs = [
  { question: "How long does a custom suit take to make?", answer: "Typically, our custom process takes 4-6 weeks from the initial consultation to the final fitting. Expedited services are available upon request." },
  { question: "Do you ship internationally?", answer: "Yes, we ship worldwide via DHL Express. International shipping usually takes 3-5 business days." },
  { question: "Can I bring my own fabric?", answer: "Yes, we offer cut-make-trim (CMT) services. Please schedule a consultation so we can evaluate the fabric's suitability for your desired garment." },
  { question: "What is your return policy?", answer: "Ready-to-wear items can be returned in unworn condition within 14 days of delivery. Custom custom and altered garments are final sale." }
];

export default function Contact() {
  const submitMessage = useMutation(api.messages.submitMessage);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitMessage({
        ...formData,
        phone: formData.phone || undefined
      });
      toast.success("Message Sent", { description: "We will get back to you shortly." });
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message", { description: String(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface flex flex-col pt-24">
      
      {/* Hero Section */}
      <section className="bg-brand-charcoal text-brand-bone py-32 px-5 md:px-20 text-center relative overflow-hidden">
        {/* Subtle background texture/image can go here */}
        <div className="absolute inset-0 bg-[url('/assets/hero2.jpg')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-label text-xs tracking-[0.3em] uppercase text-brand-gold mb-6 block"
          >
            We'd Love To Hear From You
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-serif text-5xl md:text-7xl italic leading-tight mb-6"
          >
            Connect With Our Studio.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="font-sans text-brand-bone/80 text-lg"
          >
            Whether it's an inquiry about an upcoming collection, a custom appointment, or a press request, our team is at your disposal.
          </motion.p>
        </div>
      </section>

      {/* Core Split Section */}
      <section className="flex flex-col lg:flex-row max-w-[1536px] w-full mx-auto shadow-2xl relative -mt-12 bg-surface z-20">
        
        {/* Left Side: Contact Details */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full lg:w-5/12 bg-brand-espresso text-brand-bone px-8 md:px-16 py-20 flex flex-col justify-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl italic mb-12 text-brand-gold">Contact Details</h2>

          <div className="flex flex-col gap-10 font-sans text-brand-bone/90">
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-brand-gold mt-1 shrink-0" />
              <div>
                <h3 className="font-label text-[10px] tracking-[0.2em] uppercase text-brand-bone/50 mb-2">Email Inquiries</h3>
                <a href="mailto:studio@gabbynewluk.com" className="text-base hover:text-brand-gold transition-colors">
                  studio@gabbynewluk.com
                </a>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-brand-gold mt-1 shrink-0" />
              <div>
                <h3 className="font-label text-[10px] tracking-[0.2em] uppercase text-brand-bone/50 mb-2">Phone / WhatsApp</h3>
                <a href="tel:+233240000000" className="text-base hover:text-brand-gold transition-colors">
                  +233 (0) 24 000 0000
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-brand-gold mt-1 shrink-0" />
              <div>
                <h3 className="font-label text-[10px] tracking-[0.2em] uppercase text-brand-bone/50 mb-2">Studio Address</h3>
                <address className="not-italic text-base text-pretty leading-relaxed">
                  14 Independence Avenue,<br />
                  Osu, Accra<br />
                  Ghana
                </address>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-5 h-5 text-brand-gold mt-1 shrink-0" />
              <div>
                <h3 className="font-label text-[10px] tracking-[0.2em] uppercase text-brand-bone/50 mb-2">Operating Hours</h3>
                <p className="text-base leading-relaxed">
                  Mon — Fri: 10am to 6pm<br />
                  Saturday: By Appointment Only<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="w-full lg:w-7/12 bg-surface px-8 md:px-20 py-20 flex flex-col justify-center"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-12 italic">Send a Message</h2>
          
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <FloatingInput label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
              <FloatingInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="flex flex-col gap-1 mt-4">
              <label className="font-label text-xs tracking-wide text-on-surface-variant uppercase mb-2">
                Phone Number (Optional)
              </label>
              <PhoneInputCustom
                value={formData.phone}
                onChange={(value) => setFormData(prev => ({ ...prev, phone: value || "" }))}
                className="mt-2"
              />
            </div>

            <div className="mt-2">
              <FloatingInput label="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>

            <div className="mt-2">
              <FloatingTextarea label="Message" name="message" value={formData.message} onChange={handleChange} required rows={4} />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary border border-primary text-on-primary px-12 py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors w-full md:w-auto self-start mt-8 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>

      </section>

      {/* FAQ Section */}
      <section className="py-32 px-5 md:px-20 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="font-label text-[10px] tracking-[0.2em] uppercase text-outline mb-4 block">Information</span>
          <h2 className="font-serif text-3xl md:text-5xl text-primary italic">Frequently Asked Questions</h2>
        </div>
        
        <div className="flex flex-col border-t border-surface-variant">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-surface-variant">
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full py-8 flex justify-between items-center text-left hover:text-primary/80 transition-colors"
              >
                <span className="font-sans text-lg md:text-xl text-primary pr-8">{faq.question}</span>
                {openFaq === index ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 text-primary shrink-0" />}
              </button>
              <AnimatePresence>
                {openFaq === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="pb-8 font-sans text-on-surface-variant text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
