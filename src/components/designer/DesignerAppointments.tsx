import React from 'react';
import { Calendar, Search } from 'lucide-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';

export default function DesignerAppointments() {
  const convexUser = useQuery(api.users.getCurrentUser);
  const allAppointments = useQuery(api.appointments.getUpcoming) || [];
  
  // Filter appointments assigned to this tailor
  const appointments = allAppointments.filter((apt: any) => 
    apt.assignedTo === convexUser?.firstName || apt.assignedTo === `${convexUser?.firstName} ${convexUser?.lastName}`
  );

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif text-2xl text-primary mb-1">My Appointments</h2>
          <p className="text-sm text-on-surface-variant">View your scheduled fittings and consultations.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search appointments..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-surface border border-surface-variant flex-1 p-6">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Calendar className="w-12 h-12 text-outline mb-4" />
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">No Upcoming Appointments</h3>
            <p className="text-on-surface-variant text-sm">You have no scheduled sessions at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container text-primary uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4 font-bold border-b border-surface-variant">Date & Time</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Client</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Type</th>
                  <th className="p-4 font-bold border-b border-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, idx) => (
                  <tr key={apt._id} className={idx !== appointments.length - 1 ? 'border-b border-outline-variant/30' : ''}>
                    <td className="p-4 text-primary font-mono">{new Date(apt.date).toLocaleString()}</td>
                    <td className="p-4 text-on-surface-variant">{apt.firstName} {apt.lastName}</td>
                    <td className="p-4 text-on-surface-variant capitalize">{apt.type}</td>
                    <td className="p-4">
                      <span className="bg-primary/10 text-primary px-2 py-1 text-[10px] uppercase tracking-widest font-bold">
                        {apt.status}
                      </span>
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
