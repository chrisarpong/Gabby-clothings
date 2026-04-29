import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner-1';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'appointments' | 'concierge' | 'newsletter'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Database Hooks
  const userProfile = useQuery(api.users.getUserProfile);
  const isAdmin = userProfile?.role === "admin";

  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  
  // Public or conditionally skipped queries
  const products = useQuery(api.products.getProducts);
  const orders = useQuery(api.orders.getOrders, isAdmin ? {} : "skip");
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  
  const appointments = useQuery(api.appointments.getAppointmentsAdmin, isAdmin ? {} : "skip");
  const updateAppointmentStatus = useMutation(api.appointments.updateAppointmentStatus);
  
  const messages = useQuery(api.contact.getMessages, isAdmin ? {} : "skip");
  const updateMessageStatus = useMutation(api.contact.updateMessageStatus);
  
  const subscribers = useQuery(api.newsletter.getSubscribers, isAdmin ? {} : "skip");
  const stats = useQuery(api.analytics.getDashboardStats, isAdmin ? {} : "skip");

  // Route Protection
  useEffect(() => {
    if (userProfile !== undefined) {
      if (!userProfile || userProfile.role !== "admin") {
        navigate("/");
      }
    }
  }, [userProfile, navigate]);

  const [formData, setFormData] = useState({
    name: '', price: '', description: '', imageUrl: '', imageFile: null as File | null, type: 'custom' as 'custom' | 'ready-to-wear', stock: '0'
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageId = editingId ? products?.find(p => p._id === editingId)?.imageId : undefined;
      
      if (formData.imageFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": formData.imageFile.type },
          body: formData.imageFile,
        });
        const { storageId } = await result.json();
        imageId = storageId;
      }

      if (editingId) {
        await updateProduct({
          id: editingId as any,
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          images: [], 
          imageId: imageId,
          type: formData.type,
          stock: parseInt(formData.stock) || 0,
        });
        toast.success('Masterpiece updated successfully!');
      } else {
        await createProduct({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          images: [], 
          imageId: imageId,
          type: formData.type,
          inStock: true,
          stock: parseInt(formData.stock) || 0,
        });
        toast.success('Masterpiece published successfully!');
      }
      setFormData({ name: '', price: '', description: '', imageUrl: '', imageFile: null, type: 'custom', stock: '0' });
      setEditingId(null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to publish. Check console.');
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      imageUrl: product.images?.[0] || '',
      imageFile: null,
      type: product.type,
      stock: (product.stock || 0).toString()
    });
    // Scroll to form (optional, for better UX)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: any) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct({ id });
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleStatusChange = (orderId: any, newStatus: any) => {
    toast.promise(updateOrderStatus({ orderId, status: newStatus }), {
      loading: 'Updating status...',
      success: 'Order status updated!',
      error: 'Failed to update status',
    });
  };

  if (userProfile === undefined) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center pt-16">
        <Spinner size={40} color="#3a1f1d" />
        <p className="mt-4 text-[12px] uppercase tracking-widest text-[#3a1f1d]/70">Authenticating Access...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#F9F8F6] text-[#3a1f1d] font-[var(--font-sans)] w-full pt-16 pb-32"
    >
      {/* ════════════════════════════════════════════
          MASTER GRID LAYOUT (Padded & Centered)
      ════════════════════════════════════════════ */}
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-12 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Access Guard */}
        {!isAdmin && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#F9F8F6]">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#3a1f1d]/40 mb-3">Access Restricted</p>
              <h2 className="text-[28px] italic text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Atelier Portal</h2>
              <p className="text-[14px] text-[#3a1f1d]/50">This area is reserved for authorised personnel.</p>
            </div>
          </div>
        )}
        
        {/* ════════════════════════════════════════════
            SIDEBAR (Floating Premium Card)
        ════════════════════════════════════════════ */}
        <aside className="w-full lg:w-[280px] bg-[#3a1f1d] text-[#F9F8F6] p-10 shrink-0 shadow-2xl lg:sticky lg:top-32">
          <div className="mb-14">
            <h1 className="text-2xl font-normal italic leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Gabby Newluk
            </h1>
            <div className="h-[1px] w-12 bg-[#F9F8F6]/30 mb-4"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 font-medium">Atelier Portal</p>
          </div>

          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'overview' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'orders' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Bespoke Orders
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'inventory' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Store Inventory
            </button>
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'appointments' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Appointments
            </button>
            <button 
              onClick={() => setActiveTab('concierge')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'concierge' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Concierge
            </button>
            <button 
              onClick={() => setActiveTab('newsletter')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'newsletter' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Newsletter
            </button>
          </nav>
        </aside>

        {/* ════════════════════════════════════════════
            MAIN CONTENT AREA (Spacious White Canvas)
        ════════════════════════════════════════════ */}
        <main className="flex-1 w-full bg-white p-10 lg:p-16 border border-[#3a1f1d]/10 shadow-sm min-h-[700px]">
          
          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Atelier Overview</h2>
                <p className="text-[15px] opacity-70">Key performance metrics and live operational data.</p>
              </div>

              {stats === undefined ? (
                <div className="flex justify-center items-center py-20">
                  <Spinner size={40} color="#3a1f1d" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#3a1f1d]/10 p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>Total Revenue</span>
                    <span className="text-4xl text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>GHS {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="bg-white border border-[#3a1f1d]/10 p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>Total Orders</span>
                    <span className="text-4xl text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.totalOrders}</span>
                  </div>
                  <div className="bg-white border border-[#3a1f1d]/10 p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] uppercase tracking-[0.2em] opacity-60 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>Total Clients</span>
                    <span className="text-4xl text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.totalClients}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- ORDERS TAB --- */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Order Archive</h2>
                <p className="text-[15px] opacity-70">Review live client bespoke and ready-to-wear fulfillment.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Order ID</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Client</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Email</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Total</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Status</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a1f1d]/5">
                    {orders === undefined ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[14px] opacity-50">Syncing live orders...</td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[14px] opacity-50">No orders yet.</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="group hover:bg-[#F9F8F6]/50 transition-colors">
                          <td className="py-6 pr-4 text-[14px] font-medium font-mono">{order._id.slice(-8).toUpperCase()}</td>
                          <td className="py-6 pr-4 text-[14px]">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</td>
                          <td className="py-6 pr-4 text-[13px] opacity-70">{order.shippingAddress.email}</td>
                          <td className="py-6 pr-4 text-[14px]">GH₵ {order.totalAmount.toFixed(2)}</td>
                          <td className="py-6 pr-4 text-[14px]">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="bg-transparent border border-[#3a1f1d]/20 rounded-md px-3 py-1.5 text-[13px] capitalize focus:outline-none focus:border-[#3a1f1d] hover:border-[#3a1f1d]/50 transition-colors cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-6 text-right">
                            <button className="text-[12px] uppercase tracking-widest font-medium opacity-40 group-hover:opacity-100 transition-opacity">Review</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- INVENTORY TAB --- */}
          {activeTab === 'inventory' && (
            <div className="animate-in fade-in duration-500 grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-16">
              
              {/* Form Side */}
              <div>
                <div className="mb-12">
                  <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{editingId ? 'Edit Masterpiece' : 'Store Inventory'}</h2>
                  <p className="text-[15px] opacity-70">
                    {editingId ? 'Refine the details of your selected piece.' : 'Upload custom designs or ready-to-wear stock to your public storefront.'}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">PRODUCT NAME</label>
                    <Input 
                      required 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">PRICE (GH₵)</label>
                      <Input 
                        required type="number"
                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                        className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">GARMENT TYPE</label>
                      <select 
                        value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}
                        className="border border-[#3a1f1d]/20 px-3 py-2 h-10 rounded-none text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#3a1f1d] w-full"
                      >
                        <option value="custom">Bespoke Custom Made</option>
                        <option value="ready-to-wear">Ready to Wear</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2" style={{ fontFamily: "'Jost', sans-serif" }}>COVER IMAGE</label>
                    <input 
                      type="file" accept="image/*"
                      onChange={(e) => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
                      className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[11px] file:uppercase file:tracking-[0.2em] file:bg-[#3a1f1d] file:text-[#F9F8F6] hover:file:bg-[#3a1f1d]/90 cursor-pointer w-full bg-transparent"
                    />
                    {(formData.imageUrl || editingId) && !formData.imageFile && <span className="text-[11px] opacity-50 ml-2">Current Image Exists. Upload to replace.</span>}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">STOCK QUANTITY</label>
                    <Input 
                      required type="number"
                      value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                      className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus-visible:ring-1 focus-visible:ring-[#3a1f1d]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 ml-2">EDITORIAL DESCRIPTION</label>
                    <textarea 
                      required rows={5}
                      value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                      className="border border-[#3a1f1d]/20 p-3 rounded-none text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-[#3a1f1d] w-full resize-none"
                    />
                  </div>

                  <div className="flex gap-4 mt-4">
                    <Button 
                      type="submit" 
                      style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1.25rem', width: '100%' }}
                    >
                      {editingId ? 'Save Changes' : 'Publish to Storefront'}
                    </Button>
                    {editingId && (
                      <Button 
                        type="button" 
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ name: '', price: '', description: '', imageUrl: '', imageFile: null, type: 'custom', stock: '0' });
                        }}
                        variant="outline"
                        style={{ borderColor: '#3a1f1d', color: '#3a1f1d', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1.25rem', width: '50%' }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Preview Side */}
              <div className="xl:border-l border-[#3a1f1d]/10 xl:pl-12">
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-medium opacity-60 mb-8">Live Masterpieces</h3>
                
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4">
                  {!products ? (
                    <p className="text-[14px] opacity-50">Syncing database...</p>
                  ) : products.length === 0 ? (
                    <div className="border border-dashed border-[#3a1f1d]/20 p-10 text-center">
                      <p className="opacity-50 text-[14px]">Your atelier is currently empty.</p>
                    </div>
                  ) : (
                    products.map((p) => (
                      <div key={p._id} className="flex gap-5 group">
                        <div className="w-[70px] h-[95px] shrink-0 bg-[#F9F8F6] border border-[#3a1f1d]/10 overflow-hidden">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <h4 className="font-normal text-[15px] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{p.name}</h4>
                          <p className="text-[13px] opacity-70 mb-3">GH₵ {p.price.toFixed(2)}</p>
                          <span className="text-[9px] uppercase tracking-widest opacity-50">{p.type}</span>
                        </div>
                        <div className="flex flex-col gap-3 justify-center ml-auto">
                          <button 
                            onClick={() => handleEdit(p)} 
                            className="text-[10px] uppercase tracking-widest font-medium opacity-40 hover:opacity-100 transition-opacity"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)} 
                            className="text-[10px] uppercase tracking-widest font-medium text-red-700/50 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* --- APPOINTMENTS TAB --- */}
          {activeTab === 'appointments' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Appointments</h2>
                <p className="text-[15px] opacity-70">Manage client booking requests for bespoke tailoring.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Date & Time</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Client</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Contact</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Status</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a1f1d]/5">
                    {appointments === undefined ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[14px] opacity-50">Loading appointments...</td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[14px] opacity-50">No appointments yet.</td></tr>
                    ) : (
                      appointments.map((apt) => (
                        <tr key={apt._id} className="group hover:bg-[#F9F8F6]/50 transition-colors">
                          <td className="py-6 pr-4 text-[14px] font-medium">{apt.date} • {apt.time}</td>
                          <td className="py-6 pr-4 text-[14px]">{apt.name}</td>
                          <td className="py-6 pr-4 text-[13px] opacity-70">{apt.email}<br/>{apt.phone}</td>
                          <td className="py-6 pr-4 text-[14px]">
                            <select 
                              value={apt.status}
                              onChange={(e) => {
                                toast.promise(updateAppointmentStatus({ appointmentId: apt._id, status: e.target.value as any }), {
                                  loading: 'Updating...', success: 'Appointment updated!', error: 'Failed to update'
                                });
                              }}
                              className="bg-transparent border border-[#3a1f1d]/20 rounded-md px-3 py-1.5 text-[13px] capitalize focus:outline-none focus:border-[#3a1f1d] hover:border-[#3a1f1d]/50 transition-colors cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-6 text-right">
                            <button className="text-[12px] uppercase tracking-widest font-medium opacity-40 group-hover:opacity-100 transition-opacity">Review</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- CONCIERGE TAB --- */}
          {activeTab === 'concierge' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Concierge Messages</h2>
                <p className="text-[15px] opacity-70">Direct inquiries and bespoke requests from your clients.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Date</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Client</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Subject</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Message</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a1f1d]/5">
                    {messages === undefined ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[14px] opacity-50">Loading messages...</td></tr>
                    ) : messages.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[14px] opacity-50">No messages yet.</td></tr>
                    ) : (
                      messages.map((msg) => (
                        <tr key={msg._id} className={`group hover:bg-[#F9F8F6]/50 transition-colors ${msg.status === 'resolved' ? 'opacity-50' : ''}`}>
                          <td className="py-6 pr-4 text-[13px] opacity-70">{new Date(msg._creationTime).toLocaleDateString()}</td>
                          <td className="py-6 pr-4 text-[14px] font-medium">{msg.name}<br/><span className="text-[12px] opacity-60 font-normal">{msg.email}</span></td>
                          <td className="py-6 pr-4 text-[14px]">{msg.subject || "No Subject"}</td>
                          <td className="py-6 pr-4 text-[14px] max-w-[300px] truncate">{msg.message}</td>
                          <td className="py-6 text-right">
                            {msg.status === 'unread' ? (
                              <button 
                                onClick={() => {
                                  toast.promise(updateMessageStatus({ messageId: msg._id, status: 'resolved' }), {
                                    loading: 'Updating...', success: 'Marked as resolved', error: 'Failed to update'
                                  });
                                }}
                                className="text-[10px] uppercase tracking-widest font-medium opacity-70 hover:opacity-100 transition-opacity bg-[#3a1f1d] text-white px-4 py-2"
                              >
                                Resolve
                              </button>
                            ) : (
                              <span className="text-[10px] uppercase tracking-widest font-medium opacity-40">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- NEWSLETTER TAB --- */}
          {activeTab === 'newsletter' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-12">
                <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Newsletter Subscribers</h2>
                <p className="text-[15px] opacity-70">Your curated list of VIP clients and followers.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Email Address</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10 text-right">Date Subscribed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a1f1d]/5">
                    {subscribers === undefined ? (
                      <tr><td colSpan={2} className="py-12 text-center text-[14px] opacity-50">Loading subscribers...</td></tr>
                    ) : subscribers.length === 0 ? (
                      <tr><td colSpan={2} className="py-12 text-center text-[14px] opacity-50">No subscribers yet.</td></tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub._id} className="group hover:bg-[#F9F8F6]/50 transition-colors">
                          <td className="py-6 pr-4 text-[14px] font-medium">{sub.email}</td>
                          <td className="py-6 pr-4 text-[13px] opacity-70 text-right">{new Date(sub.subscribedAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </motion.div>
  );
};

export default Admin;
