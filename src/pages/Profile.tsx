import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignOutButton, UserProfile, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';
import { toast } from "sonner";
import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice, CurrencyCode } from "../utils/currency";
import { ThemeToggle } from "../components/ThemeToggle";

export default function Profile() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const { activeCurrency, rates } = useCurrencyStore();

  const [measurements, setMeasurements] = useState({
    top: { neck: "", chest: "", shoulder: "", sleeveLength: "", armhole: "", stomach: "", topLength: "" },
    bottom: { trouserWaist: "", hips: "", thigh: "", kneeAnkle: "", trouserLength: "", crotch: "" },
    outerwear: { agbadaLength: "", agbadaWidth: "" }
  });

  const [isSaved, setIsSaved] = useState(false);

  const convexOrders = useQuery(api.orders.getUserOrders, user ? { userId: user.id } : "skip");
  const convexMeasurements = useQuery(api.users.getMeasurements);
  const updateMeasurements = useMutation(api.users.updateMeasurements);
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  
  const [profileData, setProfileData] = useState({
    dob: "",
    phone: "",
    whatsapp: "",
    country: "GH",
  });
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const wishlistItems = useQuery(api.wishlists.getUserWishlist);
  const toggleWishlist = useMutation(api.wishlists.toggleItem);

  const appointments = useQuery(api.appointments.getUserAppointments, user ? { userId: user.id } : "skip");
  const cancelOwnAppointment = useMutation(api.appointments.cancelOwnAppointment);
  const rescheduleAppointment = useMutation(api.appointments.reschedule);

  const [rescheduleData, setRescheduleData] = useState<{ id: any; date: string; time: string; } | null>(null);
  const availableSlots = useQuery(api.appointments.getAvailableSlots, rescheduleData?.date ? { date: rescheduleData.date, ignoreAppointmentId: rescheduleData.id } : "skip");

  const handleCancelAppointment = async (id: any) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelOwnAppointment({ appointmentId: id });
        toast.success("Appointment cancelled successfully.");
      } catch (e) {
        toast.error("Failed to cancel appointment.");
      }
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData || !rescheduleData.date) return;
    try {
      await rescheduleAppointment({
        appointmentId: rescheduleData.id,
        date: rescheduleData.date,
        time: rescheduleData.time,
      });
      toast.success("Appointment rescheduled successfully.");
      setRescheduleData(null);
    } catch (e) {
      toast.error("Failed to reschedule appointment.");
    }
  };

  useEffect(() => {
    if (convexMeasurements) {
      setMeasurements({
        top: convexMeasurements.top || { neck: "", chest: "", shoulder: "", sleeveLength: "", armhole: "", stomach: "", topLength: "" },
        bottom: convexMeasurements.bottom || { trouserWaist: "", hips: "", thigh: "", kneeAnkle: "", trouserLength: "", crotch: "" },
        outerwear: convexMeasurements.outerwear || { agbadaLength: "", agbadaWidth: "" }
      });
    }
  }, [convexMeasurements]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        dob: currentUser.dob || "",
        phone: currentUser.phone || "",
        whatsapp: currentUser.whatsapp || "",
        country: currentUser.country || "GH",
      });
      if (currentUser.phone && currentUser.phone === currentUser.whatsapp) {
        setSameAsPhone(true);
      }
    }
  }, [currentUser]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setIsProfileSaved(false);
    if (field === 'phone') {
       setPhoneError("");
       if (sameAsPhone) {
         setProfileData(prev => ({ ...prev, whatsapp: value }));
       }
    }
  };

  const handleSameAsPhoneToggle = (checked: boolean) => {
    setSameAsPhone(checked);
    if (checked) {
      setProfileData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  const saveProfileData = async () => {
    if (!user) return;
    
    // Validate phone
    if (profileData.phone) {
      const phoneNumber = parsePhoneNumberFromString(profileData.phone, profileData.country as CountryCode);
      if (!phoneNumber || !phoneNumber.isValid()) {
        setPhoneError("Invalid phone number for the selected country");
        return;
      }
    }

    try {
      setIsProfileSaving(true);
      await updateProfile({
        clerkId: user.id,
        dob: profileData.dob,
        phone: profileData.phone,
        whatsapp: profileData.whatsapp,
        country: profileData.country,
      });
      setIsProfileSaved(true);
      toast.success("Profile details saved!");
      setTimeout(() => setIsProfileSaved(false), 3000);
    } catch (e) {
      toast.error("Failed to save profile details");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleMeasurementChange = (category: 'top' | 'bottom' | 'outerwear', field: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setIsSaved(false);
  };

  const saveMeasurements = async () => {
    if (!user) return;
    try {
      await updateMeasurements({
        clerkId: user.id,
        measurements: measurements
      });
      setIsSaved(true);
      toast.success("Measurements saved successfully!");
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      toast.error("Failed to save measurements");
      console.error(err);
    }
  };

  const menuItems = [
    { id: "profile", label: "My Profile" },
    { id: "orders", label: "Order History" },
    { id: "appointments", label: "My Appointments" },
    { id: "measurements", label: "My Measurements" },
    { id: "saved", label: "Saved Items" },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing": return "text-orange-600 border-orange-600/30 bg-orange-50";
      case "shipped": return "text-blue-600 border-blue-600/30 bg-blue-50";
      case "delivered": return "text-green-600 border-green-600/30 bg-green-50";
      default: return "text-primary border-primary/30";
    }
  };

  return (
    <main className="min-h-screen bg-surface text-on-surface pt-32 pb-32">
      <div className="max-w-[1536px] mx-auto px-5 md:px-20 w-full">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 md:mb-24 border-b border-surface-variant pb-8"
        >
          <span className="font-label text-sm tracking-[0.2em] uppercase text-outline block mb-4">Member Portal</span>
          <h1 className="font-serif text-4xl md:text-6xl text-primary italic">Welcome, Patron.</h1>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Sidebar Menu */}
          <motion.aside 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-1/4 shrink-0"
          >
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`py-4 px-6 text-left font-label text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
                    activeTab === item.id 
                      ? "bg-primary text-on-primary" 
                      : "bg-transparent text-primary hover:bg-surface-container"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <SignedIn>
                <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
                  <button className="w-full py-4 px-6 text-left font-label text-[11px] tracking-[0.2em] uppercase text-outline hover:text-primary transition-colors mt-8 border-t border-surface-variant pt-8">
                    Sign Out
                  </button>
                </SignOutButton>
              </SignedIn>
            </nav>
          </motion.aside>

          {/* Content Area */}
          <div className="flex-1 min-h-[500px]">
            <SignedOut>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 text-center border border-dashed border-surface-variant"
              >
                <p className="font-serif text-2xl italic text-primary mb-6">Authentication Required</p>
                <p className="font-sans text-on-surface-variant text-sm mb-8">Please sign in to view and manage your profile settings.</p>
                <SignInButton mode="modal">
                  <button className="bg-primary text-on-primary px-8 py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </motion.div>
            </SignedOut>

            <SignedIn>
              <AnimatePresence mode="wait">
              
              {activeTab === "measurements" && (
                <motion.div
                  key="measurements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-serif text-3xl text-primary italic mb-6">Client Measurements</h2>
                  <p className="font-sans text-on-surface-variant text-sm mb-12 max-w-2xl leading-relaxed">
                    Maintain your precise sizing profile for future custom commissions. Updates to these measurements will automatically apply to all forthcoming tailored orders.
                  </p>

                  <div className="bg-surface-container/30 border border-surface-variant p-8 md:p-12 mb-8">
                    <form className="flex flex-col gap-12" onSubmit={e => { e.preventDefault(); saveMeasurements(); }}>
                      
                      {/* TOP SECTION */}
                      <div>
                        <h3 className="font-label text-sm tracking-widest uppercase text-primary mb-6 border-b border-surface-variant pb-2">Top / Shirt (Kaftans & Suits)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                          {[
                            { label: "Neck", name: "neck", placeholder: "e.g. 16\"" },
                            { label: "Chest", name: "chest", placeholder: "e.g. 40\"" },
                            { label: "Shoulder", name: "shoulder", placeholder: "e.g. 18\"" },
                            { label: "Sleeve Length", name: "sleeveLength", placeholder: "e.g. 25\"" },
                            { label: "Armhole / Bicep", name: "armhole", placeholder: "e.g. 15\"" },
                            { label: "Stomach / Waist", name: "stomach", placeholder: "e.g. 36\"" },
                            { label: "Top Length", name: "topLength", placeholder: "e.g. 38\"" },
                          ].map((field) => (
                            <div key={field.name} className="flex flex-col gap-2">
                              <label htmlFor={`top-${field.name}`} className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                                {field.label}
                              </label>
                              <input
                                type="text"
                                id={`top-${field.name}`}
                                value={measurements.top[field.name as keyof typeof measurements.top]}
                                onChange={(e) => handleMeasurementChange('top', field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary text-xl font-serif italic placeholder:text-outline-variant/30 placeholder:not-italic"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* BOTTOM SECTION */}
                      <div>
                        <h3 className="font-label text-sm tracking-widest uppercase text-primary mb-6 border-b border-surface-variant pb-2">Bottom / Trousers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                          {[
                            { label: "Trouser Waist", name: "trouserWaist", placeholder: "e.g. 34\"" },
                            { label: "Hips / Seat", name: "hips", placeholder: "e.g. 42\"" },
                            { label: "Thigh", name: "thigh", placeholder: "e.g. 24\"" },
                            { label: "Knee & Ankle (Base)", name: "kneeAnkle", placeholder: "e.g. 14\"" },
                            { label: "Trouser Length", name: "trouserLength", placeholder: "e.g. 40\"" },
                            { label: "Crotch / Rise (Flap)", name: "crotch", placeholder: "e.g. 28\"" },
                          ].map((field) => (
                            <div key={field.name} className="flex flex-col gap-2">
                              <label htmlFor={`bottom-${field.name}`} className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                                {field.label}
                              </label>
                              <input
                                type="text"
                                id={`bottom-${field.name}`}
                                value={measurements.bottom[field.name as keyof typeof measurements.bottom]}
                                onChange={(e) => handleMeasurementChange('bottom', field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary text-xl font-serif italic placeholder:text-outline-variant/30 placeholder:not-italic"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* OUTERWEAR SECTION */}
                      <div>
                        <h3 className="font-label text-sm tracking-widest uppercase text-primary mb-6 border-b border-surface-variant pb-2">Outerwear (Agbadas)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
                          {[
                            { label: "Agbada Length", name: "agbadaLength", placeholder: "e.g. 55\"" },
                            { label: "Agbada Width (Armspan)", name: "agbadaWidth", placeholder: "e.g. 48\"" },
                          ].map((field) => (
                            <div key={field.name} className="flex flex-col gap-2">
                              <label htmlFor={`outerwear-${field.name}`} className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                                {field.label}
                              </label>
                              <input
                                type="text"
                                id={`outerwear-${field.name}`}
                                value={measurements.outerwear[field.name as keyof typeof measurements.outerwear]}
                                onChange={(e) => handleMeasurementChange('outerwear', field.name, e.target.value)}
                                placeholder={field.placeholder}
                                className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary text-xl font-serif italic placeholder:text-outline-variant/30 placeholder:not-italic"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3 pt-6 border-t border-surface-variant mt-4">
                        <button 
                          type="submit"
                          className="bg-transparent border border-primary text-primary px-8 py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-on-primary transition-colors"
                        >
                          {isSaved ? "Saved Successfully!" : "Save Profile"}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-serif text-3xl text-primary italic mb-6">Order History</h2>
                  <p className="font-sans text-on-surface-variant text-sm mb-12">
                    Review your past commissions and check the status of ongoing custom creations.
                  </p>

                  <div className="flex flex-col gap-6">
                    {convexOrders === undefined ? (
                      <p className="text-sm font-sans italic text-outline">Loading orders...</p>
                    ) : convexOrders.length === 0 ? (
                      <p className="text-sm font-sans text-outline">You have no orders yet.</p>
                    ) : convexOrders.map((order) => {
                      const stages = ["pending", "processing", "shipped", "delivered"];
                      const currentStageIdx = stages.indexOf(order.status.toLowerCase());
                      
                      return (
                        <details key={order._id} className="group border border-surface-variant flex flex-col hover:border-primary transition-colors duration-300">
                          <summary className="cursor-pointer p-6 sm:p-8 flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-2">
                              <span className="font-label text-xs tracking-widest text-primary">{order.orderId || order._id.substring(0, 12)}</span>
                              <span className="font-sans text-sm text-on-surface-variant">Placed {new Date(order._creationTime).toLocaleDateString()}</span>
                              <span className="font-sans text-sm italic text-primary mt-1">{order.items.length} item(s)</span>
                            </div>
                            <div className="flex flex-col md:items-end gap-3 flex-1 md:flex-none">
                              <span className="font-label text-sm tracking-widest text-primary">{formatPrice(order.totalAmount, (order.displayCurrency as CurrencyCode) || 'GHS', order.rateAtOrderTime ? { [order.displayCurrency || 'GHS']: order.rateAtOrderTime } : rates)}</span>
                              <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-outline group-open:text-primary transition-colors">
                                View Details 
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-open:rotate-180">
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                              </div>
                            </div>
                          </summary>
                          
                          <div className="p-6 border-t border-surface-variant bg-surface-container/20">
                            <h4 className="font-label text-[10px] tracking-widest uppercase text-outline mb-4">Order Tracking</h4>
                            
                            {/* Tracking Timeline */}
                            <div className="relative flex justify-between items-center mb-10 w-full overflow-hidden px-4 md:px-0">
                              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-surface-variant transform -translate-y-1/2 -z-10"></div>
                              {stages.map((stage, idx) => {
                                const isCompleted = idx <= currentStageIdx;
                                const isCurrent = idx === currentStageIdx;
                                return (
                                  <div key={stage} className="flex flex-col items-center gap-2 z-10 w-1/4">
                                    <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors duration-500
                                      ${isCurrent ? 'bg-primary border-4 border-surface shadow-[0_0_10px_rgba(var(--color-primary),0.3)]' : 
                                        isCompleted ? 'bg-primary' : 'bg-surface border border-surface-variant'}`}
                                    ></div>
                                    <span className={`font-label text-[9px] tracking-widest uppercase hidden md:block ${isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-outline'}`}>
                                      {stage}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                            <div className="md:hidden flex justify-center mb-6">
                              <span className="font-label text-[10px] tracking-widest uppercase text-primary border border-primary px-3 py-1">
                                Current Status: {order.status}
                              </span>
                            </div>

                            <div className="flex flex-col gap-3 pt-6 border-t border-surface-variant">
                              <h4 className="font-label text-[10px] tracking-widest uppercase text-outline mb-2">Order Items</h4>
                              {order.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm font-sans border-b border-surface-variant/30 pb-2">
                                  <span className="text-on-surface">{item.productName}</span>
                                  <span className="text-on-surface-variant font-mono">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-serif text-3xl text-primary italic mb-6">Personal Details</h2>
                  <div className="bg-surface-container/30 border border-surface-variant p-8 md:p-12 mb-12">
                    <form className="flex flex-col gap-8" onSubmit={e => { e.preventDefault(); saveProfileData(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Date of Birth</label>
                          <input 
                            type="date"
                            value={profileData.dob}
                            onChange={(e) => handleProfileChange("dob", e.target.value)}
                            className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                          />
                          <span className="text-xs text-on-surface-variant italic">For birthday exclusive offers</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Country</label>
                          <select 
                            value={profileData.country}
                            onChange={(e) => handleProfileChange("country", e.target.value)}
                            className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                          >
                            <option value="GH">Ghana (GH)</option>
                            <option value="US">United States (US)</option>
                            <option value="GB">United Kingdom (GB)</option>
                            <option value="NG">Nigeria (NG)</option>
                            <option value="CA">Canada (CA)</option>
                            <option value="AE">United Arab Emirates (AE)</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2 relative">
                          <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">Phone Number</label>
                          <input 
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => handleProfileChange("phone", e.target.value)}
                            placeholder="e.g. +233 24 123 4567"
                            className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                          />
                          {phoneError && <span className="text-xs text-red-500 absolute -bottom-5">{phoneError}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <label className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">WhatsApp Number</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={sameAsPhone}
                                onChange={(e) => handleSameAsPhoneToggle(e.target.checked)}
                                className="w-3 h-3 text-primary border-outline-variant focus:ring-primary"
                              />
                              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">Same as Phone</span>
                            </label>
                          </div>
                          <input 
                            type="tel"
                            value={profileData.whatsapp}
                            onChange={(e) => handleProfileChange("whatsapp", e.target.value)}
                            placeholder="e.g. +233 24 123 4567"
                            disabled={sameAsPhone}
                            className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary disabled:opacity-50"
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-surface-variant">
                        <button 
                          type="submit"
                          disabled={isProfileSaving}
                          className="bg-transparent border border-primary text-primary px-8 py-3 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50"
                        >
                          {isProfileSaving ? "Saving..." : isProfileSaved ? "Saved Successfully!" : "Save Details"}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-3xl text-primary italic">Account Settings</h2>
                    <ThemeToggle />
                  </div>
                  <UserProfile routing="hash" appearance={{
                    elements: {
                      card: "shadow-none border border-surface-variant rounded-none bg-surface",
                      navbar: "hidden",
                    }
                  }} />
                </motion.div>
              )}

              {activeTab === "saved" && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-serif text-3xl text-primary italic mb-6">Saved Items</h2>
                  <p className="font-sans text-on-surface-variant text-sm mb-12">
                    Your personal archive of curated pieces.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
                    {wishlistItems === undefined ? (
                       <p className="text-sm font-sans italic text-outline">Loading saved items...</p>
                    ) : wishlistItems.length === 0 ? (
                       <p className="text-sm font-sans text-outline">You haven't saved any items yet.</p>
                    ) : wishlistItems.map((product) => (
                      <div key={product._id} className="flex flex-col h-full border border-surface-variant p-4">
                        <Link to={`/product/${product._id}`} className="mb-4">
                          <div className="aspect-[3/4] bg-surface-container overflow-hidden">
                            <img
                              src={product?.images?.[0] || "/assets/1.jpg"}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        </Link>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col">
                            <h3 className="font-serif text-lg text-primary"><Link to={`/product/${product._id}`}>{product.name}</Link></h3>
                            <span className="font-label text-[10px] tracking-widest text-outline uppercase mt-1">
                              {product.category}
                            </span>
                          </div>
                          <span className="font-label text-sm tracking-wide text-primary">
                            {formatPrice(product?.basePrice ?? 0, activeCurrency, rates)}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            toggleWishlist({ productId: product._id });
                            toast.success("Item removed");
                          }}
                          className="mt-6 border-t border-surface-variant pt-4 text-left font-label text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors"
                        >
                          Remove Item
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}


              {activeTab === "appointments" && (
                <motion.div
                  key="appointments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-serif text-3xl text-primary italic mb-6">My Appointments</h2>
                  <p className="font-sans text-on-surface-variant text-sm mb-12">
                    Manage your upcoming consultations and fittings.
                  </p>

                  {appointments === undefined ? (
                    <p className="text-sm font-sans italic text-outline">Loading appointments...</p>
                  ) : appointments.length === 0 ? (
                    <p className="text-sm font-sans text-outline">You have no scheduled appointments.</p>
                  ) : (
                    <div className="flex flex-col gap-12">
                      {/* Upcoming Appointments */}
                      <div>
                        <h3 className="font-label text-sm tracking-widest uppercase text-primary mb-6 border-b border-surface-variant pb-2">Upcoming</h3>
                        <div className="flex flex-col gap-6">
                          {appointments.filter(apt => {
                            const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
                            return aptDate >= new Date() && apt.status !== 'completed' && apt.status !== 'cancelled';
                          }).length === 0 ? (
                            <p className="text-sm font-sans text-outline">No upcoming appointments.</p>
                          ) : (
                            appointments.filter(apt => {
                              const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
                              return aptDate >= new Date() && apt.status !== 'completed' && apt.status !== 'cancelled';
                            }).map((apt) => (
                        <div key={apt._id} className="border border-surface-variant p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex flex-col gap-2">
                            <h3 className="font-serif text-xl text-primary capitalize">{apt.garmentType || 'Fitting'}</h3>
                            <div className="flex gap-4 text-sm text-on-surface-variant">
                              <span><strong className="text-primary font-medium">Date:</strong> {apt.date}</span>
                              {apt.time && <span><strong className="text-primary font-medium">Time:</strong> {apt.time}</span>}
                            </div>
                            <span className={`text-[10px] tracking-widest uppercase inline-block px-3 py-1 mt-2 w-max ${
                              apt.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-surface-variant text-primary'
                            }`}>
                              {apt.status}
                            </span>
                            {apt.meetLink && apt.status !== 'cancelled' && (
                              <a href={apt.meetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs mt-2 inline-block">
                                Join Google Meet
                              </a>
                            )}
                          </div>

                          {apt.status !== "cancelled" && apt.status !== "completed" && (
                            <div className="flex gap-4 w-full md:w-auto">
                              <button
                                onClick={() => setRescheduleData({ id: apt._id, date: apt.date, time: apt.time || "" })}
                                className="border border-primary text-primary px-4 py-2 font-label text-[10px] tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors flex-1 md:flex-none"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(apt._id)}
                                className="border border-red-200 text-red-600 px-4 py-2 font-label text-[10px] tracking-widest uppercase hover:bg-red-50 transition-colors flex-1 md:flex-none"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                        </div>
                      </div>

                      {/* Past & Cancelled Appointments */}
                      <div>
                        <h3 className="font-label text-sm tracking-widest uppercase text-primary mb-6 border-b border-surface-variant pb-2">History</h3>
                        <div className="flex flex-col gap-6">
                          {appointments.filter(apt => {
                            const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
                            return aptDate < new Date() || apt.status === 'completed' || apt.status === 'cancelled';
                          }).length === 0 ? (
                            <p className="text-sm font-sans text-outline">No past appointments.</p>
                          ) : (
                            appointments.filter(apt => {
                              const aptDate = new Date(`${apt.date}T${apt.time || '00:00'}`);
                              return aptDate < new Date() || apt.status === 'completed' || apt.status === 'cancelled';
                            }).map((apt) => (
                              <div key={apt._id} className="border border-surface-variant p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="flex flex-col gap-2">
                                  <h3 className="font-serif text-xl text-primary capitalize">{apt.garmentType || 'Fitting'}</h3>
                                  <div className="flex gap-4 text-sm text-on-surface-variant">
                                    <span><strong className="text-primary font-medium">Date:</strong> {apt.date}</span>
                                    {apt.time && <span><strong className="text-primary font-medium">Time:</strong> {apt.time}</span>}
                                  </div>
                                  <span className={`text-[10px] tracking-widest uppercase inline-block px-3 py-1 mt-2 w-max ${
                                    apt.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                    apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-surface-variant text-primary'
                                  }`}>
                                    {apt.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {rescheduleData && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-surface p-8 max-w-md w-full border border-surface-variant">
                        <h3 className="font-serif text-2xl text-primary mb-6">Reschedule Appointment</h3>
                        <div className="flex flex-col gap-4 mb-8">
                          <div className="flex flex-col gap-2">
                            <label className="font-label text-[10px] tracking-widest uppercase text-outline">New Date</label>
                            <input 
                              type="date" 
                              value={rescheduleData.date}
                              onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value, time: ""})}
                              min={new Date().toISOString().split('T')[0]}
                              className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-label text-[10px] tracking-widest uppercase text-outline">New Time</label>
                            <select
                              value={rescheduleData.time}
                              onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                              disabled={!availableSlots || availableSlots.length === 0}
                              className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary"
                            >
                              <option value="">{availableSlots?.length ? "Select time..." : "No times available"}</option>
                              {availableSlots?.map(slot => (
                                <option key={slot} value={slot}>{slot}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={handleReschedule}
                            disabled={!rescheduleData.date || !rescheduleData.time}
                            className="bg-primary text-on-primary font-label text-[10px] tracking-widest uppercase py-3 px-6 hover:bg-surface-tint transition-colors flex-1 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setRescheduleData(null)}
                            className="border border-surface-variant text-primary font-label text-[10px] tracking-widest uppercase py-3 px-6 hover:bg-surface-variant transition-colors flex-1"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </SignedIn>
          </div>
        </div>
      </div>
    </main>
  );
}
