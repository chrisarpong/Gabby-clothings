import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { X, Calendar, Video, Edit2, DollarSign, Tag, ClipboardList, CheckCircle, MessageCircle, MapPin, AlertCircle, ShoppingBag } from 'lucide-react';

interface AppointmentDrawerProps {
  appointment: any | null;
  onClose: () => void;
}

export default function AppointmentDrawer({ appointment, onClose }: AppointmentDrawerProps) {
  const updateStatus = useMutation(api.appointments.updateStatus);
  const updateDetails = useMutation(api.appointments.updateDetails);
  const createAdminOrder = useMutation(api.orders.createPOSOrder);
  const products = useQuery(api.products.getAll);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [fabricSelection, setFabricSelection] = useState('');
  const [styleNotes, setStyleNotes] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [paymentReference, setPaymentReference] = useState('');
  const [measurementsCaptured, setMeasurementsCaptured] = useState(false);
  const [meetLink, setMeetLink] = useState('');
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderProductId, setOrderProductId] = useState('');
  const [orderPrice, setOrderPrice] = useState<number | ''>('');

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

  const handleCreateOrder = async () => {
    if (!orderProductId || !orderPrice) {
      toast.error("Please select a product and enter an agreed price.");
      return;
    }
    try {
      setIsSubmitting(true);
      const product = products?.find(p => p._id === orderProductId);
      const price = Number(orderPrice);
      const paid = depositAmount ? Number(depositAmount) : 0;
      
      await createAdminOrder({
        customerDetails: {
          email: appointment.email || appointment.clientEmail,
          firstName: appointment.name?.split(' ')[0] || appointment.clientName?.split(' ')[0] || "Client",
          lastName: appointment.name?.split(' ').slice(1).join(' ') || appointment.clientName?.split(' ').slice(1).join(' ') || "",
          phone: appointment.phone || appointment.clientPhone,
        },
        items: [{
          productId: orderProductId as any,
          variantSku: "custom",
          quantity: 1,
          productName: product?.name || "custom-fit Garment",
          price: price,
        }],
        shippingFee: 0,
        amountPaid: paid,
        amountDue: price - paid,
        isDeposit: paid > 0 && paid < price,
        paymentMethod: 'cash',
      });
      
      // Update appointment status to completed
      await updateStatus({ id: appointment._id, status: 'completed' });
      toast.success("Order created successfully!");
      setShowOrderForm(false);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-primary/30 backdrop-blur-sm transition-opacity">
      <div className="bg-surface-container w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-start sticky top-0 bg-surface-container z-10">
          <div>
            <h2 className="font-serif text-2xl text-primary mb-1">
              {appointment.appointmentType || 'Consultation'}
            </h2>
            <p className="font-sans text-xs tracking-widest uppercase text-on-surface-variant">
              {appointment.date} {appointment.time ? `at ${appointment.time}` : ''}
            </p>
            {appointment.targetEventDate && (
              <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs uppercase tracking-widest ${
                Math.ceil((new Date(appointment.targetEventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) <= 7
                  ? 'bg-red-100 text-red-800 border border-red-900/30' 
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                <AlertCircle className="w-3 h-3" />
                Target Event: {appointment.targetEventDate} 
                ({Math.ceil((new Date(appointment.targetEventDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} Days left)
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-bone rounded-full transition-colors text-on-surface-variant hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 space-y-8 font-sans">
          
          {/* Client Snapshot */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Client Snapshot
            </h3>
            <div className="bg-brand-bone/30 p-4 border border-outline-variant/30">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Name</p>
                  <p className="font-medium text-primary text-sm">{appointment.name || appointment.clientName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Contact</p>
                  <p className="text-sm text-on-surface">{appointment.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-on-surface">{appointment.phone}</p>
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
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Garment Type</p>
                    <p className="text-sm text-on-surface capitalize">{appointment.garmentType}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Client Notes</p>
                    <p className="text-sm text-on-surface/80 italic">"{appointment.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Local Logistics & Geography */}
          {(appointment.ghanaPostGps || appointment.landmarks) && (
            <section>
              <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Logistics
              </h3>
              <div className="bg-brand-bone/10 p-4 border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointment.ghanaPostGps && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">GhanaPost GPS</p>
                    <p className="text-lg font-medium text-primary tracking-wider">{appointment.ghanaPostGps}</p>
                  </div>
                )}
                {appointment.landmarks && (
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Landmarks & Directions</p>
                    <p className="text-sm text-on-surface/80">{appointment.landmarks}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Workflow Actions */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Status Workflow
            </h3>
            <div className="flex gap-3">
              <span className={`text-xs uppercase tracking-widest px-3 py-2 border ${appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-500 border-green-200' : appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-900/30' : 'bg-brand-bone text-on-surface/70 border-outline-variant/30'}`}>
                Current: {appointment.status}
              </span>
              
              {appointment.status === 'pending' && (
                <>
                  <button onClick={() => handleStatusUpdate('confirmed')} disabled={isSubmitting} className="text-xs uppercase tracking-widest px-4 py-2 bg-primary text-brand-bone hover:bg-primary transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleStatusUpdate('cancelled')} disabled={isSubmitting} className="text-xs uppercase tracking-widest px-4 py-2 border border-outline-variant/30 text-on-surface hover:bg-red-950/20 hover:text-red-600 transition-colors">
                    Decline
                  </button>
                </>
              )}
              {appointment.status === 'confirmed' && (
                <button onClick={() => handleStatusUpdate('completed')} disabled={isSubmitting} className="text-xs uppercase tracking-widest px-4 py-2 bg-primary text-white hover:bg-black transition-colors">
                  Mark Completed
                </button>
              )}
            </div>
          </section>
 
          {/* Payments & Deposits Tracker */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Deposit & Payment Tracker
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Deposit Amount (GH₵)</label>
                <input 
                  type="number" 
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Payment Reference (e.g. Paystack)</label>
                <input 
                  type="text" 
                  value={paymentReference} 
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
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
                  className="text-[10px] uppercase tracking-widest px-3 py-2 border border-outline-variant/30 text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Mark Paid via Manual MoMo
                </button>
              )}
            </div>
          </section>

          {/* Fabric & Style Lookbook */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Fabric & Styling Choices
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Selected Fabric</label>
                <input 
                  type="text" 
                  placeholder="e.g. Super 120s Italian Wool, Navy Blue"
                  value={fabricSelection} 
                  onChange={(e) => setFabricSelection(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Styling Notes</label>
                <textarea 
                  placeholder="e.g. Peak lapels, double breasted, silk lining..."
                  rows={2}
                  value={styleNotes} 
                  onChange={(e) => setStyleNotes(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          </section>

          {/* Master Tailor Notes */}
          <section>
            <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Consultation Notes
            </h3>
            <textarea 
              placeholder="Internal notes for the atelier team..."
              rows={4}
              value={adminNotes} 
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full bg-brand-bone/30 border border-outline-variant/30 text-sm p-3 focus:outline-none focus:border-primary resize-none"
            />
            <div className="mt-4 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="measurements"
                checked={measurementsCaptured}
                onChange={(e) => setMeasurementsCaptured(e.target.checked)}
                className="w-4 h-4 text-primary border-primary/30 rounded-none focus:ring-brand-espresso"
              />
              <label htmlFor="measurements" className="text-xs text-on-surface">Client measurements have been captured and saved</label>
            </div>
          </section>

          {/* Meeting Link */}
          {meetLink && (
            <section>
              <h3 className="text-xs tracking-widest uppercase text-on-surface/70 mb-3 flex items-center gap-2">
                <Video className="w-4 h-4" /> Meeting Link
              </h3>
              <a href={meetLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm bg-blue-50 border border-blue-100 px-4 py-2 inline-block">
                Join Google Meet
              </a>
            </section>
          )}

          {/* Admin Create Order */}
          <section className="mt-8 border-t border-outline-variant/30 pt-8">
             {!showOrderForm ? (
               <button 
                 onClick={() => setShowOrderForm(true)}
                 className="flex items-center gap-2 text-xs uppercase tracking-widest px-4 py-3 bg-primary text-white hover:bg-black transition-colors"
               >
                 <ShoppingBag className="w-4 h-4" /> Create Order from Appointment
               </button>
             ) : (
               <div className="bg-brand-bone/30 p-6 border border-outline-variant/30">
                 <h3 className="font-serif text-xl text-primary mb-4">Create Commission Order</h3>
                 <div className="space-y-4">
                   <div>
                     <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Select Base Product/Template</label>
                     <select 
                       value={orderProductId} 
                       onChange={(e) => setOrderProductId(e.target.value)}
                       className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                     >
                       <option value="">-- Select Product --</option>
                       {products?.map(p => (
                         <option key={p._id} value={p._id}>{p.name}</option>
                       ))}
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Agreed Final Price (GH₵)</label>
                     <input 
                       type="number" 
                       value={orderPrice} 
                       onChange={(e) => setOrderPrice(e.target.value ? Number(e.target.value) : '')}
                       className="w-full bg-surface-container border border-outline-variant/30 text-sm p-2 focus:outline-none focus:border-primary"
                       placeholder="e.g. 1500"
                     />
                   </div>
                   <div className="flex gap-4 pt-4">
                     <button 
                       onClick={handleCreateOrder} 
                       disabled={isSubmitting || !orderProductId || !orderPrice}
                       className="text-xs uppercase tracking-widest px-4 py-2 bg-primary text-brand-bone hover:bg-primary transition-colors disabled:opacity-50"
                     >
                       {isSubmitting ? 'Processing...' : 'Confirm Order'}
                     </button>
                     <button 
                       onClick={() => setShowOrderForm(false)} 
                       className="text-xs uppercase tracking-widest px-4 py-2 border border-outline-variant/30 text-on-surface hover:bg-brand-bone transition-colors"
                     >
                       Cancel
                     </button>
                   </div>
                 </div>
               </div>
             )}
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-outline-variant/30 bg-brand-bone/10 flex justify-end gap-4 sticky bottom-0">
          <button onClick={onClose} className="px-6 py-3 text-xs uppercase tracking-widest border border-outline-variant/30 text-on-surface hover:bg-brand-bone transition-colors">
            Close
          </button>
          <button onClick={handleSaveDetails} disabled={isSubmitting} className="px-6 py-3 text-xs uppercase tracking-widest bg-primary text-brand-bone hover:bg-primary transition-colors">
            {isSubmitting ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
