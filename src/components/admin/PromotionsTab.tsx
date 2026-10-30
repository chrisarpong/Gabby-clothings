import React, { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { useStaffQuery, useStaffMutation, useStaffAction } from '../../hooks/useStaffAuth';

type PromoForm = { discountValue: number; validUntil: string; maxRedemptions: string; minOrderAmount: string; isActive: boolean };
const emptyForm: PromoForm = { discountValue: 10, validUntil: '', maxRedemptions: '', minOrderAmount: '', isActive: true };

function toArgs(form: PromoForm) {
  return {
    discountValue: Number(form.discountValue),
    validUntil: form.validUntil ? new Date(form.validUntil).getTime() : undefined,
    maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
    minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
    isActive: form.isActive,
  };
}

export default function PromotionsTab() {
  const promos = useStaffQuery(api.promotions.getPromoCodes) || [];
  const createPromo = useStaffMutation(api.promotions.createPromoCode);
  const updatePromo = useStaffMutation(api.promotions.updatePromoCode);
  const setPromoActive = useStaffMutation(api.promotions.setPromoActive);
  const deletePromo = useStaffMutation(api.promotions.deletePromoCode);
  const sendBroadcast = useStaffAction(api.email.sendPromoBroadcast);
  const [formData, setFormData] = useState({ code: '', discountPercentage: 10, isActive: true });
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PromoForm>(emptyForm);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromo({ code: formData.code.toUpperCase(), discountType: 'percentage', discountValue: Number(formData.discountPercentage), isActive: formData.isActive });
      toast.success('Promo code created successfully');
      setFormData({ code: '', discountPercentage: 10, isActive: true });
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to create promo code'); }
  };

  const startEdit = (promo: Doc<'promotions'>) => {
    setEditing(String(promo._id));
    setEditForm({ discountValue: promo.discountValue, validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().slice(0, 16) : '', maxRedemptions: promo.maxRedemptions?.toString() || '', minOrderAmount: promo.minOrderAmount?.toString() || '', isActive: promo.isActive });
  };

  const saveEdit = async (promo: Doc<'promotions'>) => {
    try { await updatePromo({ id: promo._id, ...toArgs(editForm) }); setEditing(null); toast.success('Promo code updated'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to update promo code'); }
  };

  const handleDelete = async (promo: Doc<'promotions'>) => {
    if (!window.confirm(`Delete ${promo.code}? This permanently removes the code; redeemed codes must be deactivated instead.`)) return;
    try { await deletePromo({ id: promo._id }); toast.success('Promo code deleted'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to delete promo code'); }
  };

  const handleBroadcast = async (promoCode: string, discountValue: number) => {
    if (!window.confirm(`Email all eligible subscribers about ${promoCode}?`)) return;
    setIsBroadcasting(true);
    try { toast.success(await sendBroadcast({ promoCode, discountValue })); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to send broadcast'); }
    finally { setIsBroadcasting(false); }
  };

  return <div className="p-8 font-sans text-on-surface h-full flex flex-col overflow-y-auto">
    <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4"><div><h2 className="font-serif text-3xl text-primary mb-1">Promotions</h2><p className="text-sm text-on-surface/70">Manage seasonal discounts and VIP codes.</p></div></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2"><table className="w-full text-left border-collapse bg-surface-container border border-outline-variant/30"><thead><tr className="bg-brand-bone border-b border-outline-variant/30"><th className="p-4 text-[10px] uppercase">Code</th><th className="p-4 text-[10px] uppercase">Discount</th><th className="p-4 text-[10px] uppercase">Redemptions</th><th className="p-4 text-[10px] uppercase">Status</th><th className="p-4" /></tr></thead><tbody>{promos.length === 0 && <tr><td colSpan={5} className="p-8 text-center italic">No promo codes active.</td></tr>}{promos.map((promo: Doc<'promotions'>) => <React.Fragment key={promo._id}><tr className="border-b border-primary/5"><td className="p-4 text-sm font-mono text-primary">{promo.code}</td><td className="p-4 text-sm">{promo.discountType === 'percentage' ? `${promo.discountValue}%` : `GH₵${promo.discountValue}`}</td><td className="p-4 text-sm">{promo.redemptions || 0}{promo.maxRedemptions ? ` / ${promo.maxRedemptions}` : ' / ∞'}</td><td className="p-4"><span className={`text-[10px] uppercase px-2 py-1 ${promo.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-100 text-red-800'}`}>{promo.isActive ? 'Active' : 'Inactive'}</span></td><td className="p-4"><div className="flex gap-2 justify-end"><button onClick={() => startEdit(promo)} className="text-xs underline">Edit</button><button onClick={() => setPromoActive({ id: promo._id, isActive: !promo.isActive }).catch(e => toast.error(e instanceof Error ? e.message : 'Failed to toggle'))} className="text-xs underline">{promo.isActive ? 'Deactivate' : 'Activate'}</button><button onClick={() => handleDelete(promo)} className="text-xs text-error underline">Delete</button>{promo.isActive && <button disabled={isBroadcasting} onClick={() => handleBroadcast(promo.code, promo.discountValue)} className="text-xs underline">Broadcast</button>}</div></td></tr>{editing === String(promo._id) && <tr><td colSpan={5} className="p-4 bg-brand-bone"><div className="grid grid-cols-2 gap-3"><label>Discount<input type="number" min="0.01" value={editForm.discountValue} onChange={e => setEditForm({ ...editForm, discountValue: Number(e.target.value) })} className="w-full p-2 border" /></label><label>Valid until<input type="datetime-local" value={editForm.validUntil} onChange={e => setEditForm({ ...editForm, validUntil: e.target.value })} className="w-full p-2 border" /></label><label>Max redemptions<input type="number" min="1" value={editForm.maxRedemptions} onChange={e => setEditForm({ ...editForm, maxRedemptions: e.target.value })} className="w-full p-2 border" /></label><label>Minimum order<input type="number" min="0" value={editForm.minOrderAmount} onChange={e => setEditForm({ ...editForm, minOrderAmount: e.target.value })} className="w-full p-2 border" /></label></div><label className="block mt-3"><input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })} /> Active</label><div className="mt-3 flex gap-3"><button onClick={() => saveEdit(promo)} className="bg-primary text-white px-3 py-2 text-xs">Save</button><button onClick={() => setEditing(null)} className="text-xs underline">Cancel</button></div></td></tr>}</React.Fragment>)}</tbody></table></div>
      <div><div className="bg-surface-container border border-outline-variant/30 p-6"><h3 className="font-serif text-xl text-primary mb-6">Create New Code</h3><form onSubmit={handleSubmit} className="flex flex-col gap-4"><label>Promo Code<input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full p-3 border uppercase font-mono" /></label><label>Discount %<input type="number" min="1" max="100" required value={formData.discountPercentage} onChange={e => setFormData({ ...formData, discountPercentage: Number(e.target.value) })} className="w-full p-3 border" /></label><label><input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} /> Active immediately</label><button type="submit" className="w-full bg-primary text-white py-3 text-xs uppercase">Generate Code</button></form></div></div>
    </div>
  </div>;
}

