import React, { useState } from 'react';
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { Plus, X, Edit2, Archive, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryTab() {
  const products = useQuery(api.products.getAll);
  const createProduct = useMutation(api.products.create);
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);
  const updateProduct = useMutation(api.products.update);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    basePrice: 0,
    description: '',
    category: 'suits',
    type: 'bespoke',
    status: 'draft',
    images: '' // we keep this for existing URLs
  });
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', basePrice: 0, description: '', category: 'suits', type: 'bespoke', status: 'draft', images: '' });
    setImageFiles([]);
    setEditingProductId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      let imageUrls = formData.images ? formData.images.split(',').map(i => i.trim()).filter(i => i) : [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          const url = `${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/getFile?storageId=${storageId}`;
          imageUrls.push(url);
        }
      }

      const productData = {
        name: formData.name,
        basePrice: Number(formData.basePrice),
        description: formData.description,
        category: formData.category,
        type: formData.type,
        status: formData.status,
        images: imageUrls,
      };

      if (editingProductId) {
        await updateProduct({ id: editingProductId, ...productData });
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error(editingProductId ? 'Failed to update product' : 'Failed to create product');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Doc<"products">) => {
    setFormData({
      name: product.name,
      basePrice: product.basePrice ?? 0,
      description: product.description,
      category: product.category,
      type: product.type || 'bespoke',
      status: product.status || 'draft',
      images: product.images?.join(', ') || ''
    });
    setEditingProductId(product._id);
    setIsFormOpen(true);
  };

  const handleArchive = async (product: Doc<"products">) => {
    if (confirm(`Are you sure you want to archive "${product.name}"?`)) {
      try {
        await updateProduct({ id: product._id, status: 'archived' });
        toast.success('Product archived successfully');
      } catch (error) {
        toast.error('Failed to archive product');
      }
    }
  };

  const calculateStock = (product: Doc<"products">) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
    }
    return 0; // Or whatever fallback
  };

  const lowStockItems = products?.flatMap((p: Doc<"products">) => {
    return (p.variants || []).filter((v: any) => v.stock < 5).map((v: any) => ({
      productName: p.name,
      variantName: v.name,
      stock: v.stock
    }));
  }) || [];

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-8 border-b border-brand-espresso/10 flex justify-between items-center bg-brand-bone/50 sticky top-0 z-10">
        <div>
          <h1 className="font-serif text-3xl text-brand-espresso tracking-wide">Inventory Management</h1>
          <p className="font-sans text-brand-charcoal/70 text-sm mt-2">Manage products, variants, and stock levels.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center gap-2 bg-brand-espresso text-brand-bone px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-brand-charcoal transition-colors border border-brand-espresso rounded-none"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="p-8 overflow-y-auto flex-1">
        {lowStockItems.length > 0 && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200">
            <h3 className="text-red-800 font-serif text-lg mb-2">Automated Low Stock Alerts</h3>
            <ul className="space-y-1">
              {lowStockItems.map((item: any, idx: number) => (
                <li key={idx} className="text-sm font-sans text-red-700 flex justify-between">
                  <span>{item.productName} - {item.variantName}</span>
                  <span className="font-mono">Stock: {item.stock}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {products === undefined ? (
          <div className="flex justify-center items-center py-20 text-brand-charcoal/50">Loading inventory...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <PackageOpen className="w-16 h-16 text-brand-espresso/20 mb-6 stroke-[1]" />
            <h3 className="font-serif text-2xl text-brand-espresso mb-2">No Products Found</h3>
            <p className="font-sans text-brand-charcoal/60 max-w-md">Your catalog is currently empty. Start by adding your first bespoke or ready-to-wear piece.</p>
            <button 
              onClick={() => { resetForm(); setIsFormOpen(true); }}
              className="mt-8 bg-brand-gold text-brand-espresso px-8 py-3 font-sans text-xs tracking-widest uppercase hover:bg-brand-gold/80 transition-colors rounded-none"
            >
              Configure First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-brand-espresso/10 bg-white">
            <table className="w-full text-left font-sans text-sm border-collapse">
              <thead>
                <tr className="bg-brand-bone/50 border-b border-brand-espresso/10 text-brand-charcoal uppercase tracking-widest text-[10px]">
                  <th className="px-6 py-4 font-normal">Product Name</th>
                  <th className="px-6 py-4 font-normal">Category</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 font-normal text-right">Base Price</th>
                  <th className="px-6 py-4 font-normal text-right">Total Stock</th>
                  <th className="px-6 py-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-espresso/5">
                {products.map((product: Doc<"products">) => (
                  <tr key={product._id} className="hover:bg-brand-bone/20 group transition-colors">
                    <td className="px-6 py-4 text-brand-espresso font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-brand-charcoal/70 capitalize">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-wider rounded-none ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-brand-charcoal">GH₵{(product?.basePrice ?? 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      {calculateStock(product)} <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 ml-1">Units</span>
                      {calculateStock(product) < 5 && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" title="Low Stock"></span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(product)} className="text-brand-charcoal/50 hover:text-brand-espresso"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleArchive(product)} className="text-brand-charcoal/50 hover:text-red-600"><Archive className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Form */}
      {isFormOpen && (
        <div className="absolute inset-0 bg-brand-charcoal/20 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[500px] h-full bg-white shadow-2xl border-l border-brand-espresso/10 flex flex-col pt-8">
            <div className="flex justify-between items-center px-8 border-b border-brand-espresso/10 pb-6">
              <h2 className="font-serif text-2xl text-brand-espresso">Catalog Entry</h2>
              <button onClick={resetForm} className="text-brand-charcoal/50 hover:text-brand-espresso transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Product Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors"
                  required 
                />
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none h-32 resize-none text-brand-espresso transition-colors"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Base Price (GH₵)</label>
                  <input 
                    type="number" 
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                    className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors"
                    required 
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none appearance-none text-brand-espresso transition-colors"
                  >
                    <option value="bespoke">Bespoke</option>
                    <option value="ready_to_wear">Ready to Wear</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none appearance-none text-brand-espresso transition-colors"
                  >
                    <option value="suits">Suits</option>
                    <option value="shirts">Shirts</option>
                    <option value="trousers">Trousers</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none appearance-none text-brand-espresso transition-colors"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2">Upload Images</label>
                <input 
                  type="file" 
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setImageFiles(Array.from(e.target.files));
                    }
                  }}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors mb-2"
                />
                
                <label className="block font-sans text-xs uppercase tracking-widest text-brand-charcoal mb-2 mt-4">Or Existing Image URLs (Comma separated)</label>
                <input 
                  type="text" 
                  value={formData.images}
                  onChange={(e) => setFormData({...formData, images: e.target.value})}
                  className="w-full bg-brand-bone border border-brand-espresso/20 p-3 font-sans text-sm focus:outline-none focus:border-brand-espresso rounded-none text-brand-espresso transition-colors"
                  placeholder="https://..."
                />
                {imageFiles.length > 0 && (
                  <p className="text-xs text-brand-charcoal/70 mt-2">{imageFiles.length} file(s) selected for upload</p>
                )}
              </div>

              <div className="pt-8 border-t border-brand-espresso/10 mt-auto">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-espresso text-brand-bone py-4 font-sans text-xs tracking-widest uppercase hover:bg-brand-charcoal transition-colors disabled:opacity-50 rounded-none"
                >
                  {isSubmitting ? 'Provisioning...' : 'Save Product Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
