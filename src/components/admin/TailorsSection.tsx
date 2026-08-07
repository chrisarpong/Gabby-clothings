import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Plus, Trash2, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { getDeviceInfo } from '../../utils/deviceInfo';

export default function TailorsSection() {
  const tailors = useQuery(api.tailors.getAll);
  const addTailor = useMutation(api.tailors.addTailor);
  const removeTailor = useMutation(api.tailors.removeTailor);
  const logAction = useMutation(api.adminLogs.logAction);

  const [newTailor, setNewTailor] = useState({ name: '', phone: '', specialty: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newTailor.name.trim()) {
      toast.error("Tailor name is required");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const id = await addTailor({
        name: newTailor.name,
        phone: newTailor.phone || undefined,
        specialty: newTailor.specialty || undefined,
      });
      getDeviceInfo().then(info => logAction({
        action: `Added tailor: ${newTailor.name}`,
        category: "team",
        targetId: id,
        targetType: "tailor",
        ...info
      }).catch(console.error));
      toast.success("Tailor added successfully");
      setNewTailor({ name: '', phone: '', specialty: '' });
    } catch (error: any) {
      toast.error(error.message || "Failed to add tailor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: any) => {
    if (confirm("Are you sure you want to remove this tailor?")) {
      try {
        await removeTailor({ id });
        getDeviceInfo().then(info => logAction({
          action: `Removed tailor`,
          category: "team",
          targetId: id,
          targetType: "tailor",
          ...info
        }).catch(console.error));
        toast.success("Tailor removed");
      } catch (error: any) {
        toast.error("Failed to remove tailor");
      }
    }
  };

  if (tailors === undefined) {
    return <div className="p-8 text-on-surface-variant text-xs uppercase tracking-widest animate-pulse">Loading tailors...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-surface-variant rounded-none p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/[0.04] transition-colors duration-700" />
        
        <div className="relative z-10">
          <h2 className="font-serif text-2xl text-primary mb-2 flex items-center gap-3">
            <Scissors className="w-5 h-5 text-on-surface-variant" />
            Manage Tailors
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">Add and manage tailors to assign them to appointments and orders.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Name *</label>
              <input 
                type="text" 
                value={newTailor.name} 
                onChange={(e) => setNewTailor({...newTailor, name: e.target.value})}
                className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                placeholder="E.g., Kofi Mensah"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Phone</label>
              <input 
                type="text" 
                value={newTailor.phone} 
                onChange={(e) => setNewTailor({...newTailor, phone: e.target.value})}
                className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2">Specialty</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newTailor.specialty} 
                  onChange={(e) => setNewTailor({...newTailor, specialty: e.target.value})}
                  className="w-full bg-surface-container-lowest border border-surface-variant px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-primary"
                  placeholder="E.g., Suits, Alterations"
                />
                <button 
                  onClick={handleAdd}
                  disabled={isSubmitting}
                  className="bg-primary text-surface px-4 py-3 hover:bg-tertiary transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border border-surface-variant bg-surface-container-lowest">
            {tailors.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">
                No tailors added yet. Add your first tailor above.
              </div>
            ) : (
              <ul className="divide-y divide-surface-variant">
                {tailors.map(tailor => (
                  <li key={tailor._id} className="p-4 flex items-center justify-between hover:bg-surface transition-colors">
                    <div>
                      <h4 className="text-primary font-medium">{tailor.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {tailor.specialty && <span>{tailor.specialty} • </span>}
                        {tailor.phone || 'No phone'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRemove(tailor._id)}
                      className="text-error hover:bg-error/10 p-2 transition-colors"
                      title="Remove Tailor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
