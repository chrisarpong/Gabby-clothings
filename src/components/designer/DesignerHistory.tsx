import React from 'react';
import { Archive, Search } from 'lucide-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';

export default function DesignerHistory() {
  const convexUser = useQuery(api.users.getCurrentUser);
  const orders = useQuery(api.orders.getAll) || [];

  // Filter completed/delivered orders assigned to this designer
  const historyOrders = orders.filter(
    o => o.assignedDesignerId === convexUser?._id && o.status === 'delivered'
  );

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif text-2xl text-primary mb-1">Completed Work</h2>
          <p className="text-sm text-on-surface-variant">View garments you have successfully finished.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search completed..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-surface border border-surface-variant flex-1 p-6">
        {historyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Archive className="w-12 h-12 text-outline mb-4" />
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">No Completed Work</h3>
            <p className="text-on-surface-variant text-sm">You haven't completed any assignments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container text-primary uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4 font-bold border-b border-surface-variant">Order ID</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Client</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Garments</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Date Completed</th>
                </tr>
              </thead>
              <tbody>
                {historyOrders.map((order, idx) => (
                  <tr key={order._id} className={idx !== historyOrders.length - 1 ? 'border-b border-outline-variant/30' : ''}>
                    <td className="p-4 text-primary font-mono">{order.orderId}</td>
                    <td className="p-4 text-on-surface-variant">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</td>
                    <td className="p-4 text-on-surface-variant">{order.items.length} items</td>
                    <td className="p-4 text-on-surface-variant">{new Date(order._creationTime).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
