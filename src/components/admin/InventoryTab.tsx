import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { Plus, X, Edit2, Archive, PackageOpen, FolderOpen, Image as ImageIcon, Search, Filter, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryTab() {
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'catalogs'>('products');
  const [viewingCatalogId, setViewingCatalogId] = useState<Id<"catalogs"> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkCatalogId, setBulkCatalogId] = useState('');
  
  const products = useQuery(api.products.getAll);
  const catalogs = useQuery(api.catalogs.getAll, { includeArchived: true });

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const createCatalog = useMutation(api.catalogs.create);
  const updateCatalog = useMutation(api.catalogs.update);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCatalogFormOpen, setIsCatalogFormOpen] = useState(false);
  
  const [editingProductId, setEditingProductId] = useState<Id<"products"> | null>(null);
  const [editingCatalogId, setEditingCatalogId] = useState<Id<"catalogs"> | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // --- Product Form State ---
  const [productForm, setProductForm] = useState({
    name: '',
    basePrice: 0,
    description: '',
    category: 'suits',
    type: 'showcase_template',
    status: 'draft',
    catalogIds: [] as string[],
    seoMetaTitle: '',
    seoMetaDescription: '',
    images: '',
    stock: 0,
    fabricRequirement: '',
  });
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // --- Catalog Form State ---
  const [catalogForm, setCatalogForm] = useState({
    name: '',
    description: '',
    status: 'active',
    slug: '',
    coverImageId: ''
  });
  const [catalogImageFile, setCatalogImageFile] = useState<File | null>(null);

  const resetProductForm = () => {
    setProductForm({ name: '', basePrice: 0, description: '', category: 'suits', type: 'showcase_template', status: 'draft', catalogIds: [], seoMetaTitle: '', seoMetaDescription: '', images: '', stock: 0, fabricRequirement: '' });
    setProductImageFiles([]);
    setImagePreviews([]);
    setEditingProductId(null);
    setIsProductFormOpen(false);
    setIsCustomCategory(false);
  };

  const resetCatalogForm = () => {
    setCatalogForm({ name: '', description: '', status: 'active', slug: '', coverImageId: '' });
    setCatalogImageFile(null);
    setEditingCatalogId(null);
    setIsCatalogFormOpen(false);
  };

  // Upload Utility
  const handleUploadFiles = async (files: File[]) => {
    const urlsOrIds = [];
    for (const file of files) {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      urlsOrIds.push(storageId);
    }
    return urlsOrIds;
  };

  const handleBulkAssign = async () => {
    if (!bulkCatalogId || selectedProductIds.length === 0) return;
    try {
      setIsSubmitting(true);
      for (const pId of selectedProductIds) {
        const p = products?.find((prod: any) => prod._id === pId);
        if (p) {
          const currentCatalogs = (p as any).catalogIds || [];
          if (!currentCatalogs.includes(bulkCatalogId)) {
            await updateProduct({ id: p._id, catalogIds: [...currentCatalogs, bulkCatalogId] as any });
          }
        }
      }
      toast.success('Products assigned to catalog');
      setSelectedProductIds([]);
      setBulkCatalogId('');
    } catch (e) {
      toast.error('Bulk assign failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFromCatalog = async (productId: Id<"products">, currentCatalogIds: Id<"catalogs">[], catalogToRemove: Id<"catalogs">) => {
    try {
      const newIds = currentCatalogIds.filter(id => id !== catalogToRemove);
      await updateProduct({ id: productId, catalogIds: newIds });
      toast.success('Removed from catalog');
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      let imageUrls = productForm.images ? productForm.images.split(',').map(i => i.trim()).filter(i => i) : [];

      if (productImageFiles.length > 0) {
        const storageIds = await handleUploadFiles(productImageFiles);
        // For products, historically using URLs. You can map storageId to URL:
        const urls = storageIds.map(id => `${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/getFile?storageId=${id}`);
        imageUrls.push(...urls);
      }

      const productData: any = {
        name: productForm.name,
        basePrice: Number(productForm.basePrice),
        description: productForm.description,
        category: productForm.category,
        type: productForm.type,
        status: productForm.status,
        images: imageUrls,
        catalogIds: productForm.catalogIds.map(id => id as Id<"catalogs">),
        seo: { metaTitle: productForm.seoMetaTitle, metaDescription: productForm.seoMetaDescription }
      };

      if (productForm.type === 'ready_to_wear') {
        productData.stock = Number(productForm.stock);
        productData.fabricRequirement = undefined;
      } else {
        productData.stock = undefined;
        productData.fabricRequirement = productForm.fabricRequirement;
      }

      if (editingProductId) {
        await updateProduct({ id: editingProductId, ...productData });
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }
      resetProductForm();
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCatalogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let coverImageId = catalogForm.coverImageId;

      if (catalogImageFile) {
        const ids = await handleUploadFiles([catalogImageFile]);
        coverImageId = ids[0];
      }

      const catalogData = {
        name: catalogForm.name,
        description: catalogForm.description,
        status: catalogForm.status,
        slug: catalogForm.slug,
        coverImageId: coverImageId || undefined,
      };

      if (editingCatalogId) {
        await updateCatalog({ id: editingCatalogId, ...catalogData });
        toast.success('Catalog updated successfully');
      } else {
        await createCatalog(catalogData);
        toast.success('Catalog created successfully');
      }
      resetCatalogForm();
    } catch (error) {
      toast.error('Failed to save catalog');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editProduct = (product: Doc<"products">) => {
    setProductForm({
      name: product.name,
      basePrice: product.basePrice ?? 0,
      description: product.description,
      category: product.category,
      type: product.type || 'showcase_template',
      status: product.status || 'draft',
      images: product.images?.join(', ') || '',
      catalogIds: (product as any).catalogIds || [],
      seoMetaTitle: (product as any).seo?.metaTitle || '',
      seoMetaDescription: (product as any).seo?.metaDescription || '',
      stock: product.stock ?? 0,
      fabricRequirement: product.fabricRequirement || '',
    });
    setImagePreviews(product.images || []);
    setEditingProductId(product._id);
    
    // Check if the product's category is one of the default ones
    const defaultCategories = ['suits', 'agbada', 'kaftans', 'shirts'];
    const uniqueCategories = Array.from(new Set((products || []).map((p: any) => p.category))).filter(Boolean);
    const allCategories = Array.from(new Set([...defaultCategories, ...uniqueCategories]));
    
    if (product.category && !allCategories.includes(product.category)) {
       setIsCustomCategory(true);
    } else {
       setIsCustomCategory(false);
    }

    setIsProductFormOpen(true);
  };

  const editCatalog = (cat: Doc<"catalogs">) => {
    setCatalogForm({
      name: cat.name,
      description: cat.description || '',
      status: cat.status,
      slug: cat.slug,
      coverImageId: cat.coverImageId || ''
    });
    setEditingCatalogId(cat._id);
    setIsCatalogFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="p-8 border-b border-brand-espresso/10 flex justify-between items-center bg-brand-bone/50 sticky top-0 z-10">
        <div>
          <h1 className="font-serif text-3xl text-brand-espresso tracking-wide">Catalog & Inventory</h1>
          <p className="font-sans text-brand-charcoal/70 text-sm mt-2">Manage products, variants, SEO, and grouping catalogs.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { resetCatalogForm(); setIsCatalogFormOpen(true); }}
            className="flex items-center gap-2 bg-brand-bone text-brand-espresso px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-brand-bone/80 transition-colors border border-brand-espresso rounded-none"
          >
            <Plus className="w-4 h-4" /> Add Catalog
          </button>
          <button 
            onClick={() => { resetProductForm(); setIsProductFormOpen(true); }}
            className="flex items-center gap-2 bg-brand-espresso text-brand-bone px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-brand-charcoal transition-colors border border-brand-espresso rounded-none"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="border-b flex">
         <button 
           className={`flex-1 p-4 font-serif text-lg ${activeSubTab === 'products' ? 'border-b-2 border-brand-espresso text-brand-espresso' : 'text-gray-400'}`}
           onClick={() => setActiveSubTab('products')}
         >Products Manager</button>
         <button 
           className={`flex-1 p-4 font-serif text-lg ${activeSubTab === 'catalogs' ? 'border-b-2 border-brand-espresso text-brand-espresso' : 'text-gray-400'}`}
           onClick={() => { setActiveSubTab('catalogs'); setViewingCatalogId(null); }}
         >Catalogs Manager</button>
      </div>

      <div className="p-8 overflow-y-auto flex-1">
        {activeSubTab === 'products' ? (
          products === undefined ? (
            <div className="flex justify-center items-center py-20 text-brand-charcoal/50">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <PackageOpen className="w-16 h-16 text-brand-espresso/20 mb-6 stroke-[1]" />
              <h3 className="font-serif text-2xl text-brand-espresso mb-2">No Products Found</h3>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-bone/20 p-4 border border-brand-espresso/10">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-charcoal/50" />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="w-full pl-10 pr-4 py-2 border text-sm focus:outline-none focus:border-brand-espresso"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-charcoal/50" />
                    <select 
                      className="pl-10 pr-4 py-2 border text-sm appearance-none bg-white focus:outline-none focus:border-brand-espresso"
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      {Array.from(new Set((products || []).map((p: any) => p.category))).filter(Boolean).map(cat => (
                        <option key={cat as string} value={cat as string}>{String(cat).toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {selectedProductIds.length > 0 && catalogs && catalogs.length > 0 && (
                  <div className="flex items-center gap-2 bg-brand-gold/10 p-2 border border-brand-gold/20">
                    <span className="text-xs font-medium px-2 text-brand-gold">{selectedProductIds.length} Selected</span>
                    <select 
                      className="text-sm py-1 px-2 border border-brand-espresso/20 bg-white"
                      value={bulkCatalogId}
                      onChange={e => setBulkCatalogId(e.target.value)}
                    >
                      <option value="">Select Catalog...</option>
                      {catalogs.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <button 
                      onClick={handleBulkAssign}
                      disabled={!bulkCatalogId || isSubmitting}
                      className="bg-brand-espresso text-white text-xs px-4 py-1.5 uppercase tracking-widest hover:bg-brand-charcoal disabled:opacity-50 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                )}
              </div>

              {/* Grouped Rendering */}
              {(() => {
                const filteredProducts = products.filter((p: any) => {
                  const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
                  return matchesSearch && matchesCat;
                });

                if (filteredProducts.length === 0) {
                  return <div className="text-center py-10 text-brand-charcoal/50 border border-brand-espresso/10 bg-white">No products match your search or filter.</div>;
                }

                // Group by category
                const groups: Record<string, any[]> = {};
                filteredProducts.forEach((p: any) => {
                  const cat = p.category || 'Uncategorized';
                  if (!groups[cat]) groups[cat] = [];
                  groups[cat].push(p);
                });

                return Object.entries(groups).map(([catName, catProducts]) => (
                  <div key={catName} className="mb-8 border border-brand-espresso/10 bg-white">
                    <div className="bg-brand-bone/50 px-6 py-3 border-b border-brand-espresso/10">
                      <h3 className="font-serif text-xl text-brand-espresso capitalize">{catName} <span className="text-sm text-brand-charcoal/50 font-sans tracking-widest uppercase ml-2">({catProducts.length})</span></h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-brand-espresso/10 text-brand-charcoal uppercase tracking-widest text-[10px]">
                            <th className="px-6 py-3 w-10">
                              <input 
                                type="checkbox" 
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const newIds = new Set([...selectedProductIds, ...catProducts.map(p => p._id)]);
                                    setSelectedProductIds(Array.from(newIds));
                                  } else {
                                    const newIds = selectedProductIds.filter(id => !catProducts.find(p => p._id === id));
                                    setSelectedProductIds(newIds);
                                  }
                                }}
                                checked={catProducts.length > 0 && catProducts.every(p => selectedProductIds.includes(p._id))}
                                className="cursor-pointer"
                              />
                            </th>
                            <th className="px-6 py-3 font-normal">Product Name (Click to Edit)</th>
                            <th className="px-6 py-3 font-normal">Catalogs</th>
                            <th className="px-6 py-3 font-normal">Status</th>
                            <th className="px-6 py-3 font-normal text-right">Base Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-espresso/5">
                          {catProducts.map((product: any) => (
                            <tr 
                              key={product._id} 
                              className="hover:bg-brand-bone/20 group transition-colors cursor-pointer"
                              onClick={(e) => {
                                if ((e.target as HTMLElement).tagName === 'INPUT') return;
                                editProduct(product);
                              }}
                            >
                              <td className="px-6 py-4">
                                <input 
                                  type="checkbox" 
                                  checked={selectedProductIds.includes(product._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedProductIds(prev => [...prev, product._id]);
                                    } else {
                                      setSelectedProductIds(prev => prev.filter(id => id !== product._id));
                                    }
                                  }}
                                  onClick={e => e.stopPropagation()}
                                  className="cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4 flex items-center gap-3">
                                {(product as any).catalogIds && (product as any).catalogIds.length > 0 && (
                                  <span className="bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded text-[10px]">In Catalog</span>
                                )}
                                {product.images && product.images.length > 0 ? (
                                  <div className="w-10 h-12 bg-gray-100 flex-shrink-0">
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-12 bg-brand-bone flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-4 h-4 text-brand-charcoal/30" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-brand-espresso font-medium flex items-center gap-2">
                                    {product.name}
                                    <Edit2 className="w-3 h-3 text-brand-charcoal/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </p>
                                  <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mt-1">{product.type === 'showcase_template' ? 'Custom Tailored (Made-to-Measure)' : 'Off-the-rack (Ready Size)'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-brand-charcoal/70">
                                 {(product as any).catalogIds?.length ? (product as any).catalogIds.length + ' Catalogs' : 'None'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-wider rounded-none ${
                                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                                  product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {product.status}
                                </span>
                                {(() => {
                                  const isSoldOut = product.variants && product.variants.length > 0
                                    ? product.variants.every((v: any) => v.stock <= 0)
                                    : product.stock !== undefined && product.stock <= 0;
                                  return isSoldOut && (
                                    <span className="ml-2 inline-block px-2 py-1 text-[10px] uppercase tracking-wider rounded-none bg-red-600 text-white font-bold">
                                      Sold Out
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="px-6 py-4 text-right text-brand-charcoal">GH₵{(product?.basePrice ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )
        ) : (
          /* Catalogs View */
          catalogs === undefined ? (
            <div className="flex justify-center items-center py-20 text-brand-charcoal/50">Loading catalogs...</div>
          ) : viewingCatalogId ? (
            <div className="flex flex-col gap-6 bg-white border border-brand-espresso/10 p-8">
              <div className="flex justify-between items-start border-b border-brand-espresso/10 pb-6">
                <div>
                  <button onClick={() => setViewingCatalogId(null)} className="text-brand-charcoal/50 hover:text-brand-espresso text-sm mb-4 flex items-center gap-2 uppercase tracking-widest">
                    ← Back to Catalogs
                  </button>
                  <h2 className="font-serif text-3xl text-brand-espresso mb-2">{catalogs.find(c => c._id === viewingCatalogId)?.name}</h2>
                  <p className="text-brand-charcoal/70 text-sm max-w-2xl">{catalogs.find(c => c._id === viewingCatalogId)?.description || 'No description provided.'}</p>
                </div>
                <button 
                  onClick={() => editCatalog(catalogs.find(c => c._id === viewingCatalogId)!)}
                  className="bg-brand-bone text-brand-espresso px-6 py-3 font-sans text-xs tracking-widest uppercase hover:bg-brand-bone/80 transition-colors border border-brand-espresso rounded-none"
                >
                  Edit Catalog Details
                </button>
              </div>

              <div>
                <h3 className="font-serif text-xl text-brand-espresso mb-4">Products in this Catalog</h3>
                {(() => {
                  const catalogProducts = products?.filter((p: any) => p.catalogIds?.includes(viewingCatalogId)) || [];
                  if (catalogProducts.length === 0) {
                    return <div className="text-center py-12 text-brand-charcoal/50 border border-brand-espresso/10 bg-brand-bone/10">No products have been assigned to this catalog yet.</div>;
                  }

                  return (
                    <div className="overflow-x-auto border border-brand-espresso/10">
                      <table className="w-full text-left font-sans text-sm border-collapse">
                        <thead>
                          <tr className="bg-brand-bone/50 border-b border-brand-espresso/10 text-brand-charcoal uppercase tracking-widest text-[10px]">
                            <th className="px-6 py-4 font-normal">Product Name</th>
                            <th className="px-6 py-4 font-normal">Status</th>
                            <th className="px-6 py-4 font-normal">Base Price</th>
                            <th className="px-6 py-4 font-normal text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-espresso/5">
                          {catalogProducts.map((product: any) => (
                            <tr key={product._id} className="hover:bg-brand-bone/20 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                {product.images && product.images.length > 0 ? (
                                  <div className="w-10 h-12 bg-gray-100 flex-shrink-0">
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-12 bg-brand-bone flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="w-4 h-4 text-brand-charcoal/30" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-brand-espresso font-medium">{product.name}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-wider rounded-none ${
                                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-brand-charcoal">GH₵{(product.basePrice ?? 0).toFixed(2)}</td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => handleRemoveFromCatalog(product._id, product.catalogIds, viewingCatalogId)}
                                  className="text-red-500 hover:text-red-700 text-xs tracking-widest uppercase"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : catalogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <FolderOpen className="w-16 h-16 text-brand-espresso/20 mb-6 stroke-[1]" />
              <h3 className="font-serif text-2xl text-brand-espresso mb-2">No Catalogs Found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogs.map(cat => (
                <div 
                  key={cat._id} 
                  className="border p-6 relative group bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                  onClick={() => setViewingCatalogId(cat._id)}
                >
                   <h3 className="font-serif text-xl mb-2">{cat.name}</h3>
                   <p className="text-sm text-gray-500 mb-4">{cat.slug}</p>
                   <p className="text-xs text-brand-charcoal/50 mb-4">{products?.filter((p: any) => p.catalogIds?.includes(cat._id)).length || 0} Products</p>
                   <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-wider ${cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>
                     {cat.status}
                   </span>
                   <button 
                     onClick={(e) => { e.stopPropagation(); editCatalog(cat); }} 
                     className="absolute top-4 right-4 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 bg-white p-2 border"
                   >
                     <Edit2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Product Form Drawer */}
      {isProductFormOpen && (
        <div className="absolute inset-0 bg-brand-charcoal/20 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[600px] h-full bg-white shadow-2xl border-l flex flex-col pt-8">
            <div className="flex justify-between items-center px-8 pb-6 border-b">
              <h2 className="font-serif text-2xl">Product Entry</h2>
              <button onClick={resetProductForm}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                {/* Type Toggle */}
                <div className="flex bg-brand-bone p-1">
                  <button 
                    type="button"
                    onClick={() => setProductForm({...productForm, type: 'showcase_template'})}
                    className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${productForm.type === 'showcase_template' ? 'bg-brand-espresso text-white' : 'text-brand-charcoal hover:bg-brand-charcoal/5'}`}
                  >
                    Custom Tailored (Made-to-Measure)
                  </button>
                  <button 
                    type="button"
                    onClick={() => setProductForm({...productForm, type: 'ready_to_wear'})}
                    className={`flex-1 py-2 text-xs uppercase tracking-widest transition-colors ${productForm.type === 'ready_to_wear' ? 'bg-brand-espresso text-white' : 'text-brand-charcoal hover:bg-brand-charcoal/5'}`}
                  >
                    Off-the-rack (Ready Size)
                  </button>
                </div>

               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Product Name</label>
                  <input type="text" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} className="w-full border p-3" required />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="w-full border p-3 h-24" required />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">
                      {productForm.type === 'showcase_template' ? 'Base Starting Price' : 'Price'}
                    </label>
                    <input type="number" value={productForm.basePrice} onChange={(e) => setProductForm({...productForm, basePrice: parseFloat(e.target.value)})} className="w-full border p-3" required />
                  </div>
                  {productForm.type === 'ready_to_wear' ? (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Stock Count</label>
                      <input type="number" value={productForm.stock} onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full border p-3" required />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Fabric Required (Yards)</label>
                      <input type="text" placeholder="e.g. 4.5 yards" value={productForm.fabricRequirement} onChange={(e) => setProductForm({...productForm, fabricRequirement: e.target.value})} className="w-full border p-3" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Status</label>
                    <select value={productForm.status} onChange={(e) => setProductForm({...productForm, status: e.target.value})} className="w-full border p-3">
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Category</label>
                    {!isCustomCategory ? (
                      <select 
                        value={productForm.category}
                        onChange={(e) => {
                          if (e.target.value === 'custom_new') {
                             setIsCustomCategory(true);
                             setProductForm({...productForm, category: ''});
                          } else {
                             setProductForm({...productForm, category: e.target.value});
                          }
                        }}
                        className="w-full border p-3 capitalize bg-white"
                      >
                        {Array.from(new Set(['suits', 'agbada', 'kaftans', 'shirts', ...(products || []).map((p: any) => p.category)])).filter(Boolean).map(c => (
                          <option key={c as string} value={c as string}>{String(c)}</option>
                        ))}
                        <option value="custom_new">+ Create New Category...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={productForm.category}
                          onChange={e => setProductForm({...productForm, category: e.target.value})}
                          placeholder="Type new category..."
                          className="w-full border p-3"
                          autoFocus
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setIsCustomCategory(false);
                            if (!productForm.category) setProductForm({...productForm, category: 'suits'});
                          }}
                          className="border px-4 bg-brand-bone text-brand-charcoal text-xs hover:bg-brand-bone/80 transition-colors uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

               {/* Gallery Uploader */}
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Image Gallery</label>
                  <div className="border-2 border-dashed border-brand-charcoal/20 p-8 text-center hover:bg-brand-bone/30 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          const filesArray = Array.from(e.target.files);
                          setProductImageFiles(prev => [...prev, ...filesArray]);
                          
                          // Generate preview URLs
                          const newPreviews = filesArray.map(f => URL.createObjectURL(f));
                          setImagePreviews(prev => [...prev, ...newPreviews]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <ImageIcon className="w-8 h-8 text-brand-charcoal/30 mx-auto mb-2" />
                    <p className="text-sm text-brand-charcoal/70">Click or drag images to upload</p>
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="w-20 h-24 flex-shrink-0 relative group">
                          <img src={src} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => {
                              // If it's a new file preview
                              if (src.startsWith('blob:')) {
                                const fileIndex = imagePreviews.findIndex(p => p === src);
                                setProductImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
                              } else {
                                // If it's an existing image, update the images string
                                setProductForm(prev => {
                                  const arr = prev.images.split(',').map(s=>s.trim()).filter(s=>s!==src);
                                  return {...prev, images: arr.join(', ')};
                                });
                              }
                              setImagePreviews(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
               
               {/* Catalog Assignment */}
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Assign to Catalogs</label>
                  <div className="border p-3 space-y-2 max-h-40 overflow-y-auto">
                    {catalogs?.map(c => (
                      <label key={c._id} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={productForm.catalogIds.includes(c._id)} 
                          onChange={(e) => {
                             const checked = e.target.checked;
                             setProductForm(prev => ({
                               ...prev,
                               catalogIds: checked ? [...prev.catalogIds, c._id] : prev.catalogIds.filter(id => id !== c._id)
                             }));
                          }} 
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
               </div>

               {/* SEO */}
               <div className="p-4 bg-gray-50 border">
                 <h3 className="font-serif text-lg mb-4">SEO Details</h3>
                 <div className="space-y-4">
                   <input type="text" placeholder="Meta Title" value={productForm.seoMetaTitle} onChange={e => setProductForm({...productForm, seoMetaTitle: e.target.value})} className="w-full border p-2 text-sm" />
                   <textarea placeholder="Meta Description" value={productForm.seoMetaDescription} onChange={e => setProductForm({...productForm, seoMetaDescription: e.target.value})} className="w-full border p-2 text-sm h-20" />
                 </div>
               </div>

               <div className="pt-8 border-t mt-auto">
                 <button type="submit" disabled={isSubmitting} className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-widest text-xs">
                   {isSubmitting ? 'Saving...' : 'Save Product'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Catalog Form Drawer */}
      {isCatalogFormOpen && (
        <div className="absolute inset-0 bg-brand-charcoal/20 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[500px] h-full bg-white shadow-2xl border-l flex flex-col pt-8">
            <div className="flex justify-between items-center px-8 pb-6 border-b">
              <h2 className="font-serif text-2xl">Catalog Entry</h2>
              <button onClick={resetCatalogForm}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCatalogSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Catalog Name</label>
                  <input type="text" value={catalogForm.name} onChange={(e) => setCatalogForm({...catalogForm, name: e.target.value})} className="w-full border p-3" required />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">URL Slug</label>
                  <input type="text" value={catalogForm.slug} onChange={(e) => setCatalogForm({...catalogForm, slug: e.target.value})} className="w-full border p-3 bg-gray-50" placeholder="e.g. summer-collection" required />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Description</label>
                  <textarea value={catalogForm.description} onChange={(e) => setCatalogForm({...catalogForm, description: e.target.value})} className="w-full border p-3 h-24" />
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Status</label>
                  <select value={catalogForm.status} onChange={(e) => setCatalogForm({...catalogForm, status: e.target.value})} className="w-full border p-3">
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs uppercase tracking-widest text-brand-charcoal mb-2">Cover Image</label>
                  <input type="file" onChange={(e) => setCatalogImageFile(e.target.files?.[0] || null)} className="w-full border p-3" />
                  {catalogForm.coverImageId && <p className="text-xs text-gray-500 mt-2">Current Image ID: {catalogForm.coverImageId}</p>}
               </div>
               <div className="pt-8 border-t mt-auto">
                 <button type="submit" disabled={isSubmitting} className="w-full bg-brand-charcoal text-white py-4 uppercase tracking-widest text-xs">
                   {isSubmitting ? 'Saving...' : 'Save Catalog'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
