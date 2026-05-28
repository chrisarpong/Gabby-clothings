import React from 'react';
import { useQuery, useMutation  } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

export default function ClientRelationsTab() {
  const appointments = useQuery(api.appointments.getUpcoming);
  const updateStatus = useMutation(api.appointments.updateStatus);

  const handleStatusUpdate = async (id: any, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (e) {
       toast.error("Failed to update appointment");
    }
  }

  if (appointments === undefined) return <div className="p-8 font-sans">Loading appointments...</div>;

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 border-b border-brand-charcoal/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-brand-espresso mb-1">Atelier Appointments</h2>
          <p className="text-sm text-brand-charcoal/70">Manage tailoring and consultation requests.</p>
        </div>
      </div>
      
      <div className="bg-white border border-brand-espresso/10 overflow-hidden flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-bone border-b border-brand-espresso/10">
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Client</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Requested Date</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Garment Type</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium w-48">Notes</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Status</th>
              <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-brand-charcoal/50 italic text-sm">No upcoming appointments.</td>
              </tr>
            )}
            {appointments.map((apt: any) => (
              <tr key={apt._id} className="border-b border-brand-espresso/5 hover:bg-brand-bone/50 transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-brand-espresso">{apt.name || apt.clientName}</span>
                    <span className="text-[10px] text-brand-charcoal/70">{apt.email || apt.clientEmail} • {apt.phone || apt.clientPhone}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-brand-charcoal">{apt.date ? new Date(apt.date).toLocaleDateString() : (apt.requestedDate ? new Date(apt.requestedDate).toLocaleDateString() : '')}</span>
                    {apt.time && <span className="text-[10px] text-brand-charcoal/70">{apt.time}</span>}
                  </div>
                </td>
                <td className="p-4 text-sm text-brand-charcoal capitalize">{apt.garmentType}</td>
                <td className="p-4 text-xs text-brand-charcoal/80 max-w-xs truncate" title={apt.notes}>{apt.notes || '-'}</td>
                <td className="p-4">
                   <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'text-brand-charcoal/50 bg-brand-bone'}`}>{apt.status}</span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  {apt.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleStatusUpdate(apt._id, 'confirmed')}
                        className="text-[10px] tracking-widest uppercase py-1 px-3 border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(apt._id, 'cancelled')}
                        className="text-[10px] tracking-widest uppercase py-1 px-3 border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {apt.status === 'confirmed' && (
                    <button 
                      onClick={() => handleStatusUpdate(apt._id, 'completed')}
                      className="text-[10px] tracking-widest uppercase py-1 px-3 border border-brand-espresso text-brand-espresso hover:bg-brand-espresso hover:text-white transition-colors"
                    >
                      Mark Done
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
