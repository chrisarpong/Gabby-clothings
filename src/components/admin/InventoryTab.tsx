import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* Left Column: Inventory List */}
      <section className="lg:col-span-8 flex flex-col">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#3a1f1d] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Inventory
            </h2>
            <p className="text-[10px] tracking-[0.05em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
              {products ? products.length : 0} MASTERPIECES AVAILABLE
            </p>
          </div>
        </div>

        {/* Table Header (Grid-based to match HTML layout) */}
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#3a1f1d]/10 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
          <div className="col-span-1"></div>
          <div className="col-span-4">Piece</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2 text-right">Price (GHS)</div>
          <div className="col-span-2 text-right">Stock</div>
        </div>

        {/* Inventory Items */}
        <div className="flex flex-col">
          {products === undefined ? (
            <div className="py-12 text-center text-[#504443] italic text-sm">Syncing database...</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[#3a1f1d]/20 mt-4">
              <ImageIcon className="w-8 h-8 text-[#3a1f1d]/30 mx-auto mb-4" />
              <p className="text-[14px] text-[#504443] opacity-50">Your atelier is currently empty.</p>
            </div>
          ) : (
            products.map((p) => (
              <div
                key={p._id}
                className="grid grid-cols-12 gap-4 py-6 border-b border-[#3a1f1d]/10 items-center group cursor-pointer hover:bg-[#f4f3f1] transition-colors duration-300 -mx-4 px-4"
              >
                {/* Thumbnail */}
                <div className="col-span-1">
                  <div className="w-12 h-16 bg-[#efeeec] overflow-hidden">
                    {p.images?.[0] ? (
                      <img
                        alt={p.name}
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                        src={p.images[0]}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[#3a1f1d]/30" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Name + Ref */}
                <div className="col-span-4 flex flex-col justify-center">
                  <span className="text-[20px] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {p.name}
                  </span>
                  <span className="text-[10px] tracking-[0.05em] text-[#504443] mt-1 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    #REF-{p._id.substring(p._id.length - 4).toUpperCase()}
                  </span>
                </div>

                {/* Category */}
                <div className="col-span-3 flex items-center">
                  <span className="text-[16px] tracking-[0.01em] text-[#1a1c1b] capitalize" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {p.type === 'custom' ? 'Bespoke' : 'Ready-to-wear'}
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-2 flex items-center justify-end">
                  <span className="text-[16px] tracking-[0.01em] text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {p.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Stock + Actions */}
                <div className="col-span-2 flex items-center justify-end gap-4">
                  <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] px-3 py-1 border border-[#3a1f1d]/10" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {p.stock || 0}
                  </span>
                  <div className="hidden group-hover:flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                      className="text-[#3a1f1d]/40 hover:text-[#3a1f1d] transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                      className="text-red-700/40 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Right Column: Add Masterpiece Panel */}
      <aside className="lg:col-span-4 lg:pl-8 lg:border-l border-[#3a1f1d]/10">
        <div className="lg:sticky lg:top-28">
          <h3 className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            {editingId ? 'Edit Masterpiece' : 'Add Masterpiece'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Media Upload Dropzone */}
            <div
              onClick={handleDropzoneClick}
              className="w-full aspect-[3/4] border border-dashed border-[#3a1f1d]/20 flex flex-col items-center justify-center cursor-pointer hover:border-[#3a1f1d]/50 hover:bg-[#f4f3f1] transition-all duration-300 group relative overflow-hidden"
            >
              {formData.imageFile ? (
                <img
                  src={URL.createObjectURL(formData.imageFile)}
                  alt="Preview"
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Current"
                  className="w-full h-full object-cover absolute inset-0 opacity-60"
                />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#3a1f1d]/40 mb-4 group-hover:text-[#3a1f1d] transition-colors" />
                  <span className="text-[11px] font-semibold tracking-[0.15em] text-[#3a1f1d]/60 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Upload Cover
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-6">
              {/* Piece Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Piece Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-transparent border-0 border-b border-[#3a1f1d]/20 p-0 pb-2 text-[16px] tracking-[0.01em] text-[#3a1f1d] focus:border-[#3a1f1d] focus:ring-0 transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                  placeholder="e.g. Linen Suit"
                  type="text"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Category
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="bg-transparent border-0 border-b border-[#3a1f1d]/20 p-0 pb-2 text-[16px] tracking-[0.01em] text-[#3a1f1d] focus:border-[#3a1f1d] focus:ring-0 transition-colors cursor-pointer appearance-none outline-none"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  <option value="ready-to-wear">Ready-to-wear</option>
                  <option value="custom">Bespoke</option>
                </select>
              </div>

              {/* Price & Stock Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Price (GHS)
                  </label>
                  <input
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-transparent border-0 border-b border-[#3a1f1d]/20 p-0 pb-2 text-[16px] tracking-[0.01em] text-[#3a1f1d] focus:border-[#3a1f1d] focus:ring-0 transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                    placeholder="0.00"
                    type="number"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Stock
                  </label>
                  <input
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-transparent border-0 border-b border-[#3a1f1d]/20 p-0 pb-2 text-[16px] tracking-[0.01em] text-[#3a1f1d] focus:border-[#3a1f1d] focus:ring-0 transition-colors placeholder:text-[#3a1f1d]/30 outline-none"
                    placeholder="0"
                    type="number"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-transparent border-0 border-b border-[#3a1f1d]/20 p-0 pb-2 text-[16px] tracking-[0.01em] text-[#3a1f1d] focus:border-[#3a1f1d] focus:ring-0 transition-colors placeholder:text-[#3a1f1d]/30 resize-none outline-none"
                  placeholder="Describe the piece..."
                  style={{ fontFamily: "'Jost', sans-serif" }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#3a1f1d] text-white text-[11px] font-semibold tracking-[0.15em] uppercase py-4 hover:bg-black transition-colors duration-300 mt-4"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {editingId ? 'Save Changes' : 'Save to Inventory'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ name: '', price: '', description: '', imageUrl: '', imageFile: null, type: 'custom', stock: '0' });
                }}
                className="w-full border border-[#3a1f1d] text-[#3a1f1d] text-[11px] font-semibold tracking-[0.15em] uppercase py-4 hover:bg-[#3a1f1d] hover:text-white transition-colors duration-300"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Cancel Editing
              </button>
            )}
          </form>
        </div>
      </aside>
    </div>
  );
};
