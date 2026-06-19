import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";
import { PaystackButton } from "react-paystack";

export default function BookAppointment() {
  const bookAppointment = useMutation(api.appointments.book);
  const updateAppointment = useMutation(api.appointments.updateDetails);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+233",
    phone: "",
    date: "",
    time: "",
    garmentType: "",
    notes: "",
    occasionType: "",
    targetEventDate: "",
    ghanaPostGps: "",
    landmarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<any>(null);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // If date changes, reset time
      if (name === 'date') {
        return { ...prev, [name]: value, time: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const availableSlots = useQuery(api.appointments.getAvailableSlots, formData.date ? { date: formData.date } : "skip");
  const commercialsSetting = useQuery(api.settings.getByKey, { key: "commercials" });
  const bookingDepositAmount = commercialsSetting?.value?.bookingDepositAmount || 0;

  const isFormValid = formData.name && formData.email && formData.phone && formData.date && formData.time && formData.garmentType;

  const handlePaystackSuccessAction = async (reference: { reference: string }) => {
    setIsSubmitting(true);
    try {
      await updateAppointment({
        appointmentId: createdAppointmentId,
        paymentStatus: 'paid',
        paystackReference: reference.reference,
      });
      toast.success("Appointment Confirmed", {
        description: "We've received your request and deposit. A confirmation email has been sent."
      });
      setCreatedAppointmentId(null);
      setFormData({ name: "", email: "", countryCode: "+233", phone: "", date: "", time: "", garmentType: "", notes: "", occasionType: "", targetEventDate: "", ghanaPostGps: "", landmarks: "" });
    } catch (error) {
       toast.error("Failed to confirm payment", { description: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaystackCloseAction = () => {
    toast("Payment window closed.");
  };

  const paystackProps = {
    email: formData.email,
    amount: Math.round(bookingDepositAmount * 100),
    metadata: {
      name: formData.name,
      custom_fields: []
    },
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
    text: `PAY DEPOSIT (GH₵${bookingDepositAmount})`,
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { countryCode, ...appointmentData } = formData;
      const aptId = await bookAppointment({
        ...appointmentData,
        phone: `${countryCode} ${appointmentData.phone}`,
        paymentStatus: bookingDepositAmount > 0 ? "pending" : undefined,
      });

      if (bookingDepositAmount > 0) {
        setCreatedAppointmentId(aptId);
      } else {
        toast.success("Appointment Confirmed", {
          description: "We've received your request and will contact you shortly."
        });
        setFormData({ name: "", email: "", countryCode: "+233", phone: "", date: "", time: "", garmentType: "", notes: "", occasionType: "", targetEventDate: "", ghanaPostGps: "", landmarks: "" });
      }
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
          
          {createdAppointmentId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
              <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 text-primary">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl text-primary">Awaiting Payment</h2>
              <p className="font-sans text-on-surface-variant max-w-md">
                Your appointment details are saved securely. To confirm your slot, a deposit of <strong>GH₵{bookingDepositAmount}</strong> is required.
              </p>
              <div className="w-full md:w-auto mt-4">
                <PaystackButton 
                  {...paystackProps} 
                  className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 hover:bg-surface-tint transition-colors w-full"
                />
              </div>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 mt-4 max-w-sm">
                If your mobile money prompt timed out, simply click the button above to retry.
              </p>
            </div>
          ) : (
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
                  <div className="flex gap-4">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleFormChange}
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
                      onChange={handleFormChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                    GhanaPost GPS <span className="text-primary/70 ml-1">(Highly Recommended)</span>
                  </label>
                  <input
                    type="text"
                    name="ghanaPostGps"
                    value={formData.ghanaPostGps}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                    placeholder="e.g. GA-123-4567"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                    Landmarks / Directions (Optional)
                  </label>
                  <textarea
                    name="landmarks"
                    rows={2}
                    value={formData.landmarks}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary resize-none"
                    placeholder="e.g. Opposite the total filling station, blue gate on the left"
                  ></textarea>
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
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleFormChange}
                      disabled={!formData.date || availableSlots === undefined}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary appearance-none rounded-none cursor-pointer disabled:opacity-50"
                      required
                    >
                      <option value="" disabled>
                        {!formData.date 
                          ? "Select a date first" 
                          : availableSlots === undefined 
                            ? "Loading times..." 
                            : availableSlots.length === 0 
                              ? "No times available" 
                              : "Select a time..."}
                      </option>
                      {availableSlots?.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                      Occasion (Optional)
                    </label>
                    <select
                      name="occasionType"
                      value={formData.occasionType}
                      onChange={handleFormChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary appearance-none rounded-none cursor-pointer"
                    >
                      <option value="">None / General</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Funeral">Funeral</option>
                      <option value="Thanksgiving">Thanksgiving</option>
                      <option value="Eid">Eid</option>
                      <option value="Graduation">Graduation</option>
                      <option value="December in GH">December in GH</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                      Target Event Date <span className="text-primary/70 ml-1">(Highly Recommended)</span>
                    </label>
                    <input
                      type="date"
                      name="targetEventDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.targetEventDate}
                      onChange={handleFormChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
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

            <div className="flex flex-col items-center mt-12 pt-12 border-t border-surface-variant">
              {bookingDepositAmount > 0 && (
                <p className="font-sans text-sm text-on-surface-variant mb-6 text-center max-w-md">
                  To secure your fitting, a fully-refundable commitment deposit of <span className="text-primary font-medium">GH₵{bookingDepositAmount}</span> is required. This will be applied toward the final cost of your garment.
                </p>
              )}
              
              {!isFormValid ? (
                 <button 
                   disabled 
                   className="bg-surface-variant text-on-surface-variant font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 transition-colors cursor-not-allowed w-full md:w-auto"
                 >
                   FILL ALL REQUIRED FIELDS
                 </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 hover:bg-surface-tint transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                >
                  {isSubmitting ? "Processing..." : bookingDepositAmount > 0 ? "Proceed to Payment" : "Confirm Appointment"}
                </button>
              )}
            </div>
          </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}
