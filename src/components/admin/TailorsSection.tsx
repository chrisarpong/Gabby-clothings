import React from 'react';
import { api } from '../../../convex/_generated/api';
import { Scissors } from 'lucide-react';
import { useStaffQuery } from "../../hooks/useStaffAuth";

export default function TailorsSection() {
  const tailors = useStaffQuery(api.tailors.getAll);

  if (tailors === undefined) {
    return <div className="p-8 text-on-surface-variant text-xs uppercase tracking-widest animate-pulse">Loading tailors...</div>;
  }
  if (tailors.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-surface-variant rounded-none p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/[0.04] transition-colors duration-700" />
        
        <div className="relative z-10">
          <h2 className="font-serif text-2xl text-primary mb-2 flex items-center gap-3">
            <Scissors className="w-5 h-5 text-on-surface-variant" />
            Legacy tailors (deprecated)
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">These legacy records are kept for older data. Create and manage designer staff accounts under Team &amp; Roles, then assign designers from appointments or orders.</p>

          <div className="mt-8 border border-surface-variant bg-surface-container-lowest">
            {(
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
