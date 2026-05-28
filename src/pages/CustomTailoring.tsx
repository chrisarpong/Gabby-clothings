import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { PaystackButton } from "react-paystack";

export default function CustomTailoring() {
  const [searchParams] = useSearchParams();
  const productSource = searchParams.get("product");
  const productTitle = searchParams.get("title");
  
  const bookAppointment = useMutation(api.appointments.book);
  const generateUploadUrl = useMutation(api.appointments.generateUploadUrl);

  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    sleeve: "",
    inseam: "",
    length: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    garmentType: "",
    fittingDate: "",
    time: "",
    details: productTitle ? `I am requesting custom sizing for the ${productTitle}.` : "",
  });

  const [isSaved, setIsSaved] = useState(false);

  const [designInspoPreview, setDesignInspoPreview] = useState<string | null>(null);
  const [bodyPhotoPreview, setBodyPhotoPreview] = useState<string | null>(null);
  const [designInspoFile, setDesignInspoFile] = useState<File | null>(null);
  const [bodyPhotoFile, setBodyPhotoFile] = useState<File | null>(null);

  const handleInspoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignInspoFile(file);
      setDesignInspoPreview(URL.createObjectURL(file));
    } else {
      setDesignInspoFile(null);
      setDesignInspoPreview(null);
    }
  };

  const handleBodyPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBodyPhotoFile(file);
      setBodyPhotoPreview(URL.createObjectURL(file));
    } else {
      setBodyPhotoFile(null);
      setBodyPhotoPreview(null);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("gabby_newluk_measurements");
    if (saved) {
      setMeasurements(JSON.parse(saved));
    }
  }, []);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeasurements((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSaved(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'fittingDate') {
        return { ...prev, [name]: value, time: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const availableSlots = useQuery(api.appointments.getAvailableSlots, formData.fittingDate ? { date: formData.fittingDate } : "skip");
  const commercialsSetting = useQuery(api.settings.getByKey, { key: "commercials" });
  const bookingDepositAmount = commercialsSetting?.value?.bookingDepositAmount || 0;

  const isFormValid = formData.fullName && formData.email && formData.phone && formData.fittingDate && formData.time && formData.garmentType && designInspoPreview && bodyPhotoPreview;

  const uploadFile = async (file: File | null) => {
    if (!file) return null;
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  const handlePaystackSuccessAction = async (reference: any) => {
    try {
      toast.loading("Uploading reference images...");
      const inspoStorageId = await uploadFile(designInspoFile);
      const bodyStorageId = await uploadFile(bodyPhotoFile);
      const storageIds = [inspoStorageId, bodyStorageId].filter(Boolean) as string[];

      await bookAppointment({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        date: formData.fittingDate || new Date().toISOString(),
        garmentType: formData.garmentType,
        time: formData.time,
        notes: formData.details,
        paystackReference: reference.reference,
        amountPaid: bookingDepositAmount,
        referenceImages: storageIds.length > 0 ? (storageIds as any) : undefined,
      });

      toast.dismiss();
      toast.success("Appointment request received!", {
        description: "We've received your deposit and request. A confirmation email has been sent."
      });
      
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        garmentType: "",
        fittingDate: "",
        time: "",
        details: "",
      });
      setDesignInspoFile(null);
      setDesignInspoPreview(null);
      setBodyPhotoFile(null);
      setBodyPhotoPreview(null);
    } catch (error) {
       toast.dismiss();
       toast.error("Failed to book appointment", { description: String(error) });
    }
  };

  const handlePaystackCloseAction = () => {
    toast("Payment window closed.");
  };

  const paystackProps = {
    email: formData.email,
    amount: Math.round(bookingDepositAmount * 100),
    metadata: {
      name: formData.fullName,
      custom_fields: []
    },
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_b986f2a5ddf031f129c32b4b055a2c05653f7ea6",
    text: `PAY DEPOSIT (GH₵${bookingDepositAmount})`,
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  const saveMeasurements = () => {
    localStorage.setItem("gabby_newluk_measurements", JSON.stringify(measurements));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingDepositAmount > 0) return; // Prevent double-booking: let Paystack handle it
    try {
      toast.loading("Uploading reference images...");
      const inspoStorageId = await uploadFile(designInspoFile);
      const bodyStorageId = await uploadFile(bodyPhotoFile);
      const storageIds = [inspoStorageId, bodyStorageId].filter(Boolean) as string[];

      await bookAppointment({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        date: formData.fittingDate || new Date().toISOString(),
        garmentType: formData.garmentType,
        time: formData.time,
        notes: formData.details,
        referenceImages: storageIds.length > 0 ? (storageIds as any) : undefined,
      });

      toast.dismiss();
      toast.success("Appointment request received!", {
        description: "A confirmation email has been sent."
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        garmentType: "",
        fittingDate: "",
        time: "",
        details: "",
      });
      setDesignInspoFile(null);
      setDesignInspoPreview(null);
      setBodyPhotoFile(null);
      setBodyPhotoPreview(null);
    } catch (error) {
       toast.dismiss();
       toast.error("Failed to book appointment", { description: String(error) });
    }
  }

  const processSteps = [
    {
      title: "Consultation",
      desc: "We discuss your vision, event needs, and help you select from our premium fabrics.",
      image: "/assets/21.jpeg",
    },
    {
      title: "Measurement",
      desc: "Precision is our signature. We take exact measurements to ensure a flawless drape.",
      image: "/assets/26.jpeg",
    },
    {
      title: "The Fitting",
      desc: "We invite you back to refine the fit and make any necessary adjustments.",
      image: "/assets/agbada 2.jpeg",
    },
    {
      title: "Completion",
      desc: "Your bespoke garment is ready, perfectly tailored to you and your lifestyle.",
      image: "/assets/kaftan.jpeg",
    },
  ];

  return (
    <main className="bg-surface text-on-surface min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/assets/parallax-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center text-white px-5"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic leading-tight mb-6">
            Custom Tailoring
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
            Garments crafted to your exact measurements, designed for your lifestyle.
          </p>
        </motion.div>
      </section>

      {/* The Process */}
      <section className="py-24 md:py-32 px-5 md:px-20 max-w-[1536px] mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-6xl text-primary italic mb-20 text-center"
        >
          Our Process
        </motion.h2>

        <div className="flex flex-col gap-20 md:gap-32">
          {processSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div
                key={step.title}
                className={`flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-10 md:gap-20`}
              >
                <motion.div
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full md:w-1/2 aspect-[4/5] md:aspect-square bg-surface-container overflow-hidden"
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className="w-full md:w-1/2 flex flex-col justify-center"
                >
                  <span className="font-serif text-4xl md:text-6xl text-outline-variant italic mb-6">
                    0{index + 1}
                  </span>
                  <h3 className="font-serif text-3xl md:text-4xl text-primary mb-6">
                    {step.title}
                  </h3>
                  <p className="font-sans text-lg text-on-surface-variant leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Booking & Measurements Form */}
      <section className="py-24 bg-surface-container-lowest border-t border-surface-variant px-5 md:px-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-surface-container/50 backdrop-blur-md border border-surface-variant p-8 md:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <h2 className="font-serif text-3xl md:text-5xl text-primary italic mb-4 text-center">
            Submit Your Measurements
          </h2>
          <p className="font-sans text-on-surface-variant text-center mb-12 max-w-xl mx-auto">
            Provide your exact measurements and design inspiration to begin the custom tailoring process. You can save your measurements for future orders.
          </p>

          <form className="flex flex-col gap-12" onSubmit={handleSubmit}>

            {/* Personal Info */}
            <div className="space-y-6">
              <h3 className="font-label text-sm tracking-[0.2em] uppercase text-primary border-b border-surface-variant pb-2">
                1. Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary placeholder:text-outline/50"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary placeholder:text-outline/50"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary placeholder:text-outline/50"
                    placeholder="+233 XXX XXX XXX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Exact Measurements */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-surface-variant pb-2 gap-4">
                <h3 className="font-label text-sm tracking-[0.2em] uppercase text-primary">
                  2. Exact Measurements (Inches)
                </h3>
                <button
                  type="button"
                  onClick={saveMeasurements}
                  className="text-[10px] font-label uppercase tracking-widest text-primary border border-primary px-3 py-1 hover:bg-primary hover:text-on-primary transition-colors"
                >
                  {isSaved ? "Saved Successfully!" : "Save Measurements"}
                </button>
              </div>
              <p className="text-xs text-on-surface-variant">Provide your measurements. If you are unsure, leave blank and we will take them during your fitting.</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Chest / Bust", name: "chest" },
                  { label: "Waist", name: "waist" },
                  { label: "Hips", name: "hips" },
                  { label: "Shoulder Width", name: "shoulder" },
                  { label: "Sleeve Length", name: "sleeve" },
                  { label: "Inseam", name: "inseam" },
                  { label: "Total Length", name: "length" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-2">
                    <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">{field.label}</label>
                    <input
                      type="number"
                      name={field.name}
                      value={measurements[field.name as keyof typeof measurements]}
                      onChange={handleMeasurementChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                      placeholder='e.g. 40"'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Garment & Inspo */}
            <div className="space-y-6">
              <h3 className="font-label text-sm tracking-[0.2em] uppercase text-primary border-b border-surface-variant pb-2">
                3. Garment Details & Inspiration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Garment Type *</label>
                  <select
                    name="garmentType"
                    value={formData.garmentType}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary appearance-none cursor-pointer"
                    required
                  >
                    <option value="" disabled>Select a type...</option>
                    <option value="mens-kaftan">Men's Kaftan / Agbada</option>
                    <option value="womens-wear">Women's Evening Wear</option>
                    <option value="two-piece">Two-Piece Suit</option>
                    <option value="traditional">Traditional Wear</option>
                    <option value="alterations">Alterations</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Preferred Fitting Date</label>
                    <input
                      type="date"
                      name="fittingDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.fittingDate}
                      onChange={handleFormChange}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Time</label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleFormChange}
                      disabled={!formData.fittingDate || availableSlots === undefined}
                      className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary appearance-none rounded-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="" disabled>
                        {!formData.fittingDate 
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

                <div className="flex flex-col gap-4 md:col-span-2">
                  <p className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase mt-2">Required Uploads</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-surface p-6 border border-outline-variant border-dashed">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-primary">Design Inspiration</label>
                        <p className="text-xs text-on-surface-variant mb-2">Upload a reference photo of the style.</p>
                        <input onChange={handleInspoChange} accept="image/*" type="file" required className="text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-label file:tracking-widest file:uppercase file:bg-surface-container file:text-primary hover:file:bg-surface-variant cursor-pointer transition-colors" />
                      </div>
                      {designInspoPreview && (
                        <div className="aspect-[3/4] w-32 bg-surface-container overflow-hidden border border-surface-variant">
                          <img src={designInspoPreview} alt="Design Inspiration Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-primary">Full Body Photo</label>
                        <p className="text-xs text-on-surface-variant mb-2">Upload a picture of yourself for scale.</p>
                        <input onChange={handleBodyPhotoChange} accept="image/*" type="file" required className="text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-label file:tracking-widest file:uppercase file:bg-surface-container file:text-primary hover:file:bg-surface-variant cursor-pointer transition-colors" />
                      </div>
                      {bodyPhotoPreview && (
                        <div className="aspect-[3/4] w-32 bg-surface-container overflow-hidden border border-surface-variant">
                          <img src={bodyPhotoPreview} alt="Full Body Photo Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2 mt-4">
                  <label className="font-label text-[11px] tracking-widest text-on-surface-variant uppercase">Additional Details</label>
                  <textarea
                    name="details"
                    rows={4}
                    value={formData.details}
                    onChange={handleFormChange}
                    className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary resize-none placeholder:text-outline/50"
                    placeholder="Describe specific fabrics, colors, or event context..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center mt-12 pt-12 border-t border-surface-variant">
              {bookingDepositAmount > 0 && (
                <p className="font-sans text-sm text-on-surface-variant mb-6 text-center max-w-md">
                  To secure your bespoke fitting, a fully-refundable commitment deposit of <span className="text-primary font-medium">GH₵{bookingDepositAmount}</span> is required. This will be applied toward the final cost of your garment.
                </p>
              )}
              
              {!isFormValid ? (
                 <button 
                   disabled 
                   className="bg-surface-variant text-on-surface-variant font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 transition-colors cursor-not-allowed w-full md:w-auto"
                 >
                   FILL ALL REQUIRED FIELDS & UPLOAD PHOTOS
                 </button>
              ) : bookingDepositAmount > 0 ? (
                <div className="w-full sm:w-auto self-center min-w-[250px]">
                  <PaystackButton 
                    {...paystackProps} 
                    // @ts-ignore
                    type="button"
                    className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-5 px-12 hover:bg-surface-tint transition-colors w-full"
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-5 px-8 hover:bg-surface-tint transition-colors w-full sm:w-auto self-center min-w-[250px]"
                >
                  Request a Fitting
                </button>
              )}
            </div>

          </form>
        </motion.div>
      </section>
    </main>
  );
}
