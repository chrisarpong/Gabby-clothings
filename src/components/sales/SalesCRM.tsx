import React, { useState } from 'react';
import { Users, Search, ArrowLeft } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { useStaffQuery, useStaffAuth } from '../../hooks/useStaffAuth';
import { prefillPosCustomer } from '../../utils/posSession';

type Client = { name: string; email: string; phone?: string; orderCount: number; totalSpent: number; outstandingBalance: number; lastOrderDate: number; orders: Array<{ orderId?: string; date: number; total: number; balance: number; status?: string }> };

export default function SalesCRM({ onStartSale }: { onStartSale: () => void }) {
  const { profile } = useStaffAuth();
  const clients = useStaffQuery(api.orders.getMyClients) as Client[] | undefined;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const query = search.trim().slice(0, 100).toLowerCase();
  const visible = (clients || []).filter(client => [client.name, client.email, client.phone || ''].join(' ').toLowerCase().includes(query));

  const startSale = (client: Client) => {
    const key = profile?._id || 'staff';
    prefillPosCustomer(key, { name: client.name, email: client.email, phone: client.phone });
    onStartSale();
  };

  if (selected) return <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
    <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-primary mb-6"><ArrowLeft className="w-4 h-4" /> Back to clients</button>
    <div className="flex items-start justify-between"><div><h2 className="font-serif text-2xl text-primary">{selected.name}</h2><p className="text-sm text-on-surface-variant">{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</p></div><button onClick={() => startSale(selected)} className="px-4 py-2 bg-primary text-white text-xs uppercase">Start sale for this client</button></div>
    <div className="mt-8 bg-surface border border-surface-variant"><table className="w-full text-left"><thead><tr className="border-b border-outline-variant text-xs uppercase"><th className="p-3">Order</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Balance</th></tr></thead><tbody>{selected.orders.map((order, index) => <tr key={`${order.orderId || 'order'}-${index}`} className="border-b border-outline-variant/30"><td className="p-3">{order.orderId || '—'}</td><td className="p-3">{new Date(order.date).toLocaleDateString()}</td><td className="p-3">{order.status || '—'}</td><td className="p-3">GH₵{order.total.toFixed(2)}</td><td className="p-3">GH₵{order.balance.toFixed(2)}</td></tr>)}</tbody></table></div>
  </div>;

  return <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
    <div className="flex justify-between items-center mb-8"><div><h2 className="font-serif text-2xl text-primary mb-1">Client Directory</h2><p className="text-sm text-on-surface-variant">Clients from recent sales only; saved measurements are not exposed.</p></div><div className="relative w-64"><Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" /><input aria-label="Search clients" maxLength={100} value={search} onChange={e => setSearch(e.target.value.slice(0, 100))} type="search" placeholder="Search clients..." className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm" /></div></div>
    <div className="bg-surface border border-surface-variant flex-1">{clients === undefined ? <p className="p-8 text-center">Loading clients...</p> : visible.length === 0 ? <div className="p-12 text-center"><Users className="w-12 h-12 text-outline mx-auto mb-4" /><p className="text-sm text-on-surface-variant">No clients found.</p></div> : <div className="divide-y divide-outline-variant/30">{visible.map(client => <button key={client.email} onClick={() => setSelected(client)} className="w-full text-left p-4 hover:bg-brand-bone/40 flex items-center justify-between"><span><span className="block font-medium text-primary">{client.name}</span><span className="block text-xs text-on-surface-variant">{client.email}{client.phone ? ` · ${client.phone}` : ''}</span></span><span className="text-right text-xs text-on-surface-variant">{client.orderCount} order{client.orderCount === 1 ? '' : 's'}<br />GH₵{client.totalSpent.toFixed(2)} spent</span></button>)}</div>}</div>
  </div>;
}

