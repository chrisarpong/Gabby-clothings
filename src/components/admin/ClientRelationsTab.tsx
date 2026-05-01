import React from 'react';
import { Mail, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export const ClientRelationsTab = ({ 
  appointments, 
  updateAppointmentStatus, 
  messages, 
  updateMessageStatus 
}: { 
  appointments: any[], 
  updateAppointmentStatus: any, 
  messages: any[], 
  updateMessageStatus: any 
}) => {
  const activeMessages = messages?.filter(m => m.status === 'unread') || [];

  const handleAppointmentStatus = (appointmentId: string, status: string) => {
    toast.promise(updateAppointmentStatus({ appointmentId: appointmentId as any, status: status as any }), {
      loading: 'Updating status...',
      success: 'Appointment status updated',
      error: 'Failed to update status'
    });
  };

  const handleResolveMessage = (messageId: string) => {
    toast.promise(updateMessageStatus({ messageId: messageId as any, status: 'resolved' }), {
      loading: 'Resolving request...',
      success: 'Concierge request resolved',
      error: 'Failed to resolve request'
    });
  };

  return (
    <div className="w-full">
      <header className="mb-16 border-b border-[#3a1f1d]/10 pb-8">
        <h2 className="text-[32px] font-normal leading-[1.2] text-[#3a1f1d] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Client Relations & Bookings
        </h2>
        <p className="text-[10px] uppercase tracking-[0.05em] text-[#504443]" style={{ fontFamily: "'Jost', sans-serif" }}>
          Tailoring Appointments and Concierge Requests
        </p>
      </header>

      {/* Appointments Section */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-6 border-b border-[#d4c3c1]/30 pb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1a1c1b]" style={{ fontFamily: "'Jost', sans-serif" }}>
            Upcoming Appointments
          </h3>
          <div className="flex gap-4">
            <span className="text-[10px] tracking-[0.05em] text-[#504443] cursor-pointer hover:text-[#1a1c1b] transition-colors uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>Filter</span>
            <span className="text-[10px] tracking-[0.05em] text-[#504443] cursor-pointer hover:text-[#1a1c1b] transition-colors uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>Sort</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#d4c3c1]/30 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#504443] hover:bg-transparent" style={{ fontFamily: "'Jost', sans-serif" }}>
                <TableHead className="py-4 font-normal">Date</TableHead>
                <TableHead className="py-4 font-normal">Time</TableHead>
                <TableHead className="py-4 font-normal">Client</TableHead>
                <TableHead className="py-4 font-normal">Contact</TableHead>
                <TableHead className="py-4 font-normal">Status</TableHead>
                <TableHead className="py-4 font-normal text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[16px] tracking-[0.01em] text-[#1a1c1b] divide-y divide-[#d4c3c1]/10" style={{ fontFamily: "'Jost', sans-serif" }}>
              {appointments === undefined ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-[#504443] italic">Loading appointments...</TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-[#504443] italic">No appointments found.</TableCell>
                </TableRow>
              ) : (
                appointments.map((apt) => (
                  <TableRow key={apt._id} className="hover:bg-[#f4f3f1] transition-colors duration-300 group">
                    <TableCell className="py-6 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{apt.date}</TableCell>
                    <TableCell className="py-6 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{apt.time}</TableCell>
                    <TableCell className="py-6 font-medium tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>{apt.name}</TableCell>
                    <TableCell className="py-6 text-[10px] tracking-[0.05em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {apt.phone || apt.email}
                    </TableCell>
                    <TableCell className="py-6">
                      <select 
                        value={apt.status}
                        onChange={(e) => handleAppointmentStatus(apt._id, e.target.value)}
                        className="bg-transparent border-b border-[#827472]/30 text-[#1a1c1b] text-[11px] font-semibold tracking-[0.15em] py-1 focus:ring-0 focus:border-[#1a1c1b] uppercase cursor-pointer"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </TableCell>
                    <TableCell className="py-6 text-right">
                      {apt.status === 'pending' ? (
                        <span className="text-[10px] tracking-[0.05em] text-[#504443] uppercase tracking-widest opacity-50" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Requires Approval
                        </span>
                      ) : (
                        <button className="text-[11px] font-semibold tracking-[0.15em] text-[#1a1c1b] border border-[#827472]/30 px-4 py-2 hover:bg-[#1a1c1b] hover:text-[#faf9f7] transition-colors duration-300 uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Send Reminder
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Concierge Messages Section */}
      <section>
        <div className="flex justify-between items-end mb-6 border-b border-[#d4c3c1]/30 pb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1a1c1b]" style={{ fontFamily: "'Jost', sans-serif" }}>
            Concierge Requests
          </h3>
          <span className="text-[10px] tracking-[0.05em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
            {activeMessages.length} ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {messages === undefined ? (
            <div className="col-span-full py-12 text-center text-[#504443] italic">Loading requests...</div>
          ) : activeMessages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#504443] italic">No active requests.</div>
          ) : (
            activeMessages.map((msg) => (
              <Card key={msg._id} className="border border-[#d4c3c1]/20 p-6 flex flex-col h-full bg-[#ffffff] hover:border-[#827472]/50 transition-colors duration-300 rounded-none shadow-none">
                <CardHeader className="p-0 flex flex-row justify-between items-start mb-4 space-y-0">
                  <CardTitle className="text-xl text-[#1a1c1b] font-normal" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {msg.name}
                  </CardTitle>
                  <Mail className="text-[#827472] w-4 h-4" />
                </CardHeader>
                <CardContent className="p-0 flex-1 mb-8">
                  <p className="text-[16px] tracking-[0.01em] text-[#504443] leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                    "{msg.message}"
                  </p>
                </CardContent>
                <CardFooter className="p-0 mt-auto border-t border-[#d4c3c1]/10 pt-4 flex justify-between items-center">
                  <span className="text-[10px] tracking-[0.05em] text-[#827472] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                    {new Date(msg._creationTime).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleResolveMessage(msg._id)}
                    className="text-[11px] font-semibold tracking-[0.15em] text-[#220b09] hover:text-[#3a1f1d] uppercase transition-colors flex items-center gap-2" 
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    Resolve <Check className="w-4 h-4" />
                  </button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
