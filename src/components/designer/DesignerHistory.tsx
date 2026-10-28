import React, { useMemo, useState } from 'react';
import { Archive, Search } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { useStaffQuery } from '../../hooks/useStaffAuth';

export default function DesignerHistory() {
  const orders = useStaffQuery(api.designer.getMyHistory);
  const [search, setSearch] = useState('');
  const historyOrders = useMemo(() => (orders || []).filter(order =>
    `${order.orderId || ''} ${order.items.map((item: any) => item.name).join(' ')} ${order.productionStatus || ''}`.toLowerCase().includes(search.toLowerCase())
  ), [orders, search]);

  if (orders === undefined) return <div className="p-8 text-sm text-on-surface-variant">Loading completed work…</div>;

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div><h2 className="font-serif text-2xl text-primary mb-1">Completed Work</h2><p className="text-sm text-on-surface-variant">View garments you have successfully finished.</p></div>
        <label className="relative w-full sm:w-64"><Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search completed…" className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary" /></label>
      </div>
      <div className="bg-surface border border-surface-variant flex-1 p-6">
        {historyOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center"><Archive className="w-12 h-12 text-outline mb-4" /><h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{search ? 'No Matching Work' : 'No Completed Work'}</h3><p className="text-on-surface-variant text-sm">{search ? 'Try a different search.' : "You haven't completed any assignments yet."}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-container text-primary uppercase text-[10px] tracking-widest"><tr><th className="p-4 font-bold border-b border-surface-variant">Order ID</th><th className="p-4 font-bold border-b border-surface-variant">Garments</th><th className="p-4 font-bold border-b border-surface-variant">Date</th><th className="p-4 font-bold border-b border-surface-variant">Production</th></tr></thead><tbody>{historyOrders.map((order, index) => <tr key={order._id} className={index !== historyOrders.length - 1 ? 'border-b border-outline-variant/30' : ''}><td className="p-4 text-primary font-mono">{order.orderId || String(order._id).slice(0, 10)}</td><td className="p-4 text-on-surface-variant">{order.items.map((item: any) => `${item.name} × ${item.quantity}`).join(', ')}</td><td className="p-4 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td><td className="p-4 text-on-surface-variant capitalize">{order.productionStatus?.replaceAll('_', ' ') || 'Completed'}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
