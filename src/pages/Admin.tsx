import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { Spinner } from '../components/ui/spinner-1';
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
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Banknote,
  Megaphone,
  Tag,
  Settings,
  Scissors,
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'tailors', label: 'Tailors', icon: Scissors },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'financials', label: 'Financials', icon: Banknote },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'promotions', label: 'Promotions', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'tailors' | 'clients' | 'financials' | 'marketing' | 'promotions' | 'settings' | 'reviews'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const userProfile = useQuery(api.users.getUserProfile);
  const isAdmin = userProfile?.role === "admin";

  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  
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

  if (userProfile === undefined) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center pt-16">
        <Spinner size={40} color="#3a1f1d" />
        <p className="mt-4 text-sm text-[#3a1f1d]/60">Authenticating Access...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="h-screen bg-[#F5F2EE] text-[#3a1f1d] font-[var(--font-sans)] w-full overflow-hidden flex"
    >
      {!isAdmin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FDFBF9]">
          <div className="text-center">
            <p className="text-sm text-[#3a1f1d]/40 mb-3">Access Restricted</p>
            <h2 className="text-2xl italic text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Atelier Portal</h2>
            <p className="text-[#3a1f1d]/50">This area is reserved for authorised personnel.</p>
          </div>
        </div>
      )}
      
      <aside className="w-64 h-full bg-[#2C1816] text-[#F9F8F6] shrink-0 flex flex-col overflow-y-auto">
        <div className="p-6 pb-8">
          <h1 className="text-xl italic leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Gabby Newluk
          </h1>
          <div className="h-px w-10 bg-[#F9F8F6]/20 mb-3"></div>
          <p className="text-[10px] uppercase tracking-widest opacity-60">Admin Dashboard</p>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActive 
                    ? 'bg-[#F9F8F6] text-[#3a1f1d] shadow-md' 
                    : 'opacity-60 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 h-full bg-[#FDFBF9] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <OverviewTab orders={orders as any} clients={clients as any} stats={stats} />
            </motion.div>
          )}

          {activeTab === 'financials' && (
            <motion.div key="financials" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <FinancialsTab orders={orders as any} />
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <OrdersTab orders={orders as any} updateOrderStatus={updateOrderStatus} />
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div key="clients" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ClientsTab clients={clients as any} />
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
            </motion.div>
          )}

          {activeTab === 'tailors' && (
            <motion.div key="tailors" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ClientRelationsTab 
                appointments={appointments as any} 
                updateAppointmentStatus={updateAppointmentStatus} 
                messages={messages as any} 
                updateMessageStatus={updateMessageStatus} 
              />
            </motion.div>
          )}

          {activeTab === 'marketing' && (
            <motion.div key="marketing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <MarketingTab subscribers={subscribers as any} />
            </motion.div>
          )}

          {activeTab === 'promotions' && (
            <motion.div key="promotions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <PromotionsTab
                promoCodes={promoCodes as any}
                createPromoCode={createPromoCode}
                togglePromoCode={togglePromoCode}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <SettingsTab
                storeSettings={storeSettings as any}
                updateSettings={updateSettingsMutation}
                adminUsers={adminUsers as any}
                revokeAdmin={revokeAdmin}
              />
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <ReviewsTab
                reviews={allReviews as any}
                updateReviewStatus={updateReviewStatus}
                deleteReview={deleteReview}
              />
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
};

export default Admin;
