import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@/hooks/useConvex";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Calendar, Clock, User, Mail, Phone, MessageSquare, MapPin, ChevronRight, ChevronLeft, CheckCircle2, Scissors } from "lucide-react";
import { PaystackButton } from "react-paystack";
import PhoneInputCustom from '../components/PhoneInputCustom';
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../utils/currency";

export default function BookAppointment() {
  const bookAppointment = useMutation(api.appointments.book);
  const updateAppointment = useMutation(api.appointments.updateDetails);
  const { activeCurrency, rates } = useCurrencyStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      if (name === 'date') {
        return { ...prev, [name]: value, time: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const availableSlots = useQuery(api.appointments.getAvailableSlots, formData.date ? { date: formData.date } : "skip");
  const commercialsSetting = useQuery(api.settings.getByKey, { key: "commercials" });
  const bookingDepositAmount = commercialsSetting?.value?.bookingDepositAmount || 0;

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) return formData.garmentType.length > 0;
    if (currentStep === 2) return formData.date.length > 0 && formData.time.length > 0;
    if (currentStep === 3) return formData.name.length > 0 && formData.email.length > 0 && formData.phone.length > 0;
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast.error("Please fill all required fields before proceeding.");
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

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
      setStep(5); // Success step
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
    text: `PAY DEPOSIT (${formatPrice(bookingDepositAmount, activeCurrency, rates)})`,
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const aptId = await bookAppointment({
        ...formData,
        paymentStatus: bookingDepositAmount > 0 ? "pending" : undefined,
      });

      if (bookingDepositAmount > 0) {
        setCreatedAppointmentId(aptId);
        setStep(4);
      } else {
        toast.success("Appointment Confirmed", {
          description: "We've received your request and will contact you shortly."
        });
        setStep(5); // Success step
      }
    } catch (error) {
       toast.error("Failed to book appointment", { description: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <main className="min-h-screen bg-surface flex mt-24">
      {/* Left Column: Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary relative overflow-hidden flex-col justify-end p-16 text-brand-bone">
        {/* We can use a solid color with a nice pattern or an actual image. */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="relative z-10">
          <h2 className="font-serif text-5xl italic leading-tight mb-6">
            Crafting Elegance,<br/>One Stitch at a Time.
          </h2>
          <p className="font-sans text-brand-bone/80 max-w-md leading-relaxed">
            Experience the pinnacle of custom tailoring. Schedule a consultation with our master tailors to begin your journey toward sartorial perfection.
          </p>
        </div>
      </div>

      {/* Right Column: Form Wizard */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-12 px-6 sm:px-12 md:px-24">
        <div className="w-full max-w-md">
          
          {step < 5 && (
            <div className="mb-12">
              <span className="font-label text-[10px] tracking-widest uppercase text-outline mb-4 block">
                Step {step} of 4
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 h-1 bg-surface-variant relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: step >= s ? 1 : 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      style={{ transformOrigin: "left" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: SERVICE */}
            {step === 1 && (
              <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-8">
                <div>
                  <h2 className="font-serif text-3xl text-primary mb-2">The Service</h2>
                  <p className="font-sans text-sm text-on-surface-variant">What can we craft for you today?</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Scissors className="w-3 h-3" /> Service Type
                  </label>
                  <select name="garmentType" value={formData.garmentType} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary appearance-none cursor-pointer" required>
                    <option value="" disabled>Select a service...</option>
                    <option value="consultation">Initial Consultation</option>
                    <option value="suit">Custom Suit Fitting</option>
                    <option value="shirts">Custom Shirts</option>
                    <option value="wedding">Wedding Attire</option>
                    <option value="alterations">Alterations</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Occasion</label>
                    <select name="occasionType" value={formData.occasionType} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary appearance-none cursor-pointer">
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
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Event Date</label>
                    <input type="date" name="targetEventDate" min={new Date().toISOString().split('T')[0]} value={formData.targetEventDate} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <MessageSquare className="w-3 h-3" /> Additional Notes
                  </label>
                  <textarea name="notes" rows={2} value={formData.notes} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary resize-none" placeholder="Tell us what you're looking for..."></textarea>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SCHEDULE */}
            {step === 2 && (
              <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-8">
                <div>
                  <h2 className="font-serif text-3xl text-primary mb-2">The Schedule</h2>
                  <p className="font-sans text-sm text-on-surface-variant">When would you like to come in?</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Date
                  </label>
                  <input type="date" name="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary" required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Time
                  </label>
                  <select name="time" value={formData.time} onChange={handleFormChange} disabled={!formData.date || availableSlots === undefined} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary appearance-none cursor-pointer disabled:opacity-50" required>
                    <option value="" disabled>
                      {!formData.date ? "Select a date first" : availableSlots === undefined ? "Loading times..." : availableSlots.length === 0 ? "No times available" : "Select a time..."}
                    </option>
                    {availableSlots?.map((slot: string) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-8">
                <div>
                  <h2 className="font-serif text-3xl text-primary mb-2">Your Details</h2>
                  <p className="font-sans text-sm text-on-surface-variant">How can we reach you?</p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary" required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary" required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone Number
                  </label>
                  <PhoneInputCustom
                    value={formData.phone}
                    onChange={(value) => setFormData(prev => ({ ...prev, phone: value || "" }))}
                    className="mt-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">GhanaPost GPS</label>
                    <input type="text" name="ghanaPostGps" value={formData.ghanaPostGps} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary" placeholder="Optional" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Landmarks</label>
                    <input type="text" name="landmarks" value={formData.landmarks} onChange={handleFormChange} className="bg-transparent border-b border-outline-variant py-3 focus:outline-none focus:border-primary transition-colors text-primary" placeholder="Optional" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: CONFIRMATION & PAYMENT */}
            {step === 4 && (
              <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col gap-8 text-center">
                {!createdAppointmentId ? (
                  <>
                    <div className="mb-4">
                      <h2 className="font-serif text-3xl text-primary mb-2">Review & Confirm</h2>
                      <p className="font-sans text-sm text-on-surface-variant">Verify your details before confirming.</p>
                    </div>
                    <div className="bg-surface-container border border-surface-variant p-6 text-left flex flex-col gap-4 text-sm">
                       <div><span className="text-outline uppercase text-[10px] tracking-widest block mb-1">Service</span><span className="text-primary">{formData.garmentType}</span></div>
                       <div><span className="text-outline uppercase text-[10px] tracking-widest block mb-1">Date & Time</span><span className="text-primary">{formData.date} at {formData.time}</span></div>
                       <div><span className="text-outline uppercase text-[10px] tracking-widest block mb-1">Contact</span><span className="text-primary">{formData.name} ({formData.email})</span></div>
                    </div>
                    {bookingDepositAmount > 0 && (
                      <p className="font-sans text-sm text-on-surface-variant mt-4">
                        A fully-refundable commitment deposit of <strong className="text-primary">{formatPrice(bookingDepositAmount, activeCurrency, rates)}</strong> is required to secure your slot.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <h2 className="font-serif text-3xl text-primary mb-2">Complete Payment</h2>
                      <p className="font-sans text-sm text-on-surface-variant">Your request is saved. Pay the deposit to confirm.</p>
                    </div>
                    <PaystackButton {...paystackProps} className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 hover:bg-surface-tint transition-colors w-full" />
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && (
              <motion.div key="step5" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="flex flex-col items-center text-center gap-6 py-12">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="font-serif text-4xl text-primary italic">Confirmed</h2>
                <p className="font-sans text-on-surface-variant max-w-sm">
                  We look forward to seeing you. A confirmation email has been sent to {formData.email}.
                </p>
                <button onClick={() => window.location.href = '/'} className="mt-8 border border-primary text-primary px-8 py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-colors">
                  Return Home
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex gap-4 mt-12 pt-8 border-t border-surface-variant">
              {step > 1 && (
                <button onClick={handleBack} className="flex-1 py-4 border border-outline-variant text-primary font-label text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button onClick={handleNext} className="flex-1 py-4 bg-primary text-on-primary font-label text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {step === 4 && !createdAppointmentId && (
            <div className="flex gap-4 mt-12 pt-8 border-t border-surface-variant">
              <button onClick={handleBack} className="flex-1 py-4 border border-outline-variant text-primary font-label text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-4 bg-primary text-on-primary font-label text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors disabled:opacity-50">
                {isSubmitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
