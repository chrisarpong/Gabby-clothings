import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, List } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AdminAppointmentsTab() {
  const appointments = useQuery(api.appointments.getUpcoming);
  const updateStatus = useMutation(api.appointments.updateStatus);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

  const handleStatusUpdate = async (id: any, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (e) {
       toast.error("Failed to update appointment");
    }
  }

  if (appointments === undefined) return <div className="p-8 font-sans">Loading appointments...</div>;

  const events = appointments.map((apt) => {
    // If we only have date, use it as allDay
    let start = new Date(apt.date || apt.requestedDate || Date.now());
    let end = new Date(start);
    let allDay = true;

    if (apt.time) {
      const [hours, minutes] = apt.time.split(':').map(Number);
      start.setHours(hours, minutes, 0, 0);
      end = new Date(start.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
      allDay = false;
    }

    return {
      id: apt._id,
      title: `${apt.name || apt.clientName} - ${apt.garmentType}`,
      start,
      end,
      allDay,
      resource: apt,
    };
  });

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 border-b border-brand-charcoal/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-brand-espresso mb-1">Atelier Appointments</h2>
          <p className="text-sm text-brand-charcoal/70">Manage tailoring schedules and consultation requests.</p>
        </div>
        <div className="flex bg-brand-bone rounded overflow-hidden border border-brand-espresso/10">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`p-2 px-4 flex items-center gap-2 text-xs uppercase tracking-widest ${viewMode === 'calendar' ? 'bg-brand-espresso text-white' : 'text-brand-charcoal hover:bg-brand-charcoal/5'}`}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 px-4 flex items-center gap-2 text-xs uppercase tracking-widest ${viewMode === 'list' ? 'bg-brand-espresso text-white' : 'text-brand-charcoal hover:bg-brand-charcoal/5'}`}
          >
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-brand-espresso/10 overflow-hidden flex-1 flex flex-col relative">
        {viewMode === 'calendar' ? (
          <div className="p-4 h-full min-h-[600px]">
            <style>
              {`
                .rbc-calendar { font-family: inherit; }
                .rbc-event { background-color: #3b2f2f; }
                .rbc-today { background-color: #f8f6f0; }
                .rbc-toolbar button { font-family: inherit; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; }
                .rbc-toolbar button.rbc-active { background-color: #3b2f2f; color: white; border-color: #3b2f2f; }
              `}
            </style>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day']}
              onSelectEvent={(event: any) => {
                toast(`${event.title} at ${event.resource.time || 'All Day'} - Status: ${event.resource.status}`);
              }}
            />
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bone border-b border-brand-espresso/10 sticky top-0 z-10">
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Client</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Date & Time</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Type</th>
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
                {appointments.map((apt) => (
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
        )}
      </div>
    </div>
  );
}
