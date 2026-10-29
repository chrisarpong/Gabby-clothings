import React, { useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { useStaffQuery, useStaffMutation } from "../../hooks/useStaffAuth";

export default function SalesHistory() {
  const orders = useStaffQuery(api.orders.getMySales);
  const recordManualPayment = useStaffMutation(api.orders.recordManualPayment);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState<Record<string, { amount: string; method: string; notes: string }>>({});
  const posOrders = useMemo(() => (orders || []).filter(order =>
    order.orderId?.startsWith('GB-') && `${order.orderId} ${order.customerDetails?.firstName || ''} ${order.customerDetails?.lastName || ''} ${order.status}`.toLowerCase().includes(search.toLowerCase())
  ), [orders, search]);

  if (orders === undefined) return <div className="p-8 text-sm text-on-surface-variant">Loading your sales…</div>;

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif text-2xl text-primary mb-1">Order History</h2>
          <p className="text-sm text-on-surface-variant">View past POS transactions.</p>
        </div>
        <label className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="bg-surface border border-surface-variant flex-1 p-6">
        {posOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <History className="w-12 h-12 text-outline mb-4" />
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">No Past Orders</h3>
            <p className="text-on-surface-variant text-sm">{search ? 'Try a different search.' : "You haven't completed any sales yet."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container text-primary uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4 font-bold border-b border-surface-variant">Order ID</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Customer</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Items</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Total</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {posOrders.map((order, idx) => (
                  <tr key={order._id} className={idx !== posOrders.length - 1 ? 'border-b border-outline-variant/30' : ''}>
                    <td className="p-4 text-primary font-mono">{order.orderId}</td>
                    <td className="p-4 text-on-surface-variant">{order.customerDetails?.firstName} {order.customerDetails?.lastName}</td>
                    <td className="p-4 text-on-surface-variant">{order.items.length} items</td>
                    <td className="p-4 text-primary font-serif">₵{(order.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                        {order.status}
                      </span>
                      {(order.amountDue || 0) > 0 && <div className="mt-2 flex flex-wrap gap-1">
                        <input aria-label="Balance amount" className="w-20 border p-1 text-xs" type="number" value={payment[order._id]?.amount || ''} onChange={e => setPayment(prev => ({ ...prev, [order._id]: { amount: e.target.value, method: prev[order._id]?.method || 'cash', notes: prev[order._id]?.notes || '' } }))} placeholder="Amount" />
                        <select aria-label="Balance method" className="border p-1 text-xs" value={payment[order._id]?.method || 'cash'} onChange={e => setPayment(prev => ({ ...prev, [order._id]: { amount: prev[order._id]?.amount || '', method: e.target.value, notes: prev[order._id]?.notes || '' } }))}><option value="cash">Cash</option><option value="momo">MoMo</option><option value="transfer">Transfer</option></select>
                        <button className="border px-2 py-1 text-xs" onClick={async () => { try { const value = payment[order._id]; await recordManualPayment({ orderId: order._id, amount: Number(value?.amount), paymentMethod: value?.method || 'cash', notes: value?.notes }); setPayment(prev => ({ ...prev, [order._id]: { ...prev[order._id], amount: '' } })); } catch (error: any) { window.alert(error.message || 'Payment failed'); } }}>Record balance</button>
                      </div>}
                    </td>
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
