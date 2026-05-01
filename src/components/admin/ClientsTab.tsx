import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search } from 'lucide-react';
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
  SheetTitle,
} from '../ui/sheet';

export const ClientsTab = ({ clients }: { clients: any[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const measurementProfiles = useQuery(
    api.users.getMeasurementProfilesAdmin, 
    selectedClient ? { userId: selectedClient.clerkId } : "skip"
  );
  
  const allOrders = useQuery(api.orders.getOrders);
  const clientOrders = allOrders?.filter(o => o.userId === selectedClient?.clerkId) || [];
  
  const filteredClients = clients?.filter(client => 
    client.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Clients
          </h2>
          <p className="text-sm text-[#3a1f1d]/60 mt-1">Manage your customer base and view profiles</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7D7B] w-4 h-4" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-[#3a1f1d]/15 pl-10 pr-4 py-2 text-sm rounded-lg focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] w-64 placeholder:text-[#3a1f1d]/40 outline-none" 
            placeholder="Search clients..." 
            type="text"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Client</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Email</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Orders</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients === undefined ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-[#3a1f1d]/40">Loading clients...</TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-[#3a1f1d]/40">No clients found.</TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => {
                const clientTotalOrders = allOrders?.filter(o => o.userId === client.clerkId).length || 0;
                return (
                  <TableRow key={client._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#3a1f1d]/5 flex items-center justify-center border border-[#3a1f1d]/10">
                          <span className="text-sm font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {client.firstName?.[0]}{client.lastName?.[0]}
                          </span>
                        </div>
                        <span className="font-medium text-[#2C1816]">
                          {client.firstName} {client.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#3a1f1d]/70">
                      {client.email}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right text-sm text-[#3a1f1d]/70">
                      {clientTotalOrders}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedClient(client)}
                        className="text-sm font-medium text-[#3a1f1d] hover:text-[#2C1816] transition-colors"
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

      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="w-full md:w-[500px] sm:max-w-[500px] p-0 bg-[#FDFBF9]">
          {selectedClient && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-[#3a1f1d]/10">
                <div className="flex items-center justify-between mb-4">
                  <SheetTitle className="text-lg font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Client Profile
                  </SheetTitle>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#3a1f1d]/5 flex items-center justify-center border border-[#3a1f1d]/10">
                    <span className="text-xl font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {selectedClient.firstName?.[0]}{selectedClient.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-sm text-[#3a1f1d]/60">{selectedClient.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h4 className="text-sm font-semibold text-[#2C1816] mb-4">Measurement Profile</h4>
                  {measurementProfiles === undefined ? (
                    <p className="text-sm text-[#3a1f1d]/40">Loading...</p>
                  ) : measurementProfiles.length > 0 || selectedClient.savedMeasurements ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedClient.savedMeasurements || measurementProfiles[0] || {}).map(([key, val]) => {
                        if (['userId', 'profileName', '_id', '_creationTime', 'fullBodyImageId', 'inspoImageId'].includes(key)) return null;
                        if (val === undefined || val === null) return null;
                        return (
                          <div key={key} className="p-3 rounded-lg bg-white border border-[#3a1f1d]/8">
                            <span className="text-xs text-[#3a1f1d]/50">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <p className="text-sm font-medium text-[#2C1816] mt-1">{val as string}"</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[#3a1f1d]/40 italic">No measurements recorded.</p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#2C1816] mb-4">Order History</h4>
                  {clientOrders.length > 0 ? (
                    <div className="space-y-3">
                      {clientOrders.map(order => (
                        <div key={order._id} className="p-4 rounded-lg bg-white border border-[#3a1f1d]/8">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-[#2C1816]">{order.items.map((i: any) => i.name).join(', ')}</p>
                              <p className="text-xs text-[#3a1f1d]/50 mt-1">{order.status} • {order.items.length} item(s)</p>
                            </div>
                            <span className="text-xs text-[#3a1f1d]/50">
                              {new Date(order._creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#3a1f1d]/40 italic">No orders yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
