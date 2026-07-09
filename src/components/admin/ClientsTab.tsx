import React, { useState, useMemo } from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { Search, ChevronRight, X, User, Ruler, Mail, Calendar, Phone, MessageCircle, Globe, ShoppingBag, CreditCard, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientsTab() {
  const clients = useQuery(api.users.getAll) || [];
  const allOrders = useQuery(api.orders.getAll) || [];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Doc<"users"> | null>(null);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'measurements' | 'orders'>('overview');

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

  // Compute LTV and Order Count for a specific user
  const getClientStats = (clerkId: string) => {
    const userOrders = allOrders.filter((o: any) => o.userId === clerkId && o.status !== 'cancelled' && o.paymentStatus === 'paid');
    const orderCount = userOrders.length;
    const ltv = userOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    return { orderCount, ltv, orders: userOrders };
  };

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
          <p className="text-sm text-on-surface-variant font-medium">Manage user profiles, measurements, and order history.</p>
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-variant/20 border-b border-outline-variant/30">
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Client Name</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Contact Email</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Total Orders</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Member Since</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-on-surface-variant text-sm italic">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No clients match your search.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client: Doc<"users">) => {
                  const stats = getClientStats(client.clerkId);
                  return (
                    <tr 
                      key={client._id} 
                      onClick={() => {
                        setSelectedClient(client);
                        setDrawerTab('overview');
                      }}
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
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/5 text-primary text-xs font-bold">
                          {stats.orderCount}
                        </span>
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
                  )
                })
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
              className="fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-outline-variant/30 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest sticky top-0 z-20 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-surface-variant/50 flex items-center justify-center text-primary font-bold text-xl">
                      {(selectedClient.firstName?.[0] || '')}{(selectedClient.lastName?.[0] || '')}
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-primary tracking-tight mb-1">{selectedClient.firstName || "Unknown"} {selectedClient.lastName || ""}</h3>
                      <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Joined {new Date(selectedClient._creationTime).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface-variant -mt-2 -mr-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2 border-b border-outline-variant/30">
                  <button 
                    onClick={() => setDrawerTab('overview')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors ${drawerTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setDrawerTab('measurements')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors ${drawerTab === 'measurements' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Measurements
                  </button>
                  <button 
                    onClick={() => setDrawerTab('orders')}
                    className={`pb-2 px-2 text-sm font-semibold transition-colors ${drawerTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
                  >
                    Orders
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                
                {/* OVERVIEW TAB */}
                {drawerTab === 'overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <ShoppingBag className="w-5 h-5 text-primary/50 mb-2" />
                        <span className="text-2xl font-serif text-primary">{getClientStats(selectedClient.clerkId).orderCount}</span>
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Total Orders</span>
                      </div>
                      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <CreditCard className="w-5 h-5 text-primary/50 mb-2" />
                        <span className="text-2xl font-serif text-primary">${(getClientStats(selectedClient.clerkId).ltv).toFixed(2)}</span>
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Lifetime Value</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 border-b border-outline-variant/20 pb-2">Contact Details</h4>
                      
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-primary/70" />
                          <span className="text-sm text-primary font-medium">{selectedClient.email}</span>
                        </div>
                        <a href={`mailto:${selectedClient.email}`} className="p-2 rounded-full bg-surface-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-variant/50">
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>
                      
                      {selectedClient.phone && (
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-primary/70" />
                            <span className="text-sm text-primary font-medium">{selectedClient.phone}</span>
                          </div>
                          <a href={`tel:${selectedClient.phone}`} className="p-2 rounded-full bg-surface-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-variant/50">
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                      
                      {selectedClient.whatsapp && (
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="w-4 h-4 text-green-600/70 dark:text-green-400/70" />
                            <span className="text-sm text-primary font-medium">{selectedClient.whatsapp}</span>
                          </div>
                          <a href={`https://wa.me/${selectedClient.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-surface-variant/20 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-variant/50">
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {selectedClient.country && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-primary/70" />
                          <span className="text-sm text-primary font-medium">{selectedClient.country}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* MEASUREMENTS TAB */}
                {drawerTab === 'measurements' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
                        <p className="text-sm text-on-surface-variant italic">No custom-fit measurements saved for this client.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ORDERS TAB */}
                {drawerTab === 'orders' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {(() => {
                      const { orders } = getClientStats(selectedClient.clerkId);
                      if (orders.length === 0) {
                        return (
                          <div className="bg-surface-variant/10 border border-dashed border-outline-variant/50 rounded-xl p-8 text-center flex flex-col items-center">
                            <ShoppingBag className="w-8 h-8 text-on-surface-variant opacity-20 mb-3" />
                            <p className="text-sm text-on-surface-variant italic">No order history found for this client.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {orders.map((order: any) => (
                            <div key={order._id} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-xs font-bold text-primary tracking-widest">{order.orderId || "N/A"}</span>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                                    {new Date(order._creationTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center">
                                <span className="text-xs text-on-surface-variant">{order.items?.length || 0} items</span>
                                <span className="text-sm font-bold text-primary">${(order.totalAmount || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
                
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
