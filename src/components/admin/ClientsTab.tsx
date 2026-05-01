import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, ChevronDown, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

export const ClientsTab = ({ clients }: { clients: any[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Fetch profiles for selected client
  const measurementProfiles = useQuery(
    api.users.getMeasurementProfilesAdmin, 
    selectedClient ? { userId: selectedClient.clerkId } : "skip"
  );
  
  // We can fetch orders for the client to show "history". For now, we'll just show mock history if no specific query exists, or map their actual orders.
  const allOrders = useQuery(api.orders.getOrders);
  const clientOrders = allOrders?.filter(o => o.userId === selectedClient?.clerkId) || [];
  
  const filteredClients = clients?.filter(client => 
    client.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="w-full">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between border-b border-[#3a1f1d]/10 pb-8">
        <div>
          <h2 className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Client Registry & Dossiers
          </h2>
          <p className="text-[15px] opacity-70 mt-2" style={{ fontFamily: "'Jost', sans-serif" }}>
            Manage VIP clients, review measurement profiles, and track commissions.
          </p>
        </div>
        <div className="mt-8 md:mt-0 flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-0 bottom-2 text-[#504443] w-4 h-4" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 border-b border-[#3a1f1d]/10 pl-8 pb-2 text-[16px] focus:ring-0 focus:border-[#3a1f1d] w-64 uppercase tracking-[0.1em] placeholder:text-[#504443]/50 outline-none" 
              placeholder="Search Clients" 
              type="text"
              style={{ fontFamily: "'Jost', sans-serif" }}
            />
          </div>
        </div>
      </header>

      <section>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#3a1f1d]/10 text-[10px] uppercase tracking-[0.05em] text-[#504443]" style={{ fontFamily: "'Jost', sans-serif" }}>
                <TableHead className="py-4 font-normal">Client Name</TableHead>
                <TableHead className="py-4 font-normal">Contact</TableHead>
                <TableHead className="py-4 font-normal text-right">Commissions</TableHead>
                <TableHead className="py-4 font-normal text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[16px] tracking-[0.01em]" style={{ fontFamily: "'Jost', sans-serif" }}>
              {clients === undefined ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-[#3a1f1d]/50 italic">Syncing client registry...</TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-[#3a1f1d]/50 italic">No clients found.</TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => {
                  const clientTotalOrders = allOrders?.filter(o => o.userId === client.clerkId).length || 0;
                  return (
                    <TableRow key={client._id} className="border-b border-[#3a1f1d]/10 hover:bg-[#F9F8F6]/50 transition-colors">
                      <TableCell className="py-6 flex items-center space-x-4">
                        <div className="w-10 h-10 bg-[#e3e2e0] rounded-none overflow-hidden border border-[#3a1f1d]/10 flex items-center justify-center">
                          {client.fullBodyImageId ? (
                             <span className="text-[8px] uppercase tracking-widest text-[#3a1f1d]/50">Image</span>
                          ) : (
                             <span className="text-[14px] uppercase text-[#3a1f1d]/50" style={{ fontFamily: "'Playfair Display', serif" }}>
                               {client.firstName?.[0]}{client.lastName?.[0]}
                             </span>
                          )}
                        </div>
                        <span className="text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {client.firstName} {client.lastName}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 text-[#504443] text-sm">
                        {client.email}
                      </TableCell>
                      <TableCell className="py-6 text-right font-light">
                        {clientTotalOrders}
                      </TableCell>
                      <TableCell className="py-6 text-right">
                        <button 
                          onClick={() => setSelectedClient(client)}
                          className="text-[11px] tracking-[0.15em] font-semibold uppercase text-[#3a1f1d] border-b border-transparent hover:border-[#3a1f1d] pb-1 transition-all"
                        >
                          View Profile
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Side Panel / Dossier Overlap */}
      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-full md:w-[600px] sm:max-w-[600px] overflow-y-auto p-0 border-l border-[#3a1f1d]/10 bg-[#F9F8F6]">
          {selectedClient && (
            <div className="px-12 py-16">
              {/* Dossier Header */}
              <div className="mb-16">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.15em] border border-[#3a1f1d] px-3 py-1 text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Atelier Client
                  </span>
                  <span className="text-[10px] tracking-[0.05em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Joined: {new Date(selectedClient._creationTime).getFullYear()}
                  </span>
                </div>
                <h3 className="text-[48px] font-normal text-[#3a1f1d] leading-none mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {selectedClient.firstName} {selectedClient.lastName}
                </h3>
                <p className="text-[10px] tracking-[0.05em] text-[#504443] uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {selectedClient.email}
                </p>
              </div>

              {/* Measurement Profile Grid */}
              <div className="mb-16">
                <h4 className="text-2xl text-[#3a1f1d] mb-8 border-b border-[#3a1f1d]/10 pb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Measurement Profile
                </h4>
                {measurementProfiles === undefined ? (
                  <p className="text-[13px] opacity-50 italic">Loading profile...</p>
                ) : measurementProfiles.length > 0 || selectedClient.savedMeasurements ? (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {/* Combine main user saved measurements and their profiles, or just show main user saved measurements for simplicity */}
                    {Object.entries(selectedClient.savedMeasurements || measurementProfiles[0] || {}).map(([key, val]) => {
                      if (['userId', 'profileName', '_id', '_creationTime', 'fullBodyImageId', 'inspoImageId'].includes(key)) return null;
                      if (val === undefined || val === null) return null;
                      return (
                        <div key={key} className="border-b border-[#3a1f1d]/10 pb-2 flex justify-between">
                          <span className="text-[10px] tracking-[0.05em] uppercase text-[#504443]" style={{ fontFamily: "'Jost', sans-serif" }}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-[16px] text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                            {val as string}"
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[13px] opacity-50 italic">No measurements recorded for this client.</p>
                )}
              </div>

              {/* Purchase History */}
              <div>
                <h4 className="text-2xl text-[#3a1f1d] mb-8 border-b border-[#3a1f1d]/10 pb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Masterpieces Commissioned
                </h4>
                {clientOrders.length > 0 ? (
                  <ul className="space-y-6">
                    {clientOrders.map(order => (
                      <li key={order._id} className="flex justify-between items-end border-b border-[#3a1f1d]/5 pb-4">
                        <div>
                          <p className="text-lg text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {order.items.map((i: any) => i.name).join(', ')}
                          </p>
                          <p className="text-[10px] tracking-[0.05em] text-[#504443] uppercase mt-1" style={{ fontFamily: "'Jost', sans-serif" }}>
                            {order.status} • {order.items.length} item(s)
                          </p>
                        </div>
                        <span className="text-[14px] text-[#504443]" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {new Date(order._creationTime).getFullYear()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] opacity-50 italic">No commissions found.</p>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
