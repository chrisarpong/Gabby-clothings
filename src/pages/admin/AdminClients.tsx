import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Mail, MapPin, Calendar, Scissors, X } from 'lucide-react';

const mockClients = [
  { id: 'CLI-001', name: 'Marcus Sterling', email: 'm.sterling@example.com', totalSpent: '$12,450', lastVisit: 'Oct 15, 2026', status: 'Active', location: 'New York, NY' },
  { id: 'CLI-002', name: 'Elena Rodriguez', email: 'elena.r@example.com', totalSpent: '$4,200', lastVisit: 'Sep 22, 2026', status: 'Active', location: 'Miami, FL' },
  { id: 'CLI-003', name: 'David Chen', email: 'd.chen@example.com', totalSpent: '$8,900', lastVisit: 'Oct 02, 2026', status: 'Inactive', location: 'San Francisco, CA' },
  { id: 'CLI-004', name: 'Amara Okafor', email: 'amara.o@example.com', totalSpent: '$15,750', lastVisit: 'Oct 18, 2026', status: 'VIP', location: 'London, UK' },
  { id: 'CLI-005', name: 'James Wilson', email: 'j.wilson@example.com', totalSpent: '$2,100', lastVisit: 'Aug 10, 2026', status: 'Active', location: 'Chicago, IL' },
];

export default function AdminClients() {
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-10 flex flex-col h-full overflow-hidden max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-primary tracking-tight">Client Directory</h1>
          <p className="font-label text-xs tracking-[0.2em] uppercase text-outline mt-3">Manage Customer Profiles & Measurements</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label text-[11px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input 
            type="text" 
            placeholder="Search clients by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-outline-variant/30 pl-12 pr-4 py-3 font-sans text-sm focus:outline-none focus:border-primary placeholder:text-outline transition-colors"
          />
        </div>
        <div className="flex gap-4 font-label text-[10px] tracking-widest uppercase">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-outline-variant/30 px-5 py-3 text-primary focus:outline-none focus:border-primary shrink-0 appearance-none pr-8 relative cursor-pointer"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>VIP</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto border border-outline-variant/30 bg-surface">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface shadow-[0_1px_0_theme(colors.outline-variant/30)] z-10">
            <tr>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30 w-24">Client ID</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30">Client Name</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30">Contact</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30">Total Spent</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30">Last Visit</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30">Status</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-5 border-b border-outline-variant/30 text-right w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr 
                key={client.id} 
                className="group hover:bg-surface-container/20 transition-colors cursor-pointer"
                onClick={() => setSelectedClient(client)}
              >
                <td className="p-5 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-outline group-hover:text-primary transition-colors">{client.id}</span>
                </td>
                <td className="p-5 border-b border-outline-variant/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-serif text-sm tracking-widest uppercase">
                      {client.name.charAt(0)}
                    </div>
                    <span className="font-sans text-sm text-primary font-medium">{client.name}</span>
                  </div>
                </td>
                <td className="p-5 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-outline">{client.email}</span>
                </td>
                <td className="p-5 border-b border-outline-variant/10">
                  <span className="font-serif text-sm text-primary">{client.totalSpent}</span>
                </td>
                <td className="p-5 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-outline">{client.lastVisit}</span>
                </td>
                <td className="p-5 border-b border-outline-variant/10">
                  <span className={`inline-block px-3 py-1 font-label text-[9px] tracking-widest uppercase rounded-sm ${
                    client.status === 'VIP' ? 'bg-[#F2E8D5] text-[#8C6D31] dark:bg-[#4A3A18] dark:text-[#E8D4A2]' :
                    client.status === 'Active' ? 'bg-surface-container text-primary' :
                    'bg-surface-variant/50 text-outline'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-5 border-b border-outline-variant/10 text-right">
                  <button className="text-outline hover:text-primary transition-colors" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedClient(client);
                  }}>
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-outline font-sans text-sm">
                  No clients found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Overlay */}
      {selectedClient && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setSelectedClient(null)}
        />
      )}

      {/* Slide-out Panel (Client Profile) */}
      <div 
        className={`fixed top-0 right-0 h-full w-[500px] max-w-full bg-surface border-l border-outline-variant/30 z-50 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          selectedClient ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        {selectedClient && (
          <>
            <div className="flex justify-between items-start p-8 border-b border-outline-variant/30 shrink-0 bg-surface-container/10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface border border-outline-variant/50 flex items-center justify-center font-serif text-2xl text-primary">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-primary">{selectedClient.name}</h2>
                  <span className="font-label text-[10px] tracking-widest uppercase text-outline mt-1 inline-block">
                    {selectedClient.id}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedClient(null)}
                className="text-outline hover:text-primary transition-colors p-2 -mr-2 -mt-2"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-label text-[10px] tracking-widest uppercase text-outline border-b border-outline-variant/30 pb-2">Contact Details</h3>
                <div className="space-y-3 font-sans text-sm text-primary">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-outline" /> <span>{selectedClient.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-outline" /> <span>{selectedClient.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-outline" /> <span>Added on Jan 12, 2024</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container/20 p-4 border border-outline-variant/30">
                  <div className="font-label text-[9px] tracking-widest uppercase text-outline mb-2">Lifetime Value</div>
                  <div className="font-serif text-2xl text-primary">{selectedClient.totalSpent}</div>
                </div>
                <div className="bg-surface-container/20 p-4 border border-outline-variant/30">
                  <div className="font-label text-[9px] tracking-widest uppercase text-outline mb-2">Orders</div>
                  <div className="font-serif text-2xl text-primary">14</div>
                </div>
              </div>
              
              {/* Measurements Summary */}
              <div>
                <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2 mb-4">
                  <h3 className="font-label text-[10px] tracking-widest uppercase text-outline flex items-center gap-2">
                    <Scissors className="w-3 h-3" /> Latest Measurements
                  </h3>
                  <button className="font-label text-[9px] tracking-widest uppercase text-primary underline underline-offset-2">Full Profile</button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="flex justify-between items-center bg-surface-container/10 px-3 py-2 border border-outline-variant/20">
                    <span className="font-label text-[9px] tracking-widest uppercase text-outline">Chest</span>
                    <span className="font-serif text-SM text-primary">40.5"</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container/10 px-3 py-2 border border-outline-variant/20">
                    <span className="font-label text-[9px] tracking-widest uppercase text-outline">Waist</span>
                    <span className="font-serif text-SM text-primary">34.0"</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container/10 px-3 py-2 border border-outline-variant/20">
                    <span className="font-label text-[9px] tracking-widest uppercase text-outline">Inseam</span>
                    <span className="font-serif text-SM text-primary">31.5"</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container/10 px-3 py-2 border border-outline-variant/20">
                    <span className="font-label text-[9px] tracking-widest uppercase text-outline">Sleeve</span>
                    <span className="font-serif text-SM text-primary">25.0"</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-outline-variant/30 shrink-0 bg-surface flex gap-4">
              <button className="flex-1 bg-surface border border-outline-variant text-primary py-3 font-label text-[10px] tracking-[0.2em] uppercase hover:bg-surface-variant transition-colors">
                Message Client
              </button>
              <button className="flex-1 bg-primary text-on-primary py-3 font-label text-[10px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity">
                New Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
