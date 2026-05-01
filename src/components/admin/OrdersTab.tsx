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
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../ui/dialog';
import { toast } from 'sonner';

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
    <div className="w-full">
      <div className="flex justify-between items-end mb-12 border-b border-[#d4c3c1] pb-8">
        <h2 className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Bespoke Orders Archive
        </h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-transparent border border-[#d4c3c1] text-[#3a1f1d] text-[10px] tracking-[0.05em] font-normal uppercase py-2 pl-4 pr-10 focus:ring-0 focus:border-[#3a1f1d] rounded-none cursor-pointer"
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#827472] w-4 h-4" />
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 pb-4 border-b border-[#d4c3c1] uppercase w-24 h-auto align-bottom" style={{ fontFamily: "'Jost', sans-serif" }}>Order ID</TableHead>
            <TableHead className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 pb-4 border-b border-[#d4c3c1] uppercase h-auto align-bottom" style={{ fontFamily: "'Jost', sans-serif" }}>Client Name</TableHead>
            <TableHead className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 pb-4 border-b border-[#d4c3c1] uppercase w-32 h-auto align-bottom" style={{ fontFamily: "'Jost', sans-serif" }}>Date</TableHead>
            <TableHead className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 pb-4 border-b border-[#d4c3c1] uppercase w-32 h-auto align-bottom" style={{ fontFamily: "'Jost', sans-serif" }}>Total Amount</TableHead>
            <TableHead className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 pb-4 border-b border-[#d4c3c1] uppercase w-32 h-auto align-bottom" style={{ fontFamily: "'Jost', sans-serif" }}>Status</TableHead>
            <TableHead className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 pb-4 border-b border-[#d4c3c1] uppercase w-32 text-right h-auto align-bottom" style={{ fontFamily: "'Jost', sans-serif" }}>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders === undefined ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-[14px] opacity-50">Syncing live orders...</TableCell>
            </TableRow>
          ) : filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-[14px] opacity-50">No orders found.</TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order._id} className="group hover:bg-[#3a1f1d]/5 transition-colors duration-300 border-b border-[#d4c3c1]">
                <TableCell className="py-6 text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 align-top" style={{ fontFamily: "'Jost', sans-serif" }}>
                  #{order._id.slice(-8).toUpperCase()}
                </TableCell>
                <TableCell className="py-6 text-[16px] leading-[1.6] tracking-[0.01em] text-[#3a1f1d] align-top" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </TableCell>
                <TableCell className="py-6 text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d] align-top" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {new Date(order._creationTime).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                </TableCell>
                <TableCell className="py-6 text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d] tracking-wider align-top" style={{ fontFamily: "'Jost', sans-serif" }}>
                  {order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} GHS
                </TableCell>
                <TableCell className="py-6 align-top">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`inline-block px-3 py-1 border rounded-full text-[10px] leading-[1.4] tracking-[0.05em] uppercase cursor-pointer focus:outline-none ${
                      order.status === 'completed' ? 'border-[#3a1f1d] bg-[#3a1f1d] text-[#F9F8F6]' : 
                      order.status === 'pending' ? 'border-dashed border-[#3a1f1d]/40 text-[#3a1f1d] bg-transparent' :
                      'border-[#3a1f1d]/20 text-[#3a1f1d] bg-transparent'
                    }`}
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    <option value="pending" className="text-[#3a1f1d] bg-white">Pending</option>
                    <option value="processing" className="text-[#3a1f1d] bg-white">Processing</option>
                    <option value="shipped" className="text-[#3a1f1d] bg-white">Shipped</option>
                    <option value="completed" className="text-[#3a1f1d] bg-white">Completed</option>
                    <option value="cancelled" className="text-[#3a1f1d] bg-white">Cancelled</option>
                  </select>
                </TableCell>
                <TableCell className="py-6 text-right align-top">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="text-[11px] leading-none tracking-[0.15em] font-semibold border border-[#3a1f1d] px-4 py-2 text-[#3a1f1d] hover:bg-[#3A1F1D] hover:text-[#F9F8F6] transition-colors duration-300 uppercase"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    Review
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* The Bespoke Dossier (Modal/Dialog Overlay) */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-[1024px] max-h-[90vh] overflow-y-auto border border-[#d4c3c1]">
          {selectedOrder && (
            <>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-8 border-b border-[#d4c3c1] sticky top-0 bg-[#F9F8F6] z-10">
                <div>
                  <DialogTitle className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Dossier #{selectedOrder._id.slice(-8).toUpperCase()}
                  </DialogTitle>
                  <p className="text-[10px] leading-[1.4] tracking-[0.1em] text-[#3a1f1d]/70 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    Bespoke Manifest & Specifications
                  </p>
                </div>
                <DialogClose className="text-[#3a1f1d]/70 hover:text-[#3A1F1D] transition-colors outline-none focus:ring-0">
                  <X className="w-6 h-6" />
                </DialogClose>
              </div>

              <div className="p-12 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-16">
                {/* Section 1 & 2: Client & Items (Left Column) */}
                <div className="md:col-span-5 space-y-12">
                  <section>
                    <h4 className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 border-b border-[#d4c3c1] pb-2 mb-6 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Client Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 uppercase mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>Name</p>
                        <p className="text-[24px] font-normal leading-none text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 uppercase mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>Shipping Designation</p>
                        <p className="text-[16px] leading-[1.6] tracking-[0.01em] text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {selectedOrder.shippingAddress.address}<br />
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region} {selectedOrder.shippingAddress.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 uppercase mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>Contact</p>
                        <p className="text-[16px] leading-[1.6] tracking-[0.01em] text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {selectedOrder.shippingAddress.email}<br />
                          {selectedOrder.shippingAddress.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 uppercase mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>Commission Date</p>
                        <p className="text-[16px] leading-[1.6] tracking-[0.01em] text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
                          {new Date(selectedOrder._creationTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 border-b border-[#d4c3c1] pb-2 mb-6 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Commissioned Garments
                    </h4>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="border border-[#d4c3c1] p-6">
                          <p className="text-[20px] font-normal leading-[1.2] text-[#3a1f1d] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {item.name}
                          </p>
                          <p className="text-[16px] leading-[1.6] tracking-[0.01em] text-[#3a1f1d]/80 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Quantity: {item.quantity}
                          </p>
                          <div className="flex justify-between items-center border-t border-[#d4c3c1] pt-4 mt-4">
                            <span className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                              Unit Price: GHS {item.priceAtTime.toLocaleString()}
                            </span>
                            <span className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d] tracking-wider uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                              Total: GHS {(item.priceAtTime * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Section 3: Tailoring Details (Right Column) */}
                <div className="md:col-span-7 space-y-12">
                  <section>
                    <h4 className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 border-b border-[#d4c3c1] pb-2 mb-6 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Tailoring Measurements
                    </h4>
                    {selectedOrder.tailoringDetails && selectedOrder.tailoringDetails.hasMeasurements && selectedOrder.tailoringDetails.measurementsUsed ? (
                      <div className="grid grid-cols-2 gap-8">
                        {Object.entries(selectedOrder.tailoringDetails.measurementsUsed).map(([key, val]) => (
                          val !== undefined && val !== null && (
                            <div key={key} className="border-b border-[#d4c3c1] pb-4">
                              <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-[#3a1f1d]/70 uppercase mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-[64px] font-normal leading-[1.1] tracking-[-0.02em] text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                                {val as React.ReactNode}
                                <span className="text-[24px] ml-1 text-[#3a1f1d]/70">in</span>
                              </p>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 border border-dashed border-[#d4c3c1] text-center">
                        <p className="text-[16px] text-[#3a1f1d]/50 italic" style={{ fontFamily: "'Jost', sans-serif" }}>
                          No custom measurements provided for this order. (Ready-to-wear)
                        </p>
                      </div>
                    )}
                  </section>

                  {/* Section 4: Visual References */}
                  <section>
                    <h4 className="text-[11px] leading-none tracking-[0.15em] font-semibold text-[#3a1f1d]/70 border-b border-[#d4c3c1] pb-2 mb-6 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Visual Manifest
                    </h4>
                    {selectedOrder.tailoringDetails && (selectedOrder.tailoringDetails.fullBodyImageId || selectedOrder.tailoringDetails.inspoImageId) ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="aspect-[3/4] border border-dashed border-[#d4c3c1] p-2 flex flex-col">
                          <div className="w-full h-full bg-[#e3e2e0] flex items-center justify-center bg-cover bg-center overflow-hidden">
                            {selectedOrder.tailoringDetails.inspoImageId ? (
                              <img src={selectedOrder.tailoringDetails.inspoImageId} alt="Inspiration" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-[#3a1f1d]/30 italic">No Inspiration Provided</span>
                            )}
                          </div>
                          <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-center mt-2 text-[#3a1f1d]/70 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Client Inspiration
                          </p>
                        </div>
                        <div className="aspect-[3/4] border border-dashed border-[#d4c3c1] p-2 flex flex-col">
                          <div className="w-full h-full bg-[#e3e2e0] flex items-center justify-center bg-cover bg-center overflow-hidden">
                            {selectedOrder.tailoringDetails.fullBodyImageId ? (
                              <img src={selectedOrder.tailoringDetails.fullBodyImageId} alt="Full Body" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-[#3a1f1d]/30 italic">No Body Image Provided</span>
                            )}
                          </div>
                          <p className="text-[10px] leading-[1.4] tracking-[0.05em] text-center mt-2 text-[#3a1f1d]/70 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Full Body Shot
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 border border-dashed border-[#d4c3c1] text-center">
                        <p className="text-[16px] text-[#3a1f1d]/50 italic" style={{ fontFamily: "'Jost', sans-serif" }}>
                          No visual references attached.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
