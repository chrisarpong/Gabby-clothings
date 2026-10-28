import React, { useMemo, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { useStaffMutation, useStaffQuery } from '../../hooks/useStaffAuth';
import { ChevronRight, MessageSquare, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function DesignerTasks() {
  const orders = useStaffQuery(api.designer.getMyOrders);
  const updateProductionStatus = useStaffMutation(api.designer.updateMyOrderProduction);
  const addNote = useStaffMutation(api.orderActivity.addNote);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newNote, setNewNote] = useState('');
  const selectedOrder = orders?.find(order => order._id === selectedId) ?? null;
  const activity = useStaffQuery(api.orderActivity.getByOrder, selectedOrder ? { orderId: selectedOrder._id } : 'skip') || [];
  const filteredOrders = useMemo(() => (orders || []).filter(order => {
    const text = `${order.orderId || ''} ${order.items.map((item: any) => item.name).join(' ')} ${order.productionStatus || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  }), [orders, search]);

  if (orders === undefined) return <div className="p-8 text-sm text-on-surface-variant">Loading assigned orders…</div>;

  return (
    <div className="flex-1 flex overflow-hidden h-full">
      <main className="max-w-7xl mx-auto p-4 sm:p-8 flex gap-8 flex-1 w-full relative">
        <div className={`flex-1 ${selectedOrder ? 'hidden lg:block' : 'block'}`}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Your Active Tasks ({orders.filter(order => order.productionStatus !== 'completed').length})</h2>
              <p className="text-sm text-on-surface-variant">Orders assigned to your account.</p>
            </div>
            <label className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
              <input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search assigned work…" className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary" />
            </label>
          </div>
          <div className="grid gap-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-surface border border-surface-variant">
                <p className="text-on-surface-variant text-sm italic">{search ? 'No assigned work matches your search.' : 'You have no assigned orders right now.'}</p>
              </div>
            ) : filteredOrders.map(order => (
              <button key={order._id} onClick={() => setSelectedId(order._id)} className={`w-full text-left bg-surface border p-5 cursor-pointer transition-colors hover:border-primary/50 ${selectedId === order._id ? 'border-primary shadow-sm' : 'border-surface-variant'}`}>
                <div className="flex justify-between items-start mb-3 gap-4">
                  <div>
                    <span className="text-xs font-mono bg-surface-variant/50 text-primary px-2 py-1 rounded">{order.orderId || String(order._id).slice(0, 10)}</span>
                    <h3 className="font-medium text-primary mt-2">{order.items.map((item: any) => item.name).join(', ') || 'Custom order'}</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{order.productionStatus?.replaceAll('_', ' ') || 'Pending'}</span>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-xs text-on-surface-variant">{order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {new Date(order.createdAt).toLocaleDateString()}</p>
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedOrder && (
          <section className="flex-1 lg:max-w-xl bg-surface border border-surface-variant flex flex-col h-[calc(100vh-100px)] sticky top-24">
            <header className="p-6 border-b border-surface-variant flex justify-between items-start gap-4 bg-surface-container-lowest">
              <div>
                <button onClick={() => setSelectedId(null)} className="lg:hidden text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-4">← Back to List</button>
                <h2 className="font-serif text-2xl text-primary">{selectedOrder.orderId || 'Assigned order'}</h2>
                <p className="text-sm text-on-surface-variant mt-1">Created {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
              <select value={selectedOrder.productionStatus} onChange={async event => {
                try {
                  await updateProductionStatus({ orderId: selectedOrder._id, productionStatus: event.target.value });
                  toast.success('Production status updated');
                } catch (error: any) { toast.error(error.message || 'Could not update status'); }
              }} className="bg-primary text-surface px-3 py-2 text-[10px] uppercase tracking-widest font-bold focus:outline-none">
                {['pending', 'cutting', 'stitching', 'fitting', 'finishing', 'completed', 'ready_for_pickup'].map(stage => <option key={stage} value={stage}>{stage.replaceAll('_', ' ')}</option>)}
              </select>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">Measurements & Requirements</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={`${item.name}-${index}`} className="bg-surface-container-lowest border border-surface-variant p-4">
                      <p className="font-medium text-primary mb-3">{item.name} (x{item.quantity})</p>
                      {item.measurements && Object.keys(item.measurements).length ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">{Object.entries(item.measurements).map(([key, value]) => <div key={key} className="flex justify-between items-end border-b border-surface-variant pb-1"><span className="text-[10px] uppercase text-on-surface-variant">{key.replace(/([A-Z])/g, ' $1').trim()}</span><span className="text-xs font-bold text-primary">{String(value)}</span></div>)}</div>
                      ) : <p className="text-xs text-on-surface-variant italic">Standard size ({item.variantSku || 'N/A'})</p>}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> Progress Notes</h3>
                <div className="flex gap-2 mb-4">
                  <input value={newNote} onChange={event => setNewNote(event.target.value)} placeholder="Add a work note…" className="flex-1 bg-surface-container-lowest border border-surface-variant px-3 py-2 text-sm focus:outline-none focus:border-primary" onKeyDown={event => { if (event.key === 'Enter') void addNote({ orderId: selectedOrder._id, note: newNote }).then(() => setNewNote('')); }} />
                  <button onClick={() => { if (newNote.trim()) void addNote({ orderId: selectedOrder._id, note: newNote }).then(() => setNewNote('')); }} className="bg-primary text-surface px-4 text-[10px] font-bold uppercase tracking-widest">Add</button>
                </div>
                {activity === undefined ? <p className="text-xs text-on-surface-variant">Loading activity…</p> : activity.length === 0 ? <p className="text-xs italic text-on-surface-variant">No notes yet.</p> : <div className="space-y-4">{activity.map((log: any) => <div key={log._id} className="text-sm border-l-2 border-primary/20 pl-3 py-1"><p className="text-primary">{log.note}</p><p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest"><span className="font-bold">{log.performedByName}</span> · {new Date(log.timestamp).toLocaleString()}</p></div>)}</div>}
              </section>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
