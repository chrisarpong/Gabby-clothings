import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { Search, Filter, ChevronRight, X, Package, CreditCard, MapPin, Ruler, CheckCircle2, Clock, XCircle, ChevronDown, Download, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderInvoiceModal from './OrderInvoiceModal';
import AdminCreateOrderDrawer from './AdminCreateOrderDrawer';

const STATUS_COLORS: Record<string, { bg: string, text: string }> = {
  pending: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  fabric_sourced: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  cutting_phase: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  first_fitting_ready: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  final_adjustments: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  ready_for_pickup: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  dispatched: { bg: 'bg-surface-variant/30', text: 'text-primary' },
  completed: { bg: 'bg-primary', text: 'text-white' },
  cancelled: { bg: 'bg-transparent border border-outline-variant/30', text: 'text-on-surface-variant' }
};

const formatStatus = (status: string) => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function OrdersTab() {
  const orders = useQuery(api.orders.getAll) || [];
  const updateStatus = useMutation(api.orders.updateStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Doc<"orders"> | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Doc<"orders">) => {
      const matchesSearch = 
        (order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerDetails?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerDetails?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.customerDetails?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: Id<"orders">, newStatus: string) => {
    try {
      await updateStatus({ orderId, status: newStatus });
      toast.success(`Order status updated to ${formatStatus(newStatus)}`);
      // Update local state for immediate feedback if drawer is open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (!orders) return (
    <div className="p-8 h-full bg-surface-container-lowest animate-pulse">
      <div className="h-10 bg-surface-variant/30 rounded w-1/4 mb-8" />
      <div className="h-[500px] bg-surface-variant/30 rounded-xl" />
    </div>
  );

  return (
    <div className="p-6 md:p-10 font-sans text-on-surface h-full flex flex-col bg-surface-container-lowest relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2 tracking-tight">Order Management</h2>
          <p className="text-sm text-on-surface-variant font-medium">Process commissions, update statuses, and view custom-fit details.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsCreateDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            Tailor's Office
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search ID, email, name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-surface-container border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none w-full sm:w-48 shadow-sm cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="fabric_sourced">Fabric Sourced</option>
              <option value="cutting_phase">Cutting Phase</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="dispatched">Dispatched</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex-1 flex flex-col relative z-10">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-variant/20 border-b border-outline-variant/30">
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Order ID</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Customer</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Date</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Total</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Payment</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Status</th>
                <th className="px-6 py-4 font-sans text-[10px] tracking-widest uppercase text-on-surface-variant font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant text-sm italic">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No commissions match your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: Doc<"orders">) => {
                  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                  const isPaid = order.paymentStatus === 'paid';
                  
                  return (
                  <tr 
                    key={order._id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-surface-variant/10 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-medium text-primary bg-surface-container px-2 py-1 rounded-md">
                        {order.orderId || order._id.substring(0, 10)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-primary font-medium">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</span>
                        <span className="text-xs text-on-surface-variant mt-0.5">{order.customerDetails?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                      {new Date(order._creationTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary tracking-wide">
                      {order.displayCurrency || 'GH₵'} {((order.baseTotalAmount || order.totalAmount) ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                        isPaid ? 'bg-primary text-white' : 'bg-surface-variant/30 text-primary'
                      }`}>
                        {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase cursor-pointer border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${statusColor.bg} ${statusColor.text} border-transparent hover:border-primary/10`}
                        >
                          <option value="pending">Pending</option>
                          <option value="fabric_sourced">Fabric Sourced</option>
                          <option value="cutting_phase">Cutting Phase</option>
                          <option value="first_fitting_ready">First Fitting Ready</option>
                          <option value="final_adjustments">Final Adjustments</option>
                          <option value="ready_for_pickup">Ready for Pickup</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${statusColor.text}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:bg-surface-variant/30 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer for Order Details */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
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
                  <h3 className="font-serif text-2xl text-primary tracking-tight mb-1">Order Details</h3>
                  <span className="font-mono text-xs bg-surface-variant/30 px-2 py-1 rounded text-primary">
                    {selectedOrder.orderId || selectedOrder._id.substring(0, 10)}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-on-surface-variant"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex-1 space-y-8">
                
                {/* Customer & Shipping */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <MapPin className="w-4 h-4" /> Customer & Shipping
                  </h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 space-y-3 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-primary">{selectedOrder.customerDetails?.firstName} {selectedOrder.customerDetails?.lastName}</p>
                      <p className="text-sm text-on-surface-variant">{selectedOrder.customerDetails?.email}</p>
                    </div>
                    {selectedOrder.shippingAddress ? (
                      <div className="pt-3 border-t border-outline-variant/20 mt-3">
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {selectedOrder.shippingAddress.address}<br/>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region}<br/>
                          {selectedOrder.shippingAddress.country || 'Ghana'}<br/>
                          Phone: {selectedOrder.shippingAddress.phone}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm italic text-on-surface-variant pt-3 border-t border-outline-variant/20 mt-3">No shipping address provided.</p>
                    )}
                  </div>
                </section>

                {/* Payment Information */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <CreditCard className="w-4 h-4" /> Payment Details
                  </h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-on-surface-variant">Status</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        selectedOrder.paymentStatus === 'paid' ? 'bg-primary text-white' : 'bg-surface-variant/30 text-primary'
                      }`}>
                        {selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Subtotal</span>
                        <span className="font-medium text-primary">{selectedOrder.displayCurrency || 'GH₵'} {selectedOrder.subtotal?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Shipping</span>
                        <span className="font-medium text-primary">{selectedOrder.displayCurrency || 'GH₵'} {selectedOrder.shippingFee?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</span>
                      </div>
                      {selectedOrder.discountAmount ? (
                        <div className="flex justify-between text-primary font-medium">
                          <span>Discount</span>
                          <span className="font-medium">-{selectedOrder.displayCurrency || 'GH₵'} {selectedOrder.discountAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between pt-2 border-t border-outline-variant/20 mt-2">
                        <span className="font-bold text-primary">Total Paid</span>
                        <span className="font-bold text-primary">{selectedOrder.displayCurrency || 'GH₵'} {((selectedOrder.baseTotalAmount || selectedOrder.totalAmount) ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    {selectedOrder.gatewayUsed && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant uppercase tracking-wider">Gateway</span>
                        <span className="text-xs font-medium text-primary bg-surface-variant/30 px-2 py-1 rounded">{selectedOrder.gatewayUsed}</span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Items & Measurements */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <Package className="w-4 h-4" /> Order Items
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 flex justify-between items-start">
                          <div>
                            <p className="font-medium text-primary mb-1">{item.name || item.productName || 'Unknown Item'}</p>
                            <p className="text-xs text-on-surface-variant font-mono mb-2">Variant: {item.variantSku || 'Standard'}</p>
                            <p className="text-sm font-semibold text-primary">
                              {item.quantity} × {selectedOrder.displayCurrency || 'GH₵'} {(item.priceAtPurchase || item.priceAtTime || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </p>
                          </div>
                        </div>
                        
                        {/* Measurements Section */}
                        {item.measurements && Object.keys(item.measurements).length > 0 && (
                          <div className="bg-surface-variant/10 border-t border-outline-variant/20 p-4">
                            <h5 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-3">
                              <Ruler className="w-3.5 h-3.5" /> custom-fit Measurements
                            </h5>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              {Object.entries(item.measurements).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-end border-b border-outline-variant/10 pb-1">
                                  <span className="text-[10px] uppercase text-on-surface-variant">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                  <span className="text-xs font-bold text-primary">{String(val)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
                
              </div>
              
              {/* Footer Actions */}
              <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest sticky bottom-0 z-10 flex gap-3">
                 <button 
                   onClick={() => setIsInvoiceOpen(true)}
                   className="flex-1 py-3 bg-surface-variant/20 hover:bg-surface-variant/40 text-primary rounded-xl text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                 >
                   <Download className="w-4 h-4" /> Invoice
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      {isInvoiceOpen && selectedOrder && (
        <OrderInvoiceModal 
          order={selectedOrder} 
          onClose={() => setIsInvoiceOpen(false)} 
        />
      )}

      {/* POS / Create Manual Order Drawer */}
      <AdminCreateOrderDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}
