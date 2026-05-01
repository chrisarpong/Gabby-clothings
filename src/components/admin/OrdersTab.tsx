import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export const OrdersTab = ({ orders, updateOrderStatus }: { orders: any[], updateOrderStatus: any }) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusChange = (orderId: string, newStatus: string) => {
    toast.promise(updateOrderStatus({ orderId: orderId as any, status: newStatus as any }), {
      loading: 'Updating status...',
      success: 'Order status updated!',
      error: 'Failed to update status',
    });
  };

  const filteredOrders = orders?.filter(order => 
    statusFilter === 'all' ? true : order.status === statusFilter
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Orders
          </h2>
          <p className="text-sm text-[#3a1f1d]/60 mt-1">Manage and track all customer orders</p>
        </div>
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-[#3a1f1d]/15 text-[#3a1f1d] text-sm py-2 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-[#3a1f1d]/20 focus:border-[#3a1f1d] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B7D7B] w-4 h-4" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Order ID</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Client</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Date</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Amount</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Status</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#3a1f1d]/40">Loading orders...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#3a1f1d]/40">No orders found.</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors">
                  <TableCell className="py-4 px-6 text-xs font-mono text-[#3a1f1d]/60">
                    #{order._id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell className="py-4 px-6 font-medium text-[#2C1816]">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-[#3a1f1d]/70">
                    {new Date(order._creationTime).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm font-medium text-[#2C1816]">
                    GHS {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3a1f1d]/20 ${statusColors[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-sm font-medium text-[#3a1f1d] hover:text-[#2C1816] transition-colors"
                    >
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl">
          {selectedOrder && (
            <>
              <div className="flex justify-between items-center p-6 border-b border-[#3a1f1d]/10">
                <div>
                  <DialogTitle className="text-xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Order #{selectedOrder._id.slice(-8).toUpperCase()}
                  </DialogTitle>
                  <p className="text-xs text-[#3a1f1d]/50 mt-1">Order details and specifications</p>
                </div>
                <DialogClose className="text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors outline-none">
                  <X className="w-5 h-5" />
                </DialogClose>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide mb-4">Client Information</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-[#3a1f1d]/50 text-xs">Name</span>
                        <p className="font-medium text-[#2C1816]">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      </div>
                      <div>
                        <span className="text-[#3a1f1d]/50 text-xs">Address</span>
                        <p className="text-[#3a1f1d]/70">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region}</p>
                      </div>
                      <div>
                        <span className="text-[#3a1f1d]/50 text-xs">Contact</span>
                        <p className="text-[#3a1f1d]/70">{selectedOrder.shippingAddress.email}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="p-4 rounded-lg border border-[#3a1f1d]/8 bg-[#FDFBF9]">
                          <p className="font-medium text-[#2C1816]">{item.name}</p>
                          <p className="text-xs text-[#3a1f1d]/50 mt-1">Qty: {item.quantity}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#3a1f1d]/8">
                            <span className="text-xs text-[#3a1f1d]/50">GHS {item.priceAtTime.toLocaleString()}</span>
                            <span className="text-sm font-medium text-[#2C1816]">GHS {(item.priceAtTime * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedOrder.tailoringDetails && selectedOrder.tailoringDetails.hasMeasurements && selectedOrder.tailoringDetails.measurementsUsed && (
                  <div>
                    <h4 className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide mb-4">Measurements</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(selectedOrder.tailoringDetails.measurementsUsed).map(([key, val]) => (
                        val !== undefined && val !== null && (
                          <div key={key} className="p-3 rounded-lg border border-[#3a1f1d]/8 bg-[#FDFBF9]">
                            <span className="text-xs text-[#3a1f1d]/50">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <p className="text-lg font-semibold text-[#2C1816] mt-1">{val as React.ReactNode}"</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.tailoringDetails && (selectedOrder.tailoringDetails.fullBodyImageId || selectedOrder.tailoringDetails.inspoImageId) && (
                  <div>
                    <h4 className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide mb-4">Images</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedOrder.tailoringDetails.inspoImageId && (
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#3a1f1d]/8">
                          <img src={selectedOrder.tailoringDetails.inspoImageId} alt="Inspiration" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {selectedOrder.tailoringDetails.fullBodyImageId && (
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#3a1f1d]/8">
                          <img src={selectedOrder.tailoringDetails.fullBodyImageId} alt="Full Body" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
