import React, { useMemo, useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { useStaffQuery } from '../../hooks/useStaffAuth';

export default function DesignerAppointments() {
  const appointments = useStaffQuery(api.designer.getMyAppointments);
  const [search, setSearch] = useState('');
  const filteredAppointments = useMemo(() => (appointments || []).filter(appointment =>
    `${appointment.name} ${appointment.date} ${appointment.time || ''} ${appointment.garmentType || ''} ${appointment.status}`.toLowerCase().includes(search.toLowerCase())
  ), [appointments, search]);

  if (appointments === undefined) return <div className="p-8 text-sm text-on-surface-variant">Loading assigned appointments…</div>;

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div><h2 className="font-serif text-2xl text-primary mb-1">My Appointments</h2><p className="text-sm text-on-surface-variant">View your scheduled fittings and consultations.</p></div>
        <label className="relative w-full sm:w-64"><Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" /><input value={search} onChange={event => setSearch(event.target.value)} type="search" placeholder="Search appointments…" className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary" /></label>
      </div>
      <div className="bg-surface border border-surface-variant flex-1 p-6">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center"><Calendar className="w-12 h-12 text-outline mb-4" /><h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{search ? 'No Matching Appointments' : 'No Upcoming Appointments'}</h3><p className="text-on-surface-variant text-sm">{search ? 'Try a different search.' : 'You have no scheduled sessions at the moment.'}</p></div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-surface-container text-primary uppercase text-[10px] tracking-widest"><tr><th className="p-4 font-bold border-b border-surface-variant">Date & Time</th><th className="p-4 font-bold border-b border-surface-variant">Client</th><th className="p-4 font-bold border-b border-surface-variant">Type</th><th className="p-4 font-bold border-b border-surface-variant">Status</th></tr></thead><tbody>{filteredAppointments.map((appointment, index) => <tr key={appointment._id} className={index !== filteredAppointments.length - 1 ? 'border-b border-outline-variant/30' : ''}><td className="p-4 text-primary font-mono">{appointment.date} {appointment.time || ''}</td><td className="p-4 text-on-surface-variant">{appointment.name}</td><td className="p-4 text-on-surface-variant capitalize">{appointment.appointmentType || appointment.garmentType || 'Fitting'}</td><td className="p-4"><span className="bg-primary/10 text-primary px-2 py-1 text-[10px] uppercase tracking-widest font-bold">{appointment.status}</span></td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
