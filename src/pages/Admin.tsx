import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { TextField, MenuItem, CircularProgress } from '@mui/material';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'appointments' | 'concierge' | 'newsletter'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Database Hooks
  const userProfile = useQuery(api.users.getUserProfile);
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const products = useQuery(api.products.getProducts);
  const orders = useQuery(api.orders.getOrders);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const appointments = useQuery(api.appointments.getAppointmentsAdmin);
  const updateAppointmentStatus = useMutation(api.appointments.updateAppointmentStatus);
  const messages = useQuery(api.contact.getMessages);
  const subscribers = useQuery(api.newsletter.getSubscribers);
  const stats = useQuery(api.analytics.getDashboardStats);

  // Route Protection
  useEffect(() => {
    if (userProfile !== undefined) {
      if (!userProfile || userProfile.role !== "admin") {
        navigate("/");
      }
    }
  }, [userProfile, navigate]);

  const [formData, setFormData] = useState({
    name: '', price: '', description: '', imageUrl: '', type: 'custom' as 'custom' | 'ready-to-wear', stock: '0'
  });

  const muiBrandStyles = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': { borderColor: '#3a1f1d' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduct({
          id: editingId as any,
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          images: [formData.imageUrl], 
          type: formData.type,
          stock: parseInt(formData.stock) || 0,
        });
        toast.success('Masterpiece updated successfully!');
      } else {
        await createProduct({
          name: formData.name,
          price: parseFloat(formData.price),
          description: formData.description,
          images: [formData.imageUrl], 
          type: formData.type,
          inStock: true,
          stock: parseInt(formData.stock) || 0,
        });
        toast.success('Masterpiece published successfully!');
      }
      setFormData({ name: '', price: '', description: '', imageUrl: '', type: 'custom', stock: '0' });
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
        <CircularProgress sx={{ color: '#3a1f1d' }} size={40} thickness={2} />
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
                  <CircularProgress sx={{ color: '#3a1f1d' }} size={40} thickness={2} />
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
                  <TextField 
                    fullWidth variant="outlined" required label="PRODUCT NAME"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    sx={muiBrandStyles}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TextField 
                      fullWidth variant="outlined" required label="PRICE (GH₵)" type="number"
                      value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                      sx={muiBrandStyles}
                    />
                    <TextField 
                      fullWidth select variant="outlined" label="GARMENT TYPE"
                      value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}
                      sx={muiBrandStyles}
                    >
                      <MenuItem value="custom">Bespoke Custom Made</MenuItem>
                      <MenuItem value="ready-to-wear">Ready to Wear</MenuItem>
                    </TextField>
                  </div>

                  <TextField 
                    fullWidth variant="outlined" required label="COVER IMAGE URL" type="url"
                    placeholder="https://..."
                    value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    sx={muiBrandStyles}
                  />

                  <TextField 
                    fullWidth variant="outlined" required label="STOCK QUANTITY" type="number"
                    value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                    sx={muiBrandStyles}
                  />
                  <TextField 
                    fullWidth variant="outlined" required label="EDITORIAL DESCRIPTION" multiline rows={5}
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    sx={muiBrandStyles}
                  />

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
                          setFormData({ name: '', price: '', description: '', imageUrl: '', type: 'custom', stock: '0' });
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a1f1d]/5">
                    {messages === undefined ? (
                      <tr><td colSpan={4} className="py-12 text-center text-[14px] opacity-50">Loading messages...</td></tr>
                    ) : messages.length === 0 ? (
                      <tr><td colSpan={4} className="py-12 text-center text-[14px] opacity-50">No messages yet.</td></tr>
                    ) : (
                      messages.map((msg) => (
                        <tr key={msg._id} className="group hover:bg-[#F9F8F6]/50 transition-colors">
                          <td className="py-6 pr-4 text-[13px] opacity-70">{new Date(msg.createdAt).toLocaleDateString()}</td>
                          <td className="py-6 pr-4 text-[14px] font-medium">{msg.name}<br/><span className="text-[12px] opacity-60 font-normal">{msg.email}</span></td>
                          <td className="py-6 pr-4 text-[14px]">{msg.subject || "No Subject"}</td>
                          <td className="py-6 pr-4 text-[14px] max-w-[300px] truncate">{msg.message}</td>
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
