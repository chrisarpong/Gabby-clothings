import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, List, Download, Printer } from 'lucide-react';
import AppointmentDrawer from './AppointmentDrawer';

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
  const assignTailor = useMutation(api.appointments.assignTailor);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedApt, setSelectedApt] = useState<any | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<any>('month');

  const exportToCSV = () => {
    if (!appointments) return;
    const headers = ["Client Name", "Email", "Phone", "Date", "Time", "Type", "Status", "Notes"];
    const rows = appointments.map((apt: any) => [
      `"${(apt.name || apt.clientName || '').replace(/"/g, '""')}"`,
      `"${(apt.email || apt.clientEmail || '').replace(/"/g, '""')}"`,
      `"${(apt.phone || apt.clientPhone || '').replace(/"/g, '""')}"`,
      `"${apt.date || apt.requestedDate || ''}"`,
      `"${(apt.time || '').replace(/"/g, '""')}"`,
      `"${(apt.garmentType || '').replace(/"/g, '""')}"`,
      `"${(apt.status || '').replace(/"/g, '""')}"`,
      `"${(apt.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `appointments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Appointments exported to CSV");
  };

  const handleStatusUpdate = async (id: any, newStatus: string) => {
    try {
      await updateStatus({ id, status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
    } catch (e) {
       toast.error("Failed to update appointment");
    }
  }

  const handleAssignTailor = async (id: any, tailorName: string) => {
    try {
      await assignTailor({ appointmentId: id, tailorName });
      toast.success("Tailor assigned successfully");
    } catch (e) {
      toast.error("Failed to assign tailor");
    }
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  if (appointments === undefined) return <div className="p-8 font-sans">Loading appointments...</div>;

  const events = appointments.map((apt: any) => {
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

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    return (
      <div className="flex justify-between items-center mb-6 bg-brand-bone/30 p-2 border border-brand-espresso/10 rounded">
        <div className="flex gap-1">
          <button className="px-4 py-2 text-[10px] tracking-widest uppercase border border-brand-charcoal/20 text-brand-charcoal hover:border-brand-espresso hover:text-brand-espresso transition-colors bg-white shadow-sm" onClick={goToBack}>Prev</button>
          <button className="px-4 py-2 text-[10px] tracking-widest uppercase border border-brand-charcoal/20 text-brand-charcoal hover:border-brand-espresso hover:text-brand-espresso transition-colors bg-white shadow-sm" onClick={goToCurrent}>Today</button>
          <button className="px-4 py-2 text-[10px] tracking-widest uppercase border border-brand-charcoal/20 text-brand-charcoal hover:border-brand-espresso hover:text-brand-espresso transition-colors bg-white shadow-sm" onClick={goToNext}>Next</button>
        </div>
        <div className="text-xl font-serif text-brand-espresso capitalize">
          {toolbar.label}
        </div>
        <div className="flex gap-1 bg-white p-1 border border-brand-charcoal/10 rounded shadow-sm">
          {['month', 'week', 'day'].map(v => (
            <button 
              key={v}
              className={`px-4 py-1.5 text-[10px] tracking-widest uppercase transition-colors rounded ${toolbar.view === v ? 'bg-brand-espresso text-white' : 'text-brand-charcoal hover:bg-brand-charcoal/5'}`}
              onClick={() => toolbar.onView(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full flex flex-col">
      <div className="flex justify-between items-end mb-8 border-b border-brand-charcoal/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-brand-espresso mb-1">Atelier Appointments</h2>
          <p className="text-sm text-brand-charcoal/70">Manage tailoring schedules and consultation requests.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handlePrintSchedule}
            className="px-4 py-2 flex items-center gap-2 text-xs uppercase tracking-widest border border-brand-espresso text-brand-espresso hover:bg-brand-espresso hover:text-white transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" /> Print Daily Schedule
          </button>
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 flex items-center gap-2 text-xs uppercase tracking-widest border border-brand-espresso text-brand-espresso hover:bg-brand-espresso hover:text-white transition-colors print:hidden"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
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
      </div>
      
      <div className="bg-white border border-brand-espresso/10 overflow-hidden flex-1 flex flex-col relative">
        {viewMode === 'calendar' ? (
          <div className="p-4 h-full min-h-[600px]">
            <style>
              {`
                .rbc-calendar { font-family: inherit; border: none; }
                .rbc-month-view { border: 1px solid rgba(74, 60, 49, 0.1); border-radius: 4px; overflow: hidden; }
                .rbc-header { padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500; color: #666; border-bottom: 1px solid rgba(74, 60, 49, 0.1); }
                .rbc-month-row { border-top: 1px solid rgba(74, 60, 49, 0.1); }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(74, 60, 49, 0.1); }
                .rbc-date-cell { padding-right: 8px; padding-top: 4px; font-size: 12px; font-weight: 500; color: #4a3c31; }
                .rbc-event { background-color: #3b2f2f; border-radius: 2px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; }
                .rbc-today { background-color: #fcfbf9; }
                .rbc-off-range-bg { background-color: #f9f9f9; }
                .rbc-toolbar { display: none; } /* Hide default toolbar as we use CustomToolbar */
              `}
            </style>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day']}
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              view={currentView}
              onView={(view) => setCurrentView(view)}
              components={{
                toolbar: CustomToolbar
              }}
              onSelectEvent={(event: any) => {
                setSelectedApt(event.resource);
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
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Ref. Images</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Assigned Tailor</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Status & Payment</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium">Meet Link</th>
                  <th className="p-4 font-sans text-[10px] tracking-widest uppercase text-brand-charcoal/70 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-brand-charcoal/50 italic text-sm">No upcoming appointments.</td>
                  </tr>
                )}
                {appointments.map((apt: any) => (
                  <tr 
                    key={apt._id} 
                    className="border-b border-brand-espresso/5 hover:bg-brand-bone/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedApt(apt)}
                  >
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
                      {apt.referenceImages && apt.referenceImages.length > 0 ? (
                        <div className="flex gap-1">
                          {apt.referenceImages.map((imgId: string, idx: number) => (
                            <a
                              key={idx}
                              href={`${import.meta.env.VITE_CONVEX_URL?.replace('.cloud', '.site')}/getFile?storageId=${imgId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-[10px] border border-blue-200 px-1.5 py-0.5"
                            >
                              📷 {idx + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-brand-charcoal/30 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        placeholder="Assign Tailor..." 
                        defaultValue={apt.assignedTo || ""}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => handleAssignTailor(apt._id, e.target.value)}
                        className="bg-transparent border-b border-brand-charcoal/20 text-xs py-1 focus:outline-none focus:border-brand-espresso transition-colors print:border-none"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : apt.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'text-brand-charcoal/50 bg-brand-bone'}`}>
                          {apt.status}
                        </span>
                        {apt.paymentStatus === 'paid' && (
                          <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-blue-100 text-blue-800 flex flex-col">
                            PAID {apt.amountPaid ? `(GH₵${apt.amountPaid})` : ''}
                            {apt.paystackReference && <span className="text-[8px] opacity-70">Ref: {apt.paystackReference}</span>}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {apt.meetLink ? (
                        <a href={apt.meetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                          Join Meet
                        </a>
                      ) : (
                        <span className="text-brand-charcoal/30 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {apt.status === 'pending' && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt._id, 'confirmed'); }}
                            className="text-[10px] tracking-widest uppercase py-1 px-3 border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt._id, 'cancelled'); }}
                            className="text-[10px] tracking-widest uppercase py-1 px-3 border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt._id, 'completed'); }}
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

      <AppointmentDrawer 
        appointment={selectedApt} 
        onClose={() => setSelectedApt(null)} 
      />
    </div>
  );
}
