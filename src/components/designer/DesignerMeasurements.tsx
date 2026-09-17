import React from 'react';
import { Ruler, Search } from 'lucide-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';

export default function DesignerMeasurements() {
  const users = useQuery(api.users.getAll) || [];
  
  // Get all users who have savedMeasurements
  const measuredClients = users.filter(u => u.savedMeasurements && Object.keys(u.savedMeasurements).length > 0);

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif text-2xl text-primary mb-1">Measurement DB</h2>
          <p className="text-sm text-on-surface-variant">Quick lookup for client measurements.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-surface border border-surface-variant flex-1 p-6">
        {measuredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Ruler className="w-12 h-12 text-outline mb-4" />
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">No Client Measurements</h3>
            <p className="text-on-surface-variant text-sm">No clients currently have measurements saved to their profiles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {measuredClients.map(client => (
              <div key={client._id} className="border border-outline-variant/30 p-4 hover:border-primary transition-colors">
                <h3 className="font-bold text-primary mb-1">{client.firstName} {client.lastName}</h3>
                <p className="text-xs text-on-surface-variant mb-4">{client.email}</p>
                
                <div className="space-y-2">
                  {Object.entries(client.savedMeasurements!).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm border-b border-outline-variant/20 pb-1 last:border-0 last:pb-0">
                      <span className="capitalize text-on-surface-variant">{key}</span>
                      <span className="font-mono text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
