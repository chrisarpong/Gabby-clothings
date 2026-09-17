import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { Search, Filter, ChevronRight, X, Package, CreditCard, MapPin, Ruler, CheckCircle2, Clock, XCircle, ChevronDown, Download, ShoppingBag, Scissors, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OrderInvoiceModal from './OrderInvoiceModal';
import AdminCreateOrderDrawer from './AdminCreateOrderDrawer';
import { getDeviceInfo } from '../../utils/deviceInfo';

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
  const recordCashPayment = useMutation(api.payments.recordCashPayment);
  const logAction = useMutation(api.adminLogs.logAction);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Doc<"orders"> | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Assignment & Production State
  const staff = useQuery(api.users.listStaffUsers) || [];
  const orderActivity = useQuery(api.orderActivity.getByOrder, selectedOrder ? { orderId: selectedOrder._id } : "skip") || [];
  const assignDesigner = useMutation(api.orders.assignDesigner);
  const updateProductionStatus = useMutation(api.orders.updateProductionStatus);
  const addNote = useMutation(api.orderActivity.addNote);
  const notifyClient = useMutation(api.orders.notifyClient);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [clientMessage, setClientMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleRecordPayment = async () => {
    if (!selectedOrder || !paymentAmount) return;
    setIsRecordingPayment(true);
    try {
      await recordCashPayment({
        orderId: selectedOrder._id,
        amount: Number(paymentAmount),
        paymentMethod,
        notes: paymentNotes
      });
      getDeviceInfo().then(info => logAction({
        action: `Recorded ${paymentMethod} payment of ${paymentAmount} for order ${selectedOrder.orderId}`,
        category: "orders",
        targetId: selectedOrder._id,
        targetType: "order",
        ...info
      }).catch(console.error));
      toast.success("Payment recorded successfully!");
      setPaymentAmount('');
      setPaymentNotes('');
      // Optimistically update local selectedOrder to hide the payment form
      setSelectedOrder({
        ...selectedOrder,
        amountPaid: (selectedOrder.amountPaid || 0) + Number(paymentAmount),
        paymentStatus: ((selectedOrder.amountPaid || 0) + Number(paymentAmount)) >= (selectedOrder.totalAmount || 0) ? 'paid' : 'partial'
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

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
      getDeviceInfo().then(info => logAction({
        action: `Updated order status to ${formatStatus(newStatus)}`,
        category: "orders",
        targetId: orderId,
        targetType: "order",
        ...info
      }).catch(console.error));
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

                  {selectedOrder.paymentStatus !== 'paid' && selectedOrder.status !== 'cancelled' && (
                    <div className="mt-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-xs font-bold uppercase tracking-widest text-primary">Record Manual Payment</h5>
                        {selectedOrder.depositRequired && (
                          <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded">
                            Deposit Required
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Amount</label>
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value ? Number(e.target.value) : '')}
                              placeholder="E.g. 500"
                              className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Method</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                            >
                              <option value="cash">Cash</option>
                              <option value="momo_manual">MoMo (Manual)</option>
                              <option value="bank_transfer">Bank Transfer</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Notes (Optional)</label>
                          <input
                            type="text"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            placeholder="Transaction ID or notes"
                            className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleRecordPayment}
                            disabled={!paymentAmount || isRecordingPayment}
                            className="flex-1 mt-2 text-[10px] uppercase tracking-widest px-3 py-2 bg-primary text-surface hover:bg-tertiary transition-colors disabled:opacity-50"
                          >
                            {isRecordingPayment ? 'Recording...' : 'Record Payment'}
                          </button>
                          {selectedOrder.depositRequired && (
                            <button
                              onClick={() => {
                                // For now, just pre-fill the deposit amount if known, or total amount
                                setPaymentAmount(selectedOrder.amountDue || selectedOrder.totalAmount);
                                setPaymentNotes("Collected Deposit");
                              }}
                              className="flex-1 mt-2 text-[10px] uppercase tracking-widest px-3 py-2 bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                            >
                              Collect Deposit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Production Stages & Assignment */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <Scissors className="w-4 h-4" /> Production & Assignment
                  </h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Assigned Designer</label>
                      <select 
                        value={selectedOrder.assignedDesignerId || ''}
                        onChange={async (e) => {
                          try {
                            await assignDesigner({ orderId: selectedOrder._id, designerId: e.target.value as any });
                            toast.success("Designer assigned");
                            setSelectedOrder({...selectedOrder, assignedDesignerId: e.target.value as any});
                          } catch (err: any) {
                            toast.error(err.message || "Failed to assign designer");
                          }
                        }}
                        className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                      >
                        <option value="">Unassigned</option>
                        {staff.map(user => (
                          <option key={user._id} value={user._id}>{user.firstName} {user.lastName} ({user.role || 'Staff'})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/20">
                      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Production Status</label>
                      <select 
                        value={selectedOrder.productionStatus || 'pending'}
                        onChange={async (e) => {
                          try {
                            await updateProductionStatus({ orderId: selectedOrder._id, status: e.target.value });
                            toast.success("Production status updated");
                            setSelectedOrder({...selectedOrder, productionStatus: e.target.value});
                          } catch (err: any) {
                            toast.error(err.message || "Failed to update production status");
                          }
                        }}
                        className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                      >
                        <option value="pending">Not Started</option>
                        <option value="cutting">Cutting</option>
                        <option value="stitching">Stitching</option>
                        <option value="fitting">Fitting</option>
                        <option value="finishing">Finishing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Activity Timeline */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <MessageSquare className="w-4 h-4" /> Activity Timeline
                  </h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {orderActivity.length === 0 ? (
                        <p className="text-sm italic text-on-surface-variant text-center py-4">No activity logged yet.</p>
                      ) : (
                        orderActivity.map((log: any) => (
                          <div key={log._id} className="flex gap-3 text-sm">
                            <div className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <div>
                              <p className="text-on-surface-variant text-xs">
                                <span className="font-bold text-primary">{log.performedByName}</span> - {new Date(log.timestamp).toLocaleString()}
                              </p>
                              <p className="text-primary mt-1">{log.note}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-outline-variant/20 flex gap-2">
                      <input 
                        type="text" 
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                      />
                      <button 
                        disabled={!newNote.trim() || isAddingNote}
                        onClick={async () => {
                          if (!newNote.trim()) return;
                          setIsAddingNote(true);
                          try {
                            await addNote({ orderId: selectedOrder._id, note: newNote });
                            setNewNote('');
                          } catch (err: any) {
                            toast.error(err.message || "Failed to add note");
                          } finally {
                            setIsAddingNote(false);
                          }
                        }}
                        className="bg-primary text-surface px-4 text-xs font-bold uppercase tracking-widest hover:bg-tertiary transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </section>

                {/* Notify Client */}
                <section>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                    <Send className="w-4 h-4" /> Notify Client
                  </h4>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
                    <p className="text-xs text-on-surface-variant mb-2">Send an SMS and in-app notification directly to the client.</p>
                    <textarea 
                      value={clientMessage}
                      onChange={e => setClientMessage(e.target.value)}
                      placeholder="Type message to client..."
                      className="w-full h-24 bg-surface-container border border-outline-variant/30 text-sm p-3 focus:outline-none focus:border-primary resize-none custom-scrollbar"
                    />
                    <button 
                      disabled={!clientMessage.trim() || isSendingMessage}
                      onClick={async () => {
                        if (!clientMessage.trim()) return;
                        setIsSendingMessage(true);
                        try {
                          await notifyClient({ orderId: selectedOrder._id, message: clientMessage });
                          setClientMessage('');
                          toast.success("Client notified successfully!");
                        } catch (err: any) {
                          toast.error(err.message || "Failed to notify client");
                        } finally {
                          setIsSendingMessage(false);
                        }
                      }}
                      className="w-full bg-primary text-surface px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-tertiary transition-colors disabled:opacity-50"
                    >
                      {isSendingMessage ? 'Sending...' : 'Send Message'}
                    </button>
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
