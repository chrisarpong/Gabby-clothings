import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignOutButton, UserProfile, SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from "../../convex/_generated/api";

import { toast } from "sonner";

export default function Profile() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    sleeve: "",
    inseam: "",
    length: "",
  });

  const [isSaved, setIsSaved] = useState(false);

  const convexOrders = useQuery(api.orders.getUserOrders, user ? { userId: user.id } : "skip");
  const convexMeasurements = useQuery(api.users.getMeasurements);
  const updateMeasurements = useMutation(api.users.updateMeasurements);
  const wishlistItems = useQuery(api.wishlists.getUserWishlist);
  const toggleWishlist = useMutation(api.wishlists.toggleItem);

  useEffect(() => {
    if (convexMeasurements) {
      setMeasurements({
        chest: convexMeasurements.chest?.toString() || "",
        waist: convexMeasurements.waist?.toString() || "",
        hips: convexMeasurements.hips?.toString() || "",
        shoulder: convexMeasurements.shoulders?.toString() || "",
        sleeve: convexMeasurements.sleeve?.toString() || "", // added to db if needed, or mapped to notes
        inseam: convexMeasurements.inseam?.toString() || "",
        length: convexMeasurements.height?.toString() || "", // map height to length for now
      });
    }
  }, [convexMeasurements]);

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeasurements((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setIsSaved(false);
  };

  const saveMeasurements = async () => {
    if (!user) return;
    try {
      await updateMeasurements({
        clerkId: user.id,
        measurements: {
          chest: Number(measurements.chest) || undefined,
          waist: Number(measurements.waist) || undefined,
          hips: Number(measurements.hips) || undefined,
          shoulders: Number(measurements.shoulder) || undefined,
          inseam: Number(measurements.inseam) || undefined,
          height: Number(measurements.length) || undefined,
        }
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
                    Maintain your precise sizing profile for future bespoke commissions. Updates to these measurements will automatically apply to all forthcoming tailored orders.
                  </p>

                  <div className="bg-surface-container/30 border border-surface-variant p-8 md:p-12 mb-8">
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10" onSubmit={e => { e.preventDefault(); saveMeasurements(); }}>
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
                          <label htmlFor={field.name} className="font-label text-[10px] tracking-widest text-on-surface-variant uppercase">
                            {field.label}
                          </label>
                          <input
                            type="number"
                            id={field.name}
                            name={field.name}
                            value={measurements[field.name as keyof typeof measurements]}
                            onChange={handleMeasurementChange}
                            placeholder='e.g. 40"'
                            className="bg-transparent border-b border-outline-variant pb-2 focus:outline-none focus:border-primary transition-colors text-primary text-xl font-serif italic placeholder:text-outline-variant/30 placeholder:not-italic"
                          />
                        </div>
                      ))}
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
                    Review your past commissions and check the status of ongoing bespoke creations.
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
                          <summary className="cursor-pointer list-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-surface">
                            <div className="flex flex-col gap-2">
                              <span className="font-label text-xs tracking-widest text-primary">{order._id.substring(0, 12)}</span>
                              <span className="font-sans text-sm text-on-surface-variant">{new Date(order._creationTime).toLocaleDateString()}</span>
                              <span className="font-sans text-sm italic text-primary mt-1">{order.items.length} item(s)</span>
                            </div>
                            <div className="flex flex-col md:items-end gap-3 flex-1 md:flex-none">
                              <span className="font-label text-sm tracking-widest text-primary">${order.totalAmount.toFixed(2)}</span>
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
                  <SignedIn>
                    <UserProfile routing="hash" appearance={{
                      elements: {
                        card: "shadow-none border border-surface-variant rounded-none bg-surface",
                        navbar: "hidden",
                      }
                    }} />
                  </SignedIn>
                  <SignedOut>
                    <div className="py-20 text-center border border-dashed border-surface-variant">
                      <p className="font-serif text-2xl italic text-primary mb-6">Authentication Required</p>
                      <p className="font-sans text-on-surface-variant text-sm mb-8">Please sign in to view and manage your profile settings.</p>
                      <SignInButton mode="modal">
                        <button className="bg-primary text-on-primary px-8 py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-surface-tint transition-colors">
                          Sign In
                        </button>
                      </SignInButton>
                    </div>
                  </SignedOut>
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
                            GH₵{(product?.basePrice ?? 0).toFixed(2)}
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

            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
