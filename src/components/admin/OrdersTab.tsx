import React, { useState } from 'react';
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';

export default function OrdersTab() {
  const orders = useQuery(api.orders.getAll);
  const updateStatus = useMutation(api.orders.updateStatus);

  const handleStatusChange = async (orderId: Id<"orders">, newStatus: string) => {
    try {
      await updateStatus({ orderId, status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (orders === undefined) return <div className="p-8 font-sans">Loading orders...</div>;

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 border-b border-brand-charcoal/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-brand-espresso mb-1">Commissions</h2>
          <p className="text-sm text-brand-charcoal/70">Manage and track all customer commissions (orders).</p>
        </div>
      </div>
      
      <div className="bg-white border border-brand-espresso/10 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-bone border-b border-brand-espresso/10">
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Project ID</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Customer</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Date</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Total</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-brand-charcoal/50 italic text-sm">No commissions found.</td>
              </tr>
            )}
            {orders.map((order: Doc<"orders">) => (
              <tr key={order._id} className="border-b border-brand-espresso/5 hover:bg-brand-bone/50 transition-colors pointer-events-auto">
                <td className="p-4 text-xs font-mono text-brand-espresso">{order._id.substring(0, 10)}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-brand-espresso">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</span>
                    <span className="text-[10px] text-brand-charcoal/70">{order.customerDetails?.email}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-brand-charcoal">{new Date(order._creationTime).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-medium text-brand-espresso tracking-wide">GH₵{order.totalAmount.toFixed(2)}</td>
                <td className="p-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-transparent border border-brand-espresso/20 text-xs font-sans p-2 rounded-none focus:outline-none focus:border-brand-espresso"
                  >
                    <option value="pending">Pending</option>
                    <option value="fabric_sourced">Fabric Sourced</option>
                    <option value="cutting_phase">Cutting Phase</option>
                    <option value="first_fitting_ready">First Fitting Ready</option>
                    <option value="final_adjustments">Final Adjustments</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
