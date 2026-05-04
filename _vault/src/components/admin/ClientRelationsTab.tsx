import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { SlideOut } from './SlideOut';

export function ClientRelationsTab() {
  const appointments = useQuery(api.appointments.getAppointmentsAdmin) || [];
  const updateAppointmentStatus = useMutation(api.appointments.updateAppointmentStatus);
  const messages = useQuery(api.contact.getMessages) || [];
  const updateMessageStatus = useMutation(api.contact.updateMessageStatus);

  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  const handleAppointmentAction = async (id: any, status: string) => {
    try {
      await updateAppointmentStatus({ id, status });
    } catch (error) {
      console.error("Failed to update appointment:", error);
    }
  };

  const handleMessageAction = async (id: any, status: string) => {
    try {
      await updateMessageStatus({ id, status });
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error("Failed to update message:", error);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl w-full"
      >
        <header className="mb-8 md:mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
            <div>
              <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">The Liaison</h2>
              <h1 className="font-serif text-3xl md:text-4xl">Private Consultations</h1>
            </div>
          </div>
        </header>

        <div className="space-y-16">
          {/* APPOINTMENTS SECTION */}
          <section>
            <h3 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/50 mb-8">Scheduled Fittings</h3>
            <div className="space-y-6">
              {appointments.length === 0 ? (
                <div className="py-16 text-center text-espresso/50 border border-dashed border-espresso/20">
                  <p className="font-serif text-xl italic mb-2">No consultations scheduled.</p>
                  <p className="font-sans text-[10px] tracking-[0.2em] uppercase">The liaison's ledger is empty.</p>
                </div>
              ) : appointments.map((apt: any) => (
                <div key={apt._id} className="bg-white border border-espresso/10 p-6 md:p-8 shadow-none rounded-none flex flex-col md:flex-row justify-between items-start md:items-center group relative overflow-hidden gap-6 md:gap-0">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-espresso/5 scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-16 w-full md:w-auto">
                    <div className="w-full sm:w-32">
                      <div className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Schedule</div>
                      <div className="font-sans text-xs tracking-widest uppercase text-espresso">{apt.date}</div>
                      <div className="font-serif text-lg italic mt-1">{apt.time}</div>
                    </div>
                    
                    <div>
                      <div className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Patron</div>
                      <div className="font-serif text-2xl text-espresso mb-1">{apt.firstName} {apt.lastName}</div>
                      <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-espresso/60">{apt.type} • {apt.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-center min-w-[120px] w-full md:w-auto mt-4 md:mt-0 pt-4 border-t border-espresso/10 md:border-t-0 md:pt-0">
                    {apt.status === 'pending' ? (
                      <div className="flex space-x-6">
                        <button 
                          onClick={() => handleAppointmentAction(apt._id, 'approved')}
                          className="font-sans text-[9px] uppercase tracking-[0.3em] text-emerald-800/60 hover:text-emerald-900 border-b border-emerald-900/10 hover:border-emerald-900 pb-1 transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAppointmentAction(apt._id, 'cancelled')}
                          className="font-sans text-[9px] uppercase tracking-[0.3em] text-red-800/60 hover:text-red-900 border-b border-red-900/10 hover:border-red-900 pb-1 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className={`font-sans text-[9px] uppercase tracking-[0.4em] border px-3 py-1 bg-espresso/5 ${apt.status === 'approved' ? 'text-emerald-900 border-emerald-900/20' : 'text-red-900 border-red-900/20'}`}>
                        {apt.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MESSAGES SECTION */}
          <section className="pt-8 border-t border-espresso/10">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/50 mb-8">Correspondence Log</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-espresso/10 border border-espresso/10">
              {messages.length === 0 ? (
                <div className="col-span-2 py-16 text-center bg-white text-espresso/50">
                  <p className="font-serif text-xl italic">No correspondence recorded.</p>
                </div>
              ) : messages.map((msg: any) => (
                <div 
                  key={msg._id} 
                  onClick={() => setSelectedMessage(msg)}
                  className="bg-white p-8 group hover:bg-bone transition-colors cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`font-sans text-[8px] uppercase tracking-[0.3em] px-2 py-1 border ${msg.status === 'read' ? 'border-espresso/10 text-espresso/30' : 'border-emerald-900/20 text-emerald-900 bg-emerald-50'}`}>
                      {msg.status === 'read' ? 'Archived' : 'New Dispatch'}
                    </span>
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-espresso/30">{new Date(msg._creationTime).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-serif text-xl text-espresso mb-1">{msg.name}</h4>
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/50 mb-4">{msg.subject}</p>
                  <p className="font-serif italic text-sm text-espresso/70 line-clamp-2">{msg.message}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>

      <SlideOut 
        isOpen={!!selectedMessage} 
        onClose={() => setSelectedMessage(null)}
        title="Correspondence Dossier"
        subtitle={selectedMessage?.name}
      >
        {selectedMessage && (
          <div className="space-y-12">
            <div className="flex justify-between items-start border-b border-espresso/10 pb-6">
              <div>
                <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Subject</h3>
                <p className="font-serif text-xl text-espresso">{selectedMessage.subject}</p>
              </div>
              <div className="text-right">
                <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-1">Status</h3>
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] border border-espresso/20 px-2 py-1">{selectedMessage.status}</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Message Dispatch</h3>
              <p className="font-serif italic text-lg leading-relaxed text-espresso/80 whitespace-pre-wrap">
                "{selectedMessage.message}"
              </p>
            </div>

            <div>
              <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Patron Details</h3>
              <p className="font-sans text-sm text-espresso">{selectedMessage.email}</p>
              {selectedMessage.phone && <p className="font-sans text-sm text-espresso mt-1">{selectedMessage.phone}</p>}
            </div>

            <div className="pt-8 border-t border-espresso/10 flex gap-4">
              <button 
                onClick={() => handleMessageAction(selectedMessage._id, selectedMessage.status === 'read' ? 'unread' : 'read')}
                className="flex-1 bg-espresso text-white py-4 font-sans text-[10px] uppercase tracking-[0.4em] hover:bg-espresso/90 transition-colors"
              >
                {selectedMessage.status === 'read' ? 'Mark as Dispatch' : 'Archive Correspondence'}
              </button>
            </div>
          </div>
        )}
      </SlideOut>
    </>
  );
}
