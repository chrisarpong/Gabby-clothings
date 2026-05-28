import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export default function Contact() {
  const submitMessage = useMutation(api.messages.submitMessage);
  
    name: "",
    email: "",
    countryCode: "+233",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      await submitMessage({
        ...formData,
        phone: formData.phone ? `${formData.countryCode} ${formData.phone}` : undefined
      } as any);
      toast.success("Message sent successfully!", { description: "We will get back to you shortly." });
      setFormData({ name: "", email: "", countryCode: "+233", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message", { description: String(err) });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <main className="min-h-screen bg-surface text-on-surface flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side: Contact Details */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen bg-surface-container-low px-5 md:px-20 pt-40 pb-24 flex flex-col justify-center border-r border-surface-variant"
        >
          <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto w-full pr-0 lg:pr-12 xl:pr-24">
            <span className="font-label text-sm tracking-[0.2em] uppercase font-bold text-outline block mb-6">
              Connect With Us
            </span>
            <h1 className="font-serif text-5xl md:text-7xl italic text-primary leading-tight mb-16">
              Get in Touch.
            </h1>

            <div className="flex flex-col gap-12 font-sans text-on-surface-variant">
              <div>
                <h3 className="font-label text-[11px] tracking-widest uppercase text-primary mb-3">Email Inquiries</h3>
                <a href="mailto:atelier@gabbynewluk.com" className="text-lg hover:text-primary transition-colors">
                  atelier@gabbynewluk.com
                </a>
              </div>
              
              <div>
                <h3 className="font-label text-[11px] tracking-widest uppercase text-primary mb-3">Phone / WhatsApp</h3>
                <a href="tel:+233240000000" className="text-lg hover:text-primary transition-colors">
                  +233 (0) 24 000 0000
                </a>
              </div>

              <div>
                <h3 className="font-label text-[11px] tracking-widest uppercase text-primary mb-3">Studio Address</h3>
                <address className="not-italic text-lg text-pretty leading-relaxed">
                  14 Independence Avenue,<br />
                  Osu, Accra<br />
                  Ghana
                </address>
              </div>

              <div>
                <h3 className="font-label text-[11px] tracking-widest uppercase text-primary mb-3">Operating Hours</h3>
                <p className="text-lg leading-relaxed">
                  Monday — Friday: 10am to 6pm<br />
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
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen bg-surface px-5 md:px-20 pt-24 lg:pt-40 pb-24 flex flex-col justify-center"
        >
          <div className="max-w-md mx-auto lg:mx-0 w-full xl:pl-12">
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-12 italic">Send a Message</h2>
            
            <form className="flex flex-col gap-10" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] tracking-widest text-outline uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary py-1"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] tracking-widest text-outline uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary py-1"
                />
              </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] tracking-widest text-outline uppercase">
                  Phone Number (Optional)
                </label>
                <div className="flex gap-4">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange as any}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary w-24 appearance-none"
                  >
                    <option value="+233">🇬🇭 +233</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+234">🇳🇬 +234</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary flex-1 py-1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] tracking-widest text-outline uppercase">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary py-1"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[10px] tracking-widest text-outline uppercase">
                  Message
                </label>
                <textarea
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary resize-none py-1"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-transparent border border-primary text-primary px-12 py-5 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-on-primary transition-colors w-fit mt-4"
              >
                Send Message
              </button>
            </form>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
