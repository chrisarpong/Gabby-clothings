import React, { useState } from 'react';
import { Search, ChevronDown, MoreHorizontal, X, Box, User, CreditCard } from 'lucide-react';
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

export default function AdminOrders() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = useQuery(api.orders.getAll) || [];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-surface-variant text-primary';
      case 'Processing':
        return 'bg-[#F2E8D5] text-[#8C6D31] dark:bg-[#4A3A18] dark:text-[#E8D4A2]'; // Gold/Yellow muted
      case 'Shipped':
        return 'bg-[#E3F2E3] text-[#2C6E2C] dark:bg-[#1B361B] dark:text-[#A0CBA0]'; // Green muted
      case 'Cancelled':
        return 'bg-[#F2E3E3] text-[#822C2C] dark:bg-[#421A1A] dark:text-[#CBA0A0]'; // Red muted
      default:
        return 'bg-surface-container text-primary';
    }
  };

  return (
    <div className="p-10 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 shrink-0">
        <div>
          <h1 className="font-serif text-3xl text-primary">Orders</h1>
          <p className="font-label text-xs tracking-widest uppercase text-outline mt-2">Fulfillment & Tracking</p>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input 
            type="text" 
            placeholder="Search orders by ID or Client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-outline-variant/30 pl-10 pr-4 py-2 font-sans text-sm focus:outline-none focus:border-primary placeholder:text-outline transition-colors"
          />
        </div>
        <div className="flex gap-4 font-label text-[10px] tracking-widest uppercase">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border border-outline-variant/30 px-4 py-2 text-primary focus:outline-none focus:border-primary shrink-0"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto border border-outline-variant/30 bg-surface relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-surface shadow-[0_1px_0_theme(colors.outline-variant/30)] z-10">
            <tr>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30 w-32">Order ID</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Client Name</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Date</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Total</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30">Status</th>
              <th className="font-label text-[10px] tracking-[0.15em] text-outline uppercase font-normal p-4 border-b border-outline-variant/30 text-right w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr 
                key={order._id} 
                className="group hover:bg-surface-container/20 transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-primary font-medium line-clamp-1">{order._id}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-primary line-clamp-1">{order.userId}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-outline">{new Date(order._creationTime).toLocaleDateString()}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <span className="font-sans text-sm text-primary">${order.totalAmount}</span>
                </td>
                <td className="p-4 border-b border-outline-variant/10">
                  <div className="relative inline-block text-left">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === order._id ? null : order._id);
                      }}
                      className={`flex items-center gap-2 px-3 py-1 font-label text-[10px] tracking-widest uppercase rounded-sm transition-colors ${getStatusStyle(order.status)} hover:opacity-80`}
                    >
                      {order.status}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {/* Status Dropdown Mockup */}
                    {activeDropdown === order._id && (
                      <div className="absolute top-full left-0 mt-1 w-36 bg-surface border border-outline-variant/30 shadow-lg z-20">
                        {['Pending', 'Processing', 'Shipped', 'Cancelled'].map((statusOption) => (
                          <div 
                            key={statusOption}
                            className="px-4 py-2 font-label text-[10px] tracking-widest uppercase text-primary hover:bg-surface-container cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(null);
                            }}
                          >
                            {statusOption}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4 border-b border-outline-variant/10 text-right">
                  <button className="text-outline hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-outline font-sans text-sm">
                  No orders found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Click outside to close dropdown area */}
        {activeDropdown && (
          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
        )}
      </div>

      {/* Slide-out Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedOrder(null)} />
      )}

      {/* Slide-out Panel (Order Details) */}
      <div 
        className={`fixed top-0 right-0 h-full w-[500px] max-w-full bg-surface border-l border-outline-variant/30 z-50 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          selectedOrder ? 'translate-x-0' : 'translate-x-[100%]'
        }`}
      >
        {selectedOrder && (
          <>
            <div className="flex justify-between items-start p-8 border-b border-outline-variant/30 shrink-0 bg-surface-container/10">
              <div>
                <h2 className="font-serif text-2xl text-primary line-clamp-1">{selectedOrder._id}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 font-label text-[9px] tracking-widest uppercase rounded-sm ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <span className="font-label text-[10px] tracking-widest uppercase text-outline">{new Date(selectedOrder._creationTime).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-outline hover:text-primary transition-colors">
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container/20 p-4 border border-outline-variant/30 flex flex-col gap-2">
                  <span className="font-label text-[9px] tracking-widest uppercase text-outline flex items-center gap-2">
                    <User className="w-3 h-3" /> Client ID
                  </span>
                  <span className="font-sans text-sm text-primary line-clamp-1">{selectedOrder.userId}</span>
                  <span className="font-sans text-xs text-primary underline underline-offset-2 cursor-pointer mt-1 opacity-80 hover:opacity-100">View Profile</span>
                </div>
                <div className="bg-surface-container/20 p-4 border border-outline-variant/30 flex flex-col gap-2">
                  <span className="font-label text-[9px] tracking-widest uppercase text-outline flex items-center gap-2">
                    <CreditCard className="w-3 h-3" /> Total Value
                  </span>
                  <span className="font-serif text-lg text-primary">${selectedOrder.totalAmount}</span>
                  <span className="font-sans text-xs text-outline mt-1">Paid via Paystack</span>
                </div>
              </div>

              <div>
                <h3 className="font-label text-[10px] tracking-widest uppercase text-outline border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                  <Box className="w-3 h-3" /> Order Items
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-surface-container shrink-0 border border-outline-variant/30"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-sans text-sm text-primary font-medium">Bespoke Navy Wool Suit</span>
                        <span className="font-sans text-sm text-primary">$1,250</span>
                      </div>
                      <p className="font-sans text-xs text-outline mt-1 line-clamp-1">Custom tailoring applied.</p>
                      <span className="inline-block mt-2 font-label text-[9px] tracking-widest uppercase text-primary bg-surface-container/30 px-2 py-0.5 border border-outline-variant/30">Qty: 1</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-outline-variant/30 shrink-0 bg-surface flex gap-4">
              <button className="flex-1 bg-surface border border-outline-variant text-primary py-3 font-label text-[10px] tracking-[0.2em] uppercase hover:bg-surface-variant transition-colors">
                Print Invoice
              </button>
              <button 
                onClick={() => toast.success("Order status updated successfully.")}
                className="flex-1 bg-primary text-on-primary py-3 font-label text-[10px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity"
              >
                Update Status
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
