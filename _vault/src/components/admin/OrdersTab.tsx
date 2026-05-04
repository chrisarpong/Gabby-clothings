import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Download, ChevronDown } from 'lucide-react';
import { SlideOut } from './SlideOut';

interface OrdersTabProps {
  orders: any[];
  updateOrderStatus: (args: { id: any, status: string }) => Promise<any>;
}

export function OrdersTab({ orders, updateOrderStatus }: OrdersTabProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [clientName, setClientName] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('latest');
  
  // Dossier State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filteredOrders = useMemo(() => {
    let result = orders || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o._id.toLowerCase().includes(q) || 
        `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`.toLowerCase().includes(q)
      );
    }

    if (clientName) {
      const q = clientName.toLowerCase();
      result = result.filter(o => `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`.toLowerCase().includes(q));
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status.toUpperCase() === statusFilter);
    }

    if (dateFrom) {
      result = result.filter(o => new Date(o._creationTime) >= new Date(dateFrom));
    }

    if (dateTo) {
      result = result.filter(o => new Date(o._creationTime) <= new Date(dateTo));
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'latest') {
        return b._creationTime - a._creationTime;
      }
      if (sortBy === 'highest') {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

    return result;
  }, [orders, searchQuery, clientName, statusFilter, dateFrom, dateTo, sortBy]);

  const handleStatusUpdate = async (id: any, newStatus: string) => {
    try {
      await updateOrderStatus({ id, status: newStatus });
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl w-full"
      >
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
            <div>
              <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">Fulfillment Manifest</h2>
              <h1 className="font-serif text-3xl md:text-4xl">Client Orders</h1>
            </div>
            
            <div className="flex space-x-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center space-x-2 border border-espresso/20 px-4 py-2 hover:bg-espresso hover:text-white transition-colors shadow-none rounded-none ${isFilterOpen ? 'bg-espresso text-white' : ''}`}
              >
                <Filter strokeWidth={1} className="w-3 h-3" />
                <span className="font-sans text-[10px] uppercase tracking-[0.2em]">{isFilterOpen ? 'Close Filters' : 'Filter'}</span>
              </button>
              <button className="flex items-center space-x-2 border border-espresso/20 px-4 py-2 hover:bg-espresso hover:text-white transition-colors shadow-none rounded-none">
                <Download strokeWidth={1} className="w-3 h-3" />
                <span className="font-sans text-[10px] uppercase tracking-[0.2em]">Export Ledger</span>
              </button>
            </div>
          </div>
        </header>

        {/* Utilities */}
        <div className="mb-8 flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div className="relative w-full md:w-96">
              <Search strokeWidth={1} className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY MANIFEST ID OR CLIENT..." 
                className="w-full bg-transparent border-0 border-b border-espresso/20 py-2 pl-6 pr-4 font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none focus:border-espresso transition-colors placeholder:text-espresso/30 outline-none uppercase text-espresso"
              />
            </div>
            
            <div className="flex items-center justify-between w-full md:w-auto space-x-6 text-[10px] font-sans tracking-[0.2em] uppercase text-espresso/60">
              <span>Sort By:</span>
              <div className="relative flex-1 md:flex-none">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-transparent border-b border-espresso/20 pb-1 rounded-none outline-none focus:border-espresso text-espresso cursor-pointer appearance-none pr-6"
                >
                  <option value="latest">Latest Entry</option>
                  <option value="highest">Highest Value</option>
                  <option value="status">Status Action</option>
                </select>
                <ChevronDown strokeWidth={1} className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-espresso/60 pointer-events-none" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden relative z-0"
              >
                <div className="p-6 md:p-8 border border-espresso/10 bg-white flex flex-col md:flex-row md:items-end gap-8 md:gap-12 shadow-none rounded-none">
                  
                  <div className="flex-1 w-full relative">
                    <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Client Name</label>
                    <div className="relative">
                      <Search strokeWidth={1} className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-espresso/40" />
                      <input 
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="ENTER NAME..." 
                        className="w-full bg-transparent border-b border-espresso/20 py-2 pl-6 pr-4 font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none outline-none focus:border-espresso transition-colors placeholder:text-espresso/30 uppercase"
                      />
                    </div>
                  </div>

                  <div className="flex-1 w-full relative">
                    <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Order Status</label>
                    <div className="relative">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-transparent border-b border-espresso/20 py-2 pl-0 pr-8 font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none outline-none focus:border-espresso transition-colors appearance-none cursor-pointer uppercase text-espresso"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      <ChevronDown strokeWidth={1} className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-espresso/60 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex-1 w-full relative">
                    <label className="block font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-3">Date Range</label>
                    <div className="flex flex-col xl:flex-row xl:items-center space-y-4 xl:space-y-0 xl:space-x-4">
                      <input 
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full bg-transparent border-b border-espresso/20 py-2 font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none outline-none focus:border-espresso transition-colors text-espresso uppercase"
                      />
                      <span className="hidden xl:inline text-espresso/40 font-sans text-[10px] uppercase tracking-[0.2em] shrink-0">TO</span>
                      <input 
                        type="date" 
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full bg-transparent border-b border-espresso/20 py-2 font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none outline-none focus:border-espresso transition-colors text-espresso uppercase"
                      />
                    </div>
                  </div>

                  {(clientName || statusFilter !== 'ALL' || dateFrom || dateTo) && (
                    <div className="flex items-center">
                      <button 
                        onClick={() => {
                          setClientName('');
                          setStatusFilter('ALL');
                          setDateFrom('');
                          setDateTo('');
                        }}
                        className="font-sans text-[9px] uppercase tracking-[0.2em] text-espresso/50 hover:text-espresso transition-colors border-b border-espresso/50 hover:border-espresso pb-1 whitespace-nowrap"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Ledger (Table) */}
        <div className="bg-white border border-espresso/10 shadow-none rounded-none overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-espresso/10 bg-bone/30">
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Manifest ID</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Client</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Items</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Value</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order: any) => (
                  <tr 
                    key={order._id} 
                    onClick={() => setSelectedOrder(order)}
                    className="border-b border-espresso/5 hover:bg-bone/20 transition-colors last:border-0 group cursor-pointer"
                  >
                    <td className="py-6 px-6 align-top">
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/70">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                      <div className="font-sans text-[9px] uppercase tracking-[0.1em] text-espresso/40 mt-1">{new Date(order._creationTime).toLocaleDateString()}</div>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <span className="font-serif text-lg text-espresso group-hover:italic transition-all">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>
                    </td>
                    <td className="py-6 px-6 align-top max-w-xs">
                      <div className="font-sans text-sm font-light leading-relaxed">
                        {order.items.map((i: any) => i.name).join(', ')}
                      </div>
                    </td>
                    <td className="py-6 px-6 align-top text-right">
                      <span className="font-serif text-md">₵{order.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                    </td>
                    <td className="py-6 px-6 align-top text-right">
                      <span className={`
                        inline-block font-sans text-[9px] uppercase tracking-[0.2em] px-2 py-1 border rounded-none shadow-none
                        ${order.status.toUpperCase() === 'COMPLETED' ? 'border-emerald-900/20 text-emerald-900 bg-emerald-50' : ''}
                        ${order.status.toUpperCase() === 'PENDING' ? 'border-amber-900/20 text-amber-900 bg-amber-50' : ''}
                        ${order.status.toUpperCase() === 'PROCESSING' ? 'border-blue-900/20 text-blue-900 bg-blue-50' : ''}
                        ${order.status.toUpperCase() === 'SHIPPED' ? 'border-espresso/20 text-espresso bg-espresso/5' : ''}
                        ${order.status.toUpperCase() === 'CANCELLED' ? 'border-red-900/20 text-red-900 bg-red-50' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-espresso/50">
                    <p className="font-serif text-xl italic mb-2">No commissions found.</p>
                    <p className="font-sans text-[10px] tracking-[0.2em] uppercase">Please adjust your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination / Footer */}
        <div className="mt-6 flex justify-between items-center text-[10px] font-sans tracking-[0.2em] uppercase text-espresso/50">
          <span>Showing {filteredOrders.length} records</span>
          <div className="flex space-x-4">
            <button className="hover:text-espresso transition-colors disabled:opacity-30" disabled>Previous Page</button>
            <button className="hover:text-espresso transition-colors disabled:opacity-30" disabled>Next Page</button>
          </div>
        </div>
      </motion.div>

      <SlideOut 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        title="Dossier"
        subtitle={selectedOrder ? `#${selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}` : ''}
      >
        {selectedOrder && (
          <div className="space-y-12">
            <div>
              <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-2">Patron</h3>
              <p className="font-serif text-2xl text-espresso">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
              <p className="font-sans text-xs text-espresso/60 mt-2">{selectedOrder.shippingAddress.email}</p>
              <p className="font-sans text-xs text-espresso/60">{selectedOrder.shippingAddress.phone}</p>
              <p className="font-sans text-xs text-espresso/60 mt-2">
                {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}<br />
                {selectedOrder.shippingAddress.region}, {selectedOrder.shippingAddress.country}
              </p>
            </div>
            
            <div>
              <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Itemized Manifest</h3>
              <ul className="space-y-4">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <li key={idx} className="flex justify-between items-center border-b border-espresso/10 pb-4">
                    <span className="font-sans text-sm text-espresso">{item.name} x{item.quantity}</span>
                    <span className="font-serif text-sm">₵{(item.price * item.quantity).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center pt-6 mt-6">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50">Total Valuation</span>
                <span className="font-serif text-2xl text-espresso">₵{selectedOrder.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
              </div>
            </div>

            <div>
               <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Update Disposition</h3>
               <div className="grid grid-cols-2 gap-4">
                 {['PENDING', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                   <button
                     key={status}
                     onClick={() => handleStatusUpdate(selectedOrder._id, status)}
                     className={`
                       py-3 px-4 font-sans text-[9px] uppercase tracking-[0.2em] border transition-colors
                       ${selectedOrder.status.toUpperCase() === status 
                         ? 'bg-espresso text-white border-espresso' 
                         : 'border-espresso/20 text-espresso/60 hover:border-espresso hover:text-espresso'}
                     `}
                   >
                     {status}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        )}
      </SlideOut>
    </>
  );
}
