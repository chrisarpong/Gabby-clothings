import { useState, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Search, Trash2, Edit3, X } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function InventoryTab() {
  const products = useQuery(api.products.getProducts) || [];
  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const deleteProduct = useMutation(api.products.deleteProduct);
  // Note: If you have an upload URL mutation, use it here. 
  // Based on old code, it used a direct URL or handled it in the parent.
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bespoke',
    price: '',
    stock: '',
    description: '',
    imageUrl: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        description: formData.description,
        imageUrl: formData.imageUrl
      };

      if (editingId) {
        await updateProduct({ id: editingId as any, ...productData });
      } else {
        await createProduct(productData);
      }

      // Reset form
      setFormData({ name: '', type: 'Bespoke', price: '', stock: '', description: '', imageUrl: '' });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to commit to archive", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p._id);
    setFormData({
      name: p.name || '',
      type: p.type || 'Bespoke',
      price: p.price?.toString() || '',
      stock: p.stock?.toString() || '',
      description: p.description || '',
      imageUrl: p.imageUrl || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: any) => {
    if (confirm("Are you sure you want to remove this masterpiece from the archive?")) {
      try {
        await deleteProduct({ id });
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p: any) => p.name?.toLowerCase().includes(q) || p._id?.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, products]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl w-full"
    >
      <header className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">The Archive</h2>
            <h1 className="font-serif text-3xl md:text-4xl">Masterpieces</h1>
          </div>
          <div className="relative w-full md:w-64">
            <Search strokeWidth={1} className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
            <input 
              type="text" 
              placeholder="SEARCH ARCHIVE..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-espresso/20 py-2 pl-6 pr-4 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 items-start">
        {/* Left Column: Creation Manifest */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-serif text-2xl">{editingId ? 'Alteration Manifest' : 'Creation Manifest'}</h3>
            {editingId && (
              <button 
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', type: 'Bespoke', price: '', stock: '', description: '', imageUrl: '' });
                }}
                className="text-[9px] uppercase tracking-[0.2em] text-espresso/40 hover:text-espresso flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Abandon Edit
              </button>
            )}
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Garment Nomenclature</label>
              <input 
                type="text" 
                placeholder="E.G. LINEN SUMMER WAISTCOAT" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors" 
              />
            </div>
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Classification</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none appearance-none uppercase text-espresso transition-colors cursor-pointer pr-4"
              >
                <option value="custom">Bespoke</option>
                <option value="ready-to-wear">Ready-to-Wear</option>
                <option value="limited-edition">Limited Edition</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-1/2">
                <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Valuation (₵)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors" 
                />
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Units</label>
                <input 
                  type="number" 
                  placeholder="1" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors" 
                />
              </div>
            </div>
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Description of Craft</label>
              <textarea 
                placeholder="DESCRIBE THE ARTISTRY..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors min-h-[100px] resize-none" 
              />
            </div>
            <div>
              <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Image URL</label>
              <input 
                type="text" 
                placeholder="HTTPS://..." 
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full bg-transparent border-b border-espresso/20 py-2 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors" 
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-espresso text-white py-4 font-sans text-[10px] uppercase tracking-[0.4em] hover:bg-espresso/90 transition-colors shadow-none rounded-none mt-4 disabled:opacity-50"
            >
              {isSubmitting ? 'Committing...' : editingId ? 'Commit Alterations' : 'Commit to Archive'}
            </button>
          </form>
        </div>

        {/* Right Column: Active Masterpieces */}
        <div className="lg:col-span-2">
          <h3 className="font-serif text-2xl mb-8">Active Collection</h3>
          <div className="bg-white border border-espresso/10 shadow-none rounded-none overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-espresso/10 bg-bone/30">
                  <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Reference</th>
                  <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Garment</th>
                  <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Line</th>
                  <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Valuation</th>
                  <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Stock</th>
                  <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((p: any) => (
                  <tr key={p._id} className="border-b border-espresso/5 hover:bg-bone/20 transition-colors last:border-0 group">
                    <td className="py-5 px-6 align-middle">
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/70">#{p._id?.substring(p._id.length - 6).toUpperCase()}</span>
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-12 bg-bone border border-espresso/10 flex-shrink-0 overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10"><ImageIcon className="w-4 h-4" /></div>
                          )}
                        </div>
                        <span className="font-serif text-lg text-espresso group-hover:italic transition-all">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 align-middle">
                      <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-espresso/50 border border-espresso/10 px-2 py-1">{p.type}</span>
                    </td>
                    <td className="py-5 px-6 align-middle text-right">
                      <span className="font-serif text-md">₵{(p.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="py-5 px-6 align-middle text-right">
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/90">{p.stock || 0}</span>
                    </td>
                    <td className="py-5 px-6 align-middle text-right">
                       <div className="flex justify-end gap-4">
                         <button onClick={() => handleEdit(p)} className="text-espresso/30 hover:text-espresso transition-colors"><Edit3 strokeWidth={1} className="w-4 h-4" /></button>
                         <button onClick={() => handleDeleteProduct(p._id)} className="text-red-900/20 hover:text-red-900 transition-colors"><Trash2 strokeWidth={1} className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-espresso/50">
                      <p className="font-serif text-xl italic mb-2">Archive empty.</p>
                      <p className="font-sans text-[10px] tracking-[0.2em] uppercase">No masterpieces found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
