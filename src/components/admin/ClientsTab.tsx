import React, { useState } from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { X } from 'lucide-react';

export default function ClientsTab() {
  const clients = useQuery(api.users.getAll);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  if (clients === undefined) return <div className="p-8 font-sans">Loading clients...</div>;

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-end mb-8 border-b border-brand-charcoal/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-brand-espresso mb-1">Clients</h2>
          <p className="text-sm text-brand-charcoal/70">Manage user profiles and saved measurements.</p>
        </div>
      </div>
      
      <div className="bg-white border border-brand-espresso/10 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-bone border-b border-brand-espresso/10">
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Name</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Email</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Joined</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
               <tr>
                <td colSpan={4} className="p-8 text-center text-brand-charcoal/50 italic text-sm">No clients found.</td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client._id} className="border-b border-brand-espresso/5 hover:bg-brand-bone/50 transition-colors">
                <td className="p-4 text-sm text-brand-espresso font-medium">{client.firstName || "N/A"} {client.lastName || ""}</td>
                <td className="p-4 text-sm text-brand-charcoal">{client.email}</td>
                <td className="p-4 text-sm text-brand-charcoal">{new Date(client._creationTime).toLocaleDateString()}</td>
                <td className="p-4">
                  <button 
                    onClick={() => setSelectedClient(client)}
                    className="text-xs font-sans tracking-widest uppercase border-b border-brand-espresso text-brand-espresso hover:text-brand-charcoal pb-1"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slide-out Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-brand-espresso/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${selectedClient ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedClient && (
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-brand-espresso/10 flex justify-between items-center bg-brand-bone">
              <h3 className="font-serif text-2xl text-brand-espresso">Client Profile</h3>
              <button onClick={() => setSelectedClient(null)} className="text-brand-charcoal/50 hover:text-brand-espresso">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Contact Info</p>
                <p className="text-lg text-brand-espresso mb-1">{selectedClient.firstName || "Unknown"} {selectedClient.lastName || ""}</p>
                <p className="text-sm text-brand-charcoal mb-4">{selectedClient.email}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-4 border-b border-brand-espresso/10 pb-2">Saved Measurements</p>
                {selectedClient.savedMeasurements ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedClient.savedMeasurements).map(([key, val]) => (
                      <div key={key} className="bg-brand-bone shadow-sm border border-brand-espresso/5 p-3">
                        <span className="text-[9px] uppercase tracking-widest text-brand-charcoal/50 block mb-1">{key}</span>
                        <span className="text-sm text-brand-espresso font-medium">{val ? `${val}"` : 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-brand-charcoal/50 italic">No measurements saved for this client.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for panel */}
      {selectedClient && (
        <div 
          className="fixed inset-0 bg-brand-espresso/20 backdrop-blur-sm z-40"
          onClick={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}
