import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Scissors, FileText, Check, AlertCircle } from 'lucide-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';

export default function AdminAppointments() {
  const appointments = useQuery(api.appointments.getUpcoming) || [];
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    if (appointments.length > 0 && !selectedAppointment) {
      setSelectedAppointment(appointments[0]);
    }
  }, [appointments, selectedAppointment]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left List */}
      <div className="w-1/3 border-r border-outline-variant/30 bg-surface flex flex-col min-w-[320px]">
        <div className="p-8 border-b border-outline-variant/30 shrink-0">
          <h1 className="font-serif text-3xl text-primary">Appointments</h1>
          <p className="font-label text-xs tracking-widest uppercase text-outline mt-2">Custom Tailoring Schedule</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {appointments.map((apt) => (
            <div 
              key={apt._id}
              onClick={() => setSelectedAppointment(apt)}
              className={`p-6 border-b border-outline-variant/30 cursor-pointer transition-colors ${
                selectedAppointment?._id === apt._id 
                  ? 'bg-surface-container/50 border-l-2 border-l-primary' 
                  : 'hover:bg-surface-container/20 border-l-2 border-l-transparent'
              }`}
            >
              <h3 className="font-sans text-base font-medium text-primary mb-3">{apt.name}</h3>
              <div className="flex flex-col gap-2 font-label text-[10px] tracking-widest uppercase text-outline">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  {apt.date}
                </div>
                <div className="flex items-center gap-2 text-primary mt-1">
                  <Scissors className="w-3 h-3" />
                  {apt.garmentType}
                </div>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="p-6 text-outline font-sans text-sm">
              No upcoming appointments.
            </div>
          )}
        </div>
      </div>

      {/* Right Details Pane */}
      <div className="flex-1 bg-surface-container/10 overflow-y-auto p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-serif text-4xl text-primary mb-2">{selectedAppointment?.name}</h2>
              <div className="flex items-center gap-4 font-label text-[11px] tracking-widest uppercase text-outline">
                <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {selectedAppointment?.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedAppointment?._creationTime ? new Date(selectedAppointment._creationTime).toLocaleTimeString() : ''}</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 font-label text-[10px] tracking-widest uppercase bg-surface-container text-primary rounded-sm">
              <Check className="w-3 h-3" /> {selectedAppointment?.status || 'Upcoming'}
            </span>
          </div>

          <div className="h-px w-full bg-outline-variant/30 mb-8" />

          {/* Client Measurement Card */}
          <div className="bg-surface border border-outline-variant/30 mb-8">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/20">
              <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                <Scissors className="w-5 h-5 text-outline" /> Client Measurements
              </h3>
              <button onClick={() => toast.success("Editor triggered for values")} className="font-label text-[10px] tracking-widest uppercase text-primary hover:text-outline transition-colors underline underline-offset-4">
                Edit Values
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6">
                {[
                  { label: 'Neck', value: '15.5"' },
                  { label: 'Chest', value: '40.0"' },
                  { label: 'Waist', value: '34.0"' },
                  { label: 'Hips', value: '41.5"' },
                  { label: 'Shoulder', value: '18.0"' },
                  { label: 'Sleeve', value: '25.0"' },
                  { label: 'Inseam', value: '31.5"' },
                  { label: 'Total Length', value: '30.0"' },
                ].map((measure) => (
                  <div key={measure.label}>
                    <div className="font-label text-[10px] tracking-widest uppercase text-outline mb-1">
                      {measure.label}
                    </div>
                    <div className="font-serif text-xl text-primary">
                      {measure.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Master Tailor Notes */}
          <div className="bg-surface border border-outline-variant/30">
            <div className="p-6 border-b border-outline-variant/30 bg-surface-container/20">
              <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-outline" /> Tailor's Notes
              </h3>
            </div>
            <div className="p-6 md:p-8">
              <p className="font-sans text-sm text-primary leading-relaxed mb-4">
                Client requested a slight taper on the trousers from the knee down. The jacket shoulders should be softly structured—no heavy padding. Preferred break on the trousers is a medium break.
              </p>
              <div className="flex items-center gap-2 bg-surface-variant/50 border border-outline-variant/30 p-3 mt-6">
                <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="font-label text-[10px] tracking-widest uppercase text-primary">
                  Attention: Client has a slightly dropped right shoulder (adjust pattern by -0.25").
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
