import { useRef } from 'react';
import { Upload, ImageIcon, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface InventoryTabProps {
  products: any[];
  formData: {
    name: string;
    price: string;
    description: string;
    imageUrl: string;
    imageFile: File | null;
    type: 'custom' | 'ready-to-wear';
    stock: string;
  };
  setFormData: (data: any) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleEdit: (product: any) => void;
  handleDelete: (id: any) => void;
}

export const InventoryTab = ({
  products,
  formData,
  setFormData,
  editingId,
  setEditingId,
  handleSubmit,
  handleEdit,
  handleDelete,
}: InventoryTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, imageFile: file });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Inventory
        </h2>
        <p className="text-sm text-[#3a1f1d]/60 mt-1">{products ? products.length : 0} products in your collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
                <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide w-16"></TableHead>
                <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Product</TableHead>
                <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Category</TableHead>
                <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Price</TableHead>
                <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Stock</TableHead>
                <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products === undefined ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-[#3a1f1d]/40">Loading products...</TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-[#3a1f1d]/40">No products yet. Add your first masterpiece.</TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors group">
                    <TableCell className="py-4 px-6">
                      <div className="w-12 h-14 rounded-lg bg-[#F5F2EE] overflow-hidden border border-[#3a1f1d]/8">
                        {p.images?.[0] ? (
                          <img alt={p.name} className="w-full h-full object-cover" src={p.images[0]} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-[#3a1f1d]/20" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="font-medium text-[#2C1816]">{p.name}</span>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#3a1f1d]/5 text-[#3a1f1d]">
                        {p.type === 'custom' ? 'Bespoke' : 'Ready-to-wear'}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right font-medium text-[#2C1816]">
                      GHS {p.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <span className={`text-sm ${p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        {p.stock || 0}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                          className="p-2 rounded-lg text-[#3a1f1d]/40 hover:text-[#3a1f1d] hover:bg-[#3a1f1d]/5 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                          className="p-2 rounded-lg text-red-700/40 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-[#2C1816] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {editingId ? 'Edit Product' : 'Add Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                onClick={handleDropzoneClick}
                className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-[#3a1f1d]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#3a1f1d]/40 hover:bg-[#F5F2EE] transition-all duration-200 group relative overflow-hidden"
              >
                {formData.imageFile ? (
                  <img src={URL.createObjectURL(formData.imageFile)} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                ) : formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Current" className="w-full h-full object-cover absolute inset-0 opacity-60" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-[#3a1f1d]/30 mb-2 group-hover:text-[#3a1f1d]/50 transition-colors" />
                    <span className="text-xs text-[#3a1f1d]/50">Upload image</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Product Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                    placeholder="e.g. Linen Suit"
                    type="text"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors cursor-pointer outline-none"
                  >
                    <option value="ready-to-wear">Ready-to-wear</option>
                    <option value="custom">Bespoke</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Price (GHS)</label>
                    <input
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                      placeholder="0.00"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Stock</label>
                    <input
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                      placeholder="0"
                      type="number"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[#3a1f1d]/60 mb-1.5 block">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-[#3a1f1d]/15 rounded-lg px-3 py-2 text-sm text-[#2C1816] focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] transition-colors placeholder:text-[#3a1f1d]/30 resize-none outline-none"
                    placeholder="Describe the piece..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#3a1f1d] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#2C1816] transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add to Inventory'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', price: '', description: '', imageUrl: '', imageFile: null, type: 'custom', stock: '0' });
                  }}
                  className="w-full border border-[#3a1f1d]/20 text-[#3a1f1d] text-sm font-medium py-2.5 rounded-lg hover:bg-[#3a1f1d]/5 transition-colors"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
