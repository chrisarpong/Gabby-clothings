import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";

export default function BookAppointment() {
  const bookAppointment = useMutation(api.appointments.book);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    garmentType: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookAppointment({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        garmentType: formData.garmentType,
        notes: formData.notes,
      });

      toast.success("Appointment Confirmed", {
        description: "We've received your request and will contact you shortly."
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        garmentType: "",
        notes: "",
      });
    } catch (error) {
       toast.error("Failed to book appointment", { description: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col pt-32 md:pt-40 pb-24 text-on-surface">
      <div className="max-w-4xl mx-auto px-5 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-serif text-5xl md:text-6xl text-primary italic mb-6">Book an Appointment</h1>
          <p className="font-sans text-on-surface-variant max-w-xl mx-auto">
            Schedule a consultation or fitting with our master tailors. Experience the pinnacle of bespoke elegance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container border border-surface-variant p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Details */}
              <div className="flex flex-col gap-4">
                <h3 className="font-label text-sm tracking-[0.2em] uppercase text-primary border-b border-surface-variant pb-2 mb-2">Personal Details</h3>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                    required
                  />
                </div>
              </div>

              {/* Appointment Details */}
              <div className="flex flex-col gap-4">
                <h3 className="font-label text-sm tracking-[0.2em] uppercase text-primary border-b border-surface-variant pb-2 mb-2">Appointment Details</h3>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Service Type</label>
                  <select
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary appearance-none rounded-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a service...</option>
                    <option value="consultation">Initial Consultation</option>
                    <option value="suit">Bespoke Suit Fitting</option>
                    <option value="shirts">Custom Shirts</option>
                    <option value="wedding">Wedding Attire</option>
                    <option value="alterations">Alterations</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={handleFormChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleFormChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary resize-none"
                    placeholder="Tell us what you're looking for..."
                  ></textarea>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 bg-primary text-on-primary font-label text-xs tracking-widest uppercase py-4 px-8 hover:bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Confirm Appointment"}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
