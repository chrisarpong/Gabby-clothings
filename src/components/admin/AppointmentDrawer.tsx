import React, { useState, useEffect } from 'react';
import { useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { X, Calendar, Video, Edit2, DollarSign, Tag, ClipboardList, CheckCircle, MessageCircle, MapPin, AlertCircle } from 'lucide-react';

interface AppointmentDrawerProps {
  appointment: any | null;
  onClose: () => void;
}

export default function AppointmentDrawer({ appointment, onClose }: AppointmentDrawerProps) {
  const updateStatus = useMutation(api.appointments.updateStatus);
  const updateDetails = useMutation(api.appointments.updateDetails);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [fabricSelection, setFabricSelection] = useState('');
  const [styleNotes, setStyleNotes] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [paymentReference, setPaymentReference] = useState('');
  const [measurementsCaptured, setMeasurementsCaptured] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  
  useEffect(() => {
    if (appointment) {
      setAdminNotes(appointment.adminNotes || '');
      setFabricSelection(appointment.fabricAndStyling?.fabric || '');
      setStyleNotes(appointment.fabricAndStyling?.styleNotes || '');
      setDepositAmount(appointment.depositAmount || appointment.amountPaid || '');
      setPaymentReference(appointment.paymentReference || appointment.paystackReference || '');
      setMeasurementsCaptured(appointment.measurementsCaptured || false);
      setMeetLink(appointment.meetLink || '');
    }
  }, [appointment]);

  if (!appointment) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsSubmitting(true);
      await updateStatus({ id: appointment._id, status: newStatus });
      toast.success(`Appointment marked as ${newStatus}`);
      appointment.status = newStatus; // Optimistic update
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDetails = async () => {
    try {
      setIsSubmitting(true);
      await updateDetails({
        appointmentId: appointment._id,
        adminNotes,
        fabricAndStyling: { fabric: fabricSelection, styleNotes },
        depositAmount: depositAmount ? Number(depositAmount) : undefined,
        paystackReference: paymentReference,
        measurementsCaptured,
      });
      toast.success("Details updated successfully");
    } catch (e) {
      toast.error("Failed to update details");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-brand-charcoal/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-brand-espresso/10 flex justify-between items-start sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-serif text-2xl text-brand-espresso mb-1">
              {appointment.appointmentType || 'Consultation'}
            </h2>
            <p className="font-sans text-xs tracking-widest uppercase text-brand-charcoal/50">
              {appointment.date} {appointment.time ? `at ${appointment.time}` : ''}
            </p>
            {appointment.targetEventDate && (
              <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-widest ${
                Math.ceil((new Date(appointment.targetEventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) <= 7
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                <AlertCircle className="w-3 h-3" />
                Target Event: {appointment.targetEventDate} 
                ({Math.ceil((new Date(appointment.targetEventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days left)
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-bone rounded-full transition-colors text-brand-charcoal/50 hover:text-brand-charcoal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-8 font-sans">
          
          {/* Client Snapshot */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Client Snapshot
            </h3>
            <div className="bg-brand-bone/30 p-4 border border-brand-espresso/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Name</p>
                  <p className="font-medium text-brand-espresso text-sm">{appointment.name || appointment.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Contact</p>
                  <p className="text-sm text-brand-charcoal">{appointment.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-brand-charcoal">{appointment.phone}</p>
                    <a 
                      href={`https://wa.me/${appointment.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${appointment.name || appointment.clientName}, your appointment for ${appointment.garmentType} is confirmed for ${appointment.date}. - Gabby Newluk`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600 hover:text-green-700 p-1 bg-green-50 rounded"
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                {appointment.garmentType && (
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Garment Type</p>
                    <p className="text-sm text-brand-charcoal capitalize">{appointment.garmentType}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Client Notes</p>
                    <p className="text-sm text-brand-charcoal/80 italic">"{appointment.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Local Logistics & Geography */}
          {(appointment.ghanaPostGps || appointment.landmarks) && (
            <section>
              <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Logistics
              </h3>
              <div className="bg-brand-bone/10 p-4 border border-brand-charcoal/10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointment.ghanaPostGps && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">GhanaPost GPS</p>
                    <p className="text-lg font-medium text-brand-espresso tracking-wider">{appointment.ghanaPostGps}</p>
                  </div>
                )}
                {appointment.landmarks && (
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Landmarks & Directions</p>
                    <p className="text-sm text-brand-charcoal/80">{appointment.landmarks}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Workflow Actions */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Status Workflow
            </h3>
            <div className="flex gap-3">
              <span className={`text-xs uppercase tracking-widest px-3 py-2 border ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-brand-bone text-brand-charcoal/70 border-brand-espresso/10'}`}>
                Current: {appointment.status}
              </span>
              
              {appointment.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusUpdate('confirmed')} disabled={isSubmitting} className="text-xs uppercase tracking-widest px-4 py-2 bg-brand-espresso text-brand-bone hover:bg-brand-charcoal transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleStatusUpdate('cancelled')} disabled={isSubmitting} className="text-xs uppercase tracking-widest px-4 py-2 border border-brand-charcoal/20 text-brand-charcoal hover:bg-red-50 hover:text-red-600 transition-colors">
                    Decline
                  </button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <button onClick={() => handleStatusUpdate('completed')} disabled={isSubmitting} className="text-xs uppercase tracking-widest px-4 py-2 bg-brand-charcoal text-white hover:bg-black transition-colors">
                  Mark Completed
                </button>
              )}
            </div>
          </section>
 
          {/* Payments & Deposits Tracker */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Deposit & Payment Tracker
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Deposit Amount (GH₵)</label>
                <input 
                  type="number" 
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-white border border-brand-espresso/10 text-sm p-2 focus:outline-none focus:border-brand-espresso"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Payment Reference (e.g. Paystack)</label>
                <input 
                  type="text" 
                  value={paymentReference} 
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-white border border-brand-espresso/10 text-sm p-2 focus:outline-none focus:border-brand-espresso"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              {(appointment.paymentStatus === 'paid' || paymentReference) ? (
                <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 inline-block">
                  ✓ Payment Verified
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setPaymentReference('MANUAL_MOMO_OVERRIDE');
                    setDepositAmount(depositAmount || 500);
                  }}
                  className="text-[10px] uppercase tracking-widest px-3 py-2 border border-brand-espresso/20 text-brand-espresso hover:bg-brand-espresso hover:text-white transition-colors"
                >
                  Mark Paid via Manual MoMo
                </button>
              )}
            </div>
          </section>

          {/* Fabric & Style Lookbook */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Fabric & Styling Choices
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Selected Fabric</label>
                <input 
                  type="text" 
                  placeholder="e.g. Super 120s Italian Wool, Navy Blue"
                  value={fabricSelection} 
                  onChange={(e) => setFabricSelection(e.target.value)}
                  className="w-full bg-white border border-brand-espresso/10 text-sm p-2 focus:outline-none focus:border-brand-espresso"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-brand-charcoal/50 mb-1">Styling Notes</label>
                <textarea 
                  placeholder="e.g. Peak lapels, double breasted, silk lining..."
                  rows={2}
                  value={styleNotes} 
                  onChange={(e) => setStyleNotes(e.target.value)}
                  className="w-full bg-white border border-brand-espresso/10 text-sm p-2 focus:outline-none focus:border-brand-espresso resize-none"
                />
              </div>
            </div>
          </section>

          {/* Master Tailor Notes */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Consultation Notes
            </h3>
            <textarea 
              placeholder="Internal notes for the atelier team..."
              rows={4}
              value={adminNotes} 
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full bg-brand-bone/30 border border-brand-espresso/10 text-sm p-3 focus:outline-none focus:border-brand-espresso resize-none"
            />
            <div className="mt-4 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="measurements"
                checked={measurementsCaptured}
                onChange={(e) => setMeasurementsCaptured(e.target.checked)}
                className="w-4 h-4 text-brand-espresso border-brand-espresso/30 rounded-none focus:ring-brand-espresso"
              />
              <label htmlFor="measurements" className="text-xs text-brand-charcoal">Client measurements have been captured and saved</label>
            </div>
          </section>

          {/* Meeting Link */}
          {meetLink && (
            <section>
              <h3 className="text-xs tracking-widest uppercase text-brand-charcoal/70 mb-3 flex items-center gap-2">
                <Video className="w-4 h-4" /> Meeting Link
              </h3>
              <a href={meetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm bg-blue-50 border border-blue-100 px-4 py-2 inline-block">
                Join Google Meet
              </a>
            </section>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-brand-espresso/10 bg-brand-bone/10 flex justify-end gap-4 sticky bottom-0">
          <button onClick={onClose} className="px-6 py-3 text-xs uppercase tracking-widest border border-brand-charcoal/20 text-brand-charcoal hover:bg-brand-bone transition-colors">
            Close
          </button>
          <button onClick={handleSaveDetails} disabled={isSubmitting} className="px-6 py-3 text-xs uppercase tracking-widest bg-brand-espresso text-brand-bone hover:bg-brand-charcoal transition-colors">
            {isSubmitting ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
