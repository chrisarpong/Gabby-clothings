import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { TextField, MenuItem } from '@mui/material';
import { Button } from '../components/ui/Button';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  // Database Hooks
  const createProduct = useMutation(api.products.createProduct);
  const products = useQuery(api.products.getProducts);

  const [formData, setFormData] = useState({
    name: '', price: '', description: '', imageUrl: '', type: 'custom' as 'custom' | 'ready-to-wear',
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
      await createProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        images: [formData.imageUrl], 
        type: formData.type,
        inStock: true,
      });
      setFormData({ name: '', price: '', description: '', imageUrl: '', type: 'custom' });
      alert('Masterpiece published successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to publish. Check console.');
    }
  };

  // Dummy data to demonstrate the Bespoke logic to your boss
  const dummyOrders = [
    { id: "ORD-8921", customer: "Kwame Mensah", type: "Custom", amount: "GH₵ 545.00", measurements: "Provided", fullPic: "Uploaded", inspo: "Uploaded", status: "Pending" },
    { id: "ORD-8922", customer: "Yaw Osei", type: "Ready-to-Wear", amount: "GH₵ 260.00", measurements: "N/A", fullPic: "N/A", inspo: "N/A", status: "Processing" },
    { id: "ORD-8923", customer: "Emmanuel Ofori", type: "Custom", amount: "GH₵ 1,200.00", measurements: "Pending", fullPic: "Uploaded", inspo: "Pending", status: "Pending" },
  ];

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
          </nav>
        </aside>

        {/* ════════════════════════════════════════════
            MAIN CONTENT AREA (Spacious White Canvas)
        ════════════════════════════════════════════ */}
        <main className="flex-1 w-full bg-white p-10 lg:p-16 border border-[#3a1f1d]/10 shadow-sm min-h-[700px]">
          
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
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Type</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Req. Images</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10">Status</th>
                      <th className="pb-6 text-[10px] uppercase tracking-[0.2em] font-medium opacity-50 border-b border-[#3a1f1d]/10 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a1f1d]/5">
                    {dummyOrders.map((order) => (
                      <tr key={order.id} className="group hover:bg-[#F9F8F6]/50 transition-colors">
                        <td className="py-6 pr-4 text-[14px] font-medium">{order.id}</td>
                        <td className="py-6 pr-4 text-[14px]">{order.customer}</td>
                        <td className="py-6 pr-4">
                          <span className={`px-3 py-1.5 text-[9px] uppercase tracking-widest font-medium ${order.type === 'Custom' ? 'bg-[#3a1f1d]/5 text-[#3a1f1d]' : 'bg-gray-100 text-gray-500'}`}>
                            {order.type}
                          </span>
                        </td>
                        <td className="py-6 pr-4 text-[14px]">
                          <span className={order.fullPic === 'Uploaded' ? 'text-green-700' : 'text-red-700 opacity-70'}>{order.fullPic}</span>
                        </td>
                        <td className="py-6 pr-4 text-[14px]">
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'Pending' ? 'bg-amber-500' : 'bg-[#3a1f1d]'}`}></span>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <button className="text-[12px] uppercase tracking-widest font-medium opacity-40 group-hover:opacity-100 transition-opacity">Review</button>
                        </td>
                      </tr>
                    ))}
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
                  <h2 className="text-4xl font-normal mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Store Inventory</h2>
                  <p className="text-[15px] opacity-70">Upload custom designs or ready-to-wear stock to your public storefront.</p>
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
                    fullWidth variant="outlined" required label="EDITORIAL DESCRIPTION" multiline rows={5}
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    sx={muiBrandStyles}
                  />

                  <Button 
                    type="submit" 
                    style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1.25rem', marginTop: '1rem', width: '100%' }}
                  >
                    Publish to Storefront
                  </Button>
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
                        <div className="flex flex-col justify-center">
                          <h4 className="font-normal text-[15px] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{p.name}</h4>
                          <p className="text-[13px] opacity-70 mb-3">GH₵ {p.price.toFixed(2)}</p>
                          <span className="text-[9px] uppercase tracking-widest opacity-50">{p.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </motion.div>
  );
};

export default Admin;