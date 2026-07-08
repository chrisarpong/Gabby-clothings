import React, { useState, useMemo } from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { Search, ChevronRight, X, User, Ruler, Mail, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientsTab() {
  const clients = useQuery(api.users.getAll) || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Doc<"users"> | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter((client: Doc<"users">) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (client.firstName || '').toLowerCase().includes(searchLower) ||
        (client.lastName || '').toLowerCase().includes(searchLower) ||
        (client.email || '').toLowerCase().includes(searchLower)
      );
    });
  }, [clients, searchQuery]);

  if (!clients.length && clients !== undefined) return (
    <div className="p-8 h-full bg-surface-container-lowest animate-pulse">
      <div className="h-10 bg-surface-variant/30 rounded w-1/4 mb-8" />
      <div className="h-[500px] bg-surface-variant/30 rounded-xl" />
    </div>
  );

  return (
    <div className="p-6 md:p-10 font-sans text-on-surface h-full flex flex-col bg-surface-container-lowest relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2 tracking-tight">Client Directory</h2>
          <p className="text-sm text-on-surface-variant font-medium">Manage user profiles and saved bespoke measurements.</p>
        </div>
        
        <div className="flex w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full transition-all shadow-sm"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex-1 flex flex-col relative z-10">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-variant/20 border-b border-outline-variant/30">
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Client Name</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Contact Email</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Member Since</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-on-surface-variant text-sm italic">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No clients match your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client: Doc<"users">) => (
                  <tr 
                    key={client._id} 
                    onClick={() => setSelectedClient(client)}
                    className="hover:bg-surface-variant/10 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center text-primary font-bold text-xs">
                          {(client.firstName?.[0] || '')}{(client.lastName?.[0] || '')}
                        </div>
                        <span className="text-sm text-primary font-semibold tracking-wide">
                          {client.firstName || "Unknown"} {client.lastName || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface-variant font-medium">{client.email}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                      {new Date(client._creationTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:bg-surface-variant/30 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer for Client Details */}
      <AnimatePresence>
        {selectedClient && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedClient(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-outline-variant/30 shadow-2xl z-50 overflow-y-auto custom-scrollbar flex flex-col"
            >
              <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest sticky top-0 z-10 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-2xl text-primary tracking-tight mb-1">Client Profile</h3>
                </div>
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface-variant"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex-1 space-y-8">
                
                {/* Contact Information */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <User className="w-4 h-4" /> Personal Details
                  </h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center text-primary font-bold text-lg">
                        {(selectedClient.firstName?.[0] || '')}{(selectedClient.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="text-lg font-serif text-primary tracking-tight">{selectedClient.firstName || "Unknown"} {selectedClient.lastName || ""}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-outline-variant/20 space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-sm text-primary font-medium">{selectedClient.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-on-surface-variant" />
                        <span className="text-sm text-on-surface-variant">Joined {new Date(selectedClient._creationTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Saved Measurements */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <Ruler className="w-4 h-4" /> Saved Measurements
                  </h4>
                  
                  {selectedClient.savedMeasurements ? (
                    <div className="space-y-4">
                      {['top', 'bottom', 'outerwear'].map(category => (
                        selectedClient.savedMeasurements![category] && Object.keys(selectedClient.savedMeasurements![category]).length > 0 && (
                          <div key={category} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-surface-variant/20 border-b border-outline-variant/20 p-3">
                               <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary">{category}</h5>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                              {(Object.entries(selectedClient.savedMeasurements![category]) as [string, string][]).map(([key, val]) => (
                                val && (
                                  <div key={key} className="flex justify-between items-end border-b border-outline-variant/10 pb-1">
                                    <span className="text-[10px] uppercase text-on-surface-variant font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-xs font-bold text-primary">{String(val)}<span className="text-[10px] text-on-surface-variant font-normal ml-0.5">in</span></span>
                                  </div>
                                )
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                      
                      {/* Fallback for legacy flat measurements */}
                      {!selectedClient.savedMeasurements.top && !selectedClient.savedMeasurements.bottom && (
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                           <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">
                            {Object.entries(selectedClient.savedMeasurements).map(([key, val]) => (
                              typeof val !== 'object' && val && (
                                <div key={key} className="flex justify-between items-end border-b border-outline-variant/10 pb-1">
                                  <span className="text-[10px] uppercase text-on-surface-variant font-medium">{key}</span>
                                  <span className="text-xs font-bold text-primary">{String(val)}<span className="text-[10px] text-on-surface-variant font-normal ml-0.5">in</span></span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-surface-variant/10 border border-dashed border-outline-variant/50 rounded-xl p-8 text-center flex flex-col items-center">
                      <Ruler className="w-8 h-8 text-on-surface-variant opacity-20 mb-3" />
                      <p className="text-sm text-on-surface-variant italic">No bespoke measurements saved for this client yet.</p>
                    </div>
                  )}
                </section>
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
