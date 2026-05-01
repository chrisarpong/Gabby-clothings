import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Spinner } from '../components/ui/spinner-1';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OrdersTab } from '../components/admin/OrdersTab';
import { ClientsTab } from '../components/admin/ClientsTab';
import { ClientRelationsTab } from '../components/admin/ClientRelationsTab';
import { OverviewTab } from '../components/admin/OverviewTab';
import { FinancialsTab } from '../components/admin/FinancialsTab';
import { MarketingTab } from '../components/admin/MarketingTab';
import { InventoryTab } from '../components/admin/InventoryTab';
import { PromotionsTab } from '../components/admin/PromotionsTab';
import { SettingsTab } from '../components/admin/SettingsTab';
import { ReviewsTab } from '../components/admin/ReviewsTab';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'tailors' | 'clients' | 'financials' | 'marketing' | 'promotions' | 'settings' | 'reviews'>('overview');
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
  const clients = useQuery(api.users.getAllClients, isAdmin ? {} : "skip");
  
  const promoCodes = useQuery(api.promotions.getPromoCodes, isAdmin ? {} : "skip");
  const createPromoCode = useMutation(api.promotions.createPromoCode);
  const togglePromoCode = useMutation(api.promotions.togglePromoCode);

  const storeSettings = useQuery(api.settings.getSettings);
  const updateSettingsMutation = useMutation(api.settings.updateSettings);
  const adminUsers = useQuery(api.settings.getAdminUsers, isAdmin ? {} : "skip");
  const revokeAdmin = useMutation(api.settings.revokeAdmin);

  const allReviews = useQuery(api.reviews.getAllReviewsAdmin, isAdmin ? {} : "skip");
  const updateReviewStatus = useMutation(api.reviews.updateReviewStatus);
  const deleteReview = useMutation(api.reviews.deleteReview);

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
      className="h-screen bg-[#F9F8F6] text-[#3a1f1d] font-[var(--font-sans)] w-full overflow-hidden"
    >
      {/* ════════════════════════════════════════════
          MASTER GRID LAYOUT (Edge-to-Edge Full Screen)
          Removed padding, max-width, and centering.
      ════════════════════════════════════════════ */}
      <div className="flex h-full w-full overflow-hidden">
        
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
        <aside className="w-[280px] h-full bg-[#3a1f1d] text-[#F9F8F6] p-10 shrink-0 shadow-2xl flex flex-col overflow-y-auto">
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
              onClick={() => setActiveTab('tailors')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'tailors' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Tailors
            </button>
            <button 
              onClick={() => setActiveTab('clients')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'clients' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Clients
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'reviews' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Reviews
            </button>
            <button 
              onClick={() => setActiveTab('financials')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'financials' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Financials
            </button>
            <button 
              onClick={() => setActiveTab('marketing')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'marketing' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Marketing
            </button>
            <button 
              onClick={() => setActiveTab('promotions')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'promotions' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Promotions
            </button>

            {/* Separator */}
            <div className="h-[1px] bg-[#F9F8F6]/10 my-2"></div>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-left px-5 py-4 text-[12px] uppercase tracking-widest font-medium transition-all duration-300 ${activeTab === 'settings' ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-lg' : 'hover:bg-white/10 opacity-70 hover:opacity-100'}`}
            >
              Settings
            </button>
          </nav>
        </aside>

        {/* ════════════════════════════════════════════
            MAIN CONTENT AREA (Spacious White Canvas)
        ════════════════════════════════════════════ */}
        <main className="flex-1 h-full bg-white p-10 lg:p-16 border-l border-[#3a1f1d]/10 shadow-sm overflow-y-auto">
          
          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-500">
              <OverviewTab orders={orders as any} clients={clients as any} appointments={appointments as any} />
            </div>
          )}

          {/* --- FINANCIALS TAB --- */}
          {activeTab === 'financials' && (
            <div className="animate-in fade-in duration-500">
              <FinancialsTab orders={orders as any} />
            </div>
          )}

          {/* --- ORDERS TAB --- */}
          {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-500">
              <OrdersTab orders={orders as any} updateOrderStatus={updateOrderStatus} />
            </div>
          )}

          {/* --- CLIENTS TAB --- */}
          {activeTab === 'clients' && (
            <div className="animate-in fade-in duration-500">
              <ClientsTab clients={clients as any} />
            </div>
          )}

          {/* --- INVENTORY TAB --- */}
          {activeTab === 'inventory' && (
            <div className="animate-in fade-in duration-500">
              <InventoryTab
                products={products as any}
                formData={formData}
                setFormData={setFormData}
                editingId={editingId}
                setEditingId={setEditingId}
                handleSubmit={handleSubmit}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
            </div>
          )}

          {/* --- TAILORS / CLIENT RELATIONS TAB --- */}
          {activeTab === 'tailors' && (
            <div className="animate-in fade-in duration-500">
              <ClientRelationsTab 
                appointments={appointments as any} 
                updateAppointmentStatus={updateAppointmentStatus} 
                messages={messages as any} 
                updateMessageStatus={updateMessageStatus} 
              />
            </div>
          )}

          {/* --- MARKETING TAB --- */}
          {activeTab === 'marketing' && (
            <div className="animate-in fade-in duration-500">
              <MarketingTab subscribers={subscribers as any} />
            </div>
          )}

          {/* --- PROMOTIONS TAB --- */}
          {activeTab === 'promotions' && (
            <div className="animate-in fade-in duration-500">
              <PromotionsTab
                promoCodes={promoCodes as any}
                createPromoCode={createPromoCode}
                togglePromoCode={togglePromoCode}
              />
            </div>
          )}

          {/* --- SETTINGS TAB --- */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500">
              <SettingsTab
                storeSettings={storeSettings as any}
                updateSettings={updateSettingsMutation}
                adminUsers={adminUsers as any}
                revokeAdmin={revokeAdmin}
              />
            </div>
          )}

          {/* --- REVIEWS TAB --- */}
          {activeTab === 'reviews' && (
            <div className="animate-in fade-in duration-500">
              <ReviewsTab
                reviews={allReviews as any}
                updateReviewStatus={updateReviewStatus}
                deleteReview={deleteReview}
              />
            </div>
          )}

        </main>
      </div>
    </motion.div>
  );
};

export default Admin;
