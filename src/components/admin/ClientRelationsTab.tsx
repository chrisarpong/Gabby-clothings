import { Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Client Relations
        </h2>
        <p className="text-sm text-[#3a1f1d]/60 mt-1">Appointments and concierge requests</p>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-base font-semibold text-[#2C1816]">Upcoming Appointments</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Date</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Time</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Client</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Contact</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Status</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments === undefined ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#3a1f1d]/40">Loading appointments...</TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-[#3a1f1d]/40">No appointments found.</TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => (
                <TableRow key={apt._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors">
                  <TableCell className="py-4 px-6 font-medium text-[#2C1816]">{apt.date}</TableCell>
                  <TableCell className="py-4 px-6 text-[#3a1f1d]/70">{apt.time}</TableCell>
                  <TableCell className="py-4 px-6 font-medium text-[#2C1816]">{apt.name}</TableCell>
                  <TableCell className="py-4 px-6 text-sm text-[#3a1f1d]/70">{apt.phone || apt.email}</TableCell>
                  <TableCell className="py-4 px-6">
                    <select 
                      value={apt.status}
                      onChange={(e) => handleAppointmentStatus(apt._id, e.target.value)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3a1f1d]/20 ${statusColors[apt.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    {apt.status === 'approved' ? (
                      <button className="text-xs font-medium text-[#3a1f1d] hover:text-[#2C1816] transition-colors">
                        Send Reminder
                      </button>
                    ) : (
                      <span className="text-xs text-[#3a1f1d]/30">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-[#2C1816]">Concierge Requests</h3>
          <span className="text-xs text-[#3a1f1d]/50">{activeMessages.length} active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {messages === undefined ? (
            <div className="col-span-full py-12 text-center text-[#3a1f1d]/40">Loading requests...</div>
          ) : activeMessages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#3a1f1d]/40">No active requests.</div>
          ) : (
            activeMessages.map((msg) => (
              <div key={msg._id} className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-[#2C1816]">{msg.name}</h4>
                  <Mail className="text-[#3a1f1d]/30 w-4 h-4" />
                </div>
                <p className="text-sm text-[#3a1f1d]/70 leading-relaxed flex-1 mb-4">"{msg.message}"</p>
                <div className="flex justify-between items-center pt-4 border-t border-[#3a1f1d]/8">
                  <span className="text-xs text-[#3a1f1d]/40">
                    {new Date(msg._creationTime).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleResolveMessage(msg._id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Resolve <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
