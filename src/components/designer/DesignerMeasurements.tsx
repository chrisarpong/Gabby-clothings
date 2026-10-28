import React, { useMemo, useState } from 'react';
import { Ruler, Search } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { useStaffQuery } from '../../hooks/useStaffAuth';

export default function DesignerMeasurements() {
  const orders = useStaffQuery(api.designer.getMyOrders);
  const appointments = useStaffQuery(api.designer.getMyAppointments);
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const sources = useMemo(() => [
    ...(orders || []).map((order: any) => ({ value: `order:${order._id}`, label: `${order.orderId || String(order._id).slice(0, 10)} · ${order.items.map((item: any) => item.name).join(', ')}` })),
    ...(appointments || []).map(appointment => ({ value: `appointment:${appointment._id}`, label: `${appointment.name} · ${appointment.date} appointment` })),
  ].filter(source => source.label.toLowerCase().includes(search.toLowerCase())), [orders, appointments, search]);
  const [kind, id] = selectedSource.split(':');
  const measurements = useStaffQuery(api.designer.getClientMeasurements,
    kind === 'order' && id ? { orderId: id as Id<'orders'> } : kind === 'appointment' && id ? { appointmentId: id as Id<'appointments'> } : 'skip'
  );

  if (orders === undefined || appointments === undefined) return <div className="p-8 text-sm text-on-surface-variant">Loading assigned measurement sources…</div>;
  const measurementEntries = measurements && typeof measurements === 'object' ? Object.entries(measurements as Record<string, unknown>) : [];

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div><h2 className="font-serif text-2xl text-primary mb-1">Measurement Lookup</h2><p className="text-sm text-on-surface-variant">Measurements are available only for work assigned to you.</p></div>
        <label className="relative w-full sm:w-64"><Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search assigned work…" className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary" /></label>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(16rem,1fr)_2fr] gap-6 flex-1">
        <div className="bg-surface border border-surface-variant p-4 space-y-2 overflow-y-auto">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Assigned clients and orders</h3>
          {sources.length === 0 ? <p className="text-sm italic text-on-surface-variant">No assigned measurement sources found.</p> : sources.map(source => <button key={source.value} onClick={() => setSelectedSource(source.value)} className={`w-full text-left p-3 border text-sm transition-colors ${selectedSource === source.value ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'}`}>{source.label}</button>)}
        </div>
        <div className="bg-surface border border-surface-variant p-6">
          {!selectedSource ? <div className="h-full flex flex-col items-center justify-center text-center"><Ruler className="w-12 h-12 text-outline mb-4" /><p className="text-sm text-on-surface-variant">Select assigned work to view saved measurements.</p></div>
            : measurements === undefined ? <p className="text-sm text-on-surface-variant">Loading measurements…</p>
              : measurementEntries.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center"><Ruler className="w-12 h-12 text-outline mb-4" /><p className="text-sm text-on-surface-variant">No saved measurements for this assignment.</p></div>
                : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{measurementEntries.map(([key, value]) => <div key={key} className="border border-outline-variant/30 p-4"><span className="block text-[10px] uppercase tracking-widest text-on-surface-variant">{key.replace(/([A-Z])/g, ' $1').trim()}</span><span className="block mt-1 font-mono text-primary">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span></div>)}</div>}
        </div>
      </div>
    </div>
  );
}
