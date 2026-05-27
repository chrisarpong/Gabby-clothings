import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, Upload } from 'lucide-react';
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const products = useQuery(api.products.getAll) || [];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || product.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const createProduct = useMutation(api.products.create);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Suits',
    description: '',
    stock: 10,
    type: 'ready_to_wear'
  });

  const handleSaveProduct = async () => {
    await createProduct({
      name: newProduct.name || 'Untitled Product',
      basePrice: parseFloat(newProduct.price) || 0,
      description: newProduct.description,
      images: ['https://images.unsplash.com/photo-1594938298593-70f11ac71089?q=80&w=3000&auto=format&fit=crop'],
      category: newProduct.category,
      type: newProduct.type as any,
      status: newProduct.stock > 0 ? "active" : "draft" 
    });
    setIsSlideoutOpen(false);
    toast.success("Product created successfully.");
    setNewProduct({ name: '', price: '', category: 'Suits', description: '', stock: 10, type: 'physical' });
  };

  return (
    <div className="p-10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h1 className="font-serif text-3xl text-primary">Products</h1>
          <p className="font-label text-xs tracking-widest uppercase text-outline mt-2">Manage Store Inventory</p>
        </div>
        <button 
          onClick={() => setIsSlideoutOpen(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-outline-variant/30 pl-10 pr-4 py-2 font-sans text-sm focus:outline-none focus:border-primary placeholder:text-outline transition-colors"
          />
        </div>
        <div className="flex gap-4 font-label text-[10px] tracking-widest uppercase">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border border-outline-variant/30 px-4 py-2 text-primary focus:outline-none focus:border-primary"
          >
            <option>All Categories</option>
            <option>Suits</option>
            <option>Shirts</option>
          </select>
          <select className="bg-transparent border border-outline-variant/30 px-4 py-2 text-primary focus:outline-none focus:border-primary">
            <option>All Status</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto border border-outline-variant/30 bg-surface relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface shadow-[0_1px_0_theme(colors.outline-variant/30)] z-10">
            <tr>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30 w-16">Preview</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Product Name</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Category</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Price</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Stock Status</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className="group hover:bg-surface-container/20 transition-colors">
                <td className="p-4 border-b border-outline-variant/10">
                  <div className="w-10 h-10 bg-surface-container overflow-hidden">
                    <img src={product?.images?.[0] || "/assets/1.jpg"} alt={product?.name || "Product"} className="w-full h-full object-cover grayscale-[20%]" />
                  </div>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-primary">{product.name}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-outline capitalize">{product.category}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-primary">${product.basePrice}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="inline-block px-3 py-1 font-label text-[10px] tracking-widest uppercase bg-surface-container text-primary rounded-sm">
                    {product.status === 'active' ? '10' : '0'} in stock
                  </span>
                </td>
                <td className="p-4 border-b border-outline-variant/10 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-outline hover:text-primary transition-colors" onClick={() => setIsSlideoutOpen(true)}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-outline hover:text-error transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-outline font-sans text-sm">
                  No products found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Overlay */}
      {isSlideoutOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setIsSlideoutOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[500px] bg-surface border-l border-outline-variant/30 z-50 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isSlideoutOpen ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        <div className="flex justify-between items-center p-8 border-b border-outline-variant/30 shrink-0">
          <h2 className="font-serif text-2xl text-primary">Add Product</h2>
          <button 
            onClick={() => setIsSlideoutOpen(false)}
            className="text-outline hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Product Name</label>
            <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/30 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Midnight Silk Smoking Jacket" />
          </div>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Price</label>
              <input type="text" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/30 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. 1250" />
            </div>
            <div>
              <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-transparent border-b border-outline-variant/30 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary">
                <option>Suits</option>
                <option>Shirts</option>
                <option>Kaftans</option>
                <option>Agbadas</option>
                <option>Accessories</option>
                <option>Eveningwear</option>
                <option>Outerwear</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Description</label>
            <textarea rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-transparent border border-outline-variant/30 p-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors resize-none" placeholder="Enter product description..." />
          </div>

          <div>
            <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Image Upload (We will use a placeholder)</label>
            <div className="border border-dashed border-outline-variant p-8 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary transition-colors">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors text-outline">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-label text-[10px] tracking-widest uppercase text-outline group-hover:text-primary transition-colors">Drag & Drop or Click to Browse</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 py-2 border-t border-outline-variant/30 pt-8">
            <input type="checkbox" id="inStock" checked={newProduct.stock > 0} onChange={e => setNewProduct({...newProduct, stock: e.target.checked ? 10 : 0})} className="w-4 h-4 accent-primary" />
            <label htmlFor="inStock" className="font-label text-[11px] tracking-wide text-primary">In Stock</label>
          </div>
        </div>

        <div className="p-8 border-t border-outline-variant/30 shrink-0 bg-surface">
          <button 
            onClick={handleSaveProduct}
            className="w-full bg-primary text-on-primary py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity"
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
