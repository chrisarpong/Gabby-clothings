import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TextField } from '@mui/material';
import { CheckCircle, CalendarDays, Clock, User, Phone } from 'lucide-react';
import Stepper, { Step } from '../components/ui/Stepper';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bookAppointment = useMutation(api.appointments.bookAppointment);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.date || !formData.time) {
        toast.error("Please select both a date and time to continue.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error("Please complete all contact details to continue.");
        return false;
      }
    }
    return true;
  };

  const handleStepChange = (step: number) => {
    if (step === 2) {
      toast.success("Date & Time Saved", {
        description: "Please provide your contact details.",
      });
    } else if (step === 3) {
      toast.success("Details Captured", {
        description: "Review your appointment before confirming.",
      });
    }
  };

  const handleFinalSubmit = async () => {
    try {
      await bookAppointment({
        date: formData.date,
        time: formData.time,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes
      });
      
      // Show success toast
      toast.success("Appointment Confirmed", {
        description: "We look forward to seeing you.",
      });
      
      // Trigger Success Screen
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error("Booking Failed", {
        description: "There was an issue scheduling your appointment.",
      });
    }
  };

  const muiBrandStyles = {
    '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#3a1f1d' } },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
  };

  // ==========================================
  // SUCCESS SCREEN (Renders after completion)
  // ==========================================
  if (isSubmitted) {
    return (
      <div className="min-h-[70vh] bg-[#F9F8F6] flex flex-col items-center justify-center py-20 px-6 relative">
        <div className="flex flex-col items-center text-center max-w-[600px] animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-[#3a1f1d]/5 rounded-full flex items-center justify-center mb-8">
            <CheckCircle className="h-12 w-12 text-[#3a1f1d]" />
          </div>
          <h2 className="text-5xl md:text-6xl font-medium text-[#3a1f1d] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Booking Confirmed
          </h2>
          <p className="text-[15px] text-[#3a1f1d]/70 mb-12 leading-relaxed max-w-[500px]">
            Thank you, {formData.name || 'Christian'}. Your appointment for <strong>{formData.date}</strong> at <strong>{formData.time}</strong> has been successfully scheduled. We will send a confirmation email shortly.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="next-button uppercase tracking-widest text-[11px] mt-2"
          >
            RETURN TO HOMEPAGE
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // BOOKING STEPPER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center py-20 px-4 md:px-6 relative">

      <header style={{ marginTop: '60px', marginBottom: '80px', width: '100%', textAlign: 'center' }}>
        <h1 className="text-4xl md:text-5xl italic font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Book an Appointment
        </h1>
      </header>

      <div className="w-full max-w-[800px]">
        <Stepper
          initialStep={1}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleFinalSubmit}
          validator={validateStep}
          backButtonText="PREVIOUS"
          nextButtonText="CONTINUE"
        >
          {/* STEP 1: DATE & TIME */}
          <Step>
            <div className="flex flex-col gap-8 py-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-[#3a1f1d] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Select Date & Time</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#3a1f1d] ml-1">Appointment Date</label>
                  <TextField fullWidth type="date" name="date" value={formData.date} onChange={handleChange} sx={muiBrandStyles} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.1em] font-medium text-[#3a1f1d] ml-1">Appointment Time</label>
                  <TextField fullWidth type="time" name="time" value={formData.time} onChange={handleChange} sx={muiBrandStyles} />
                </div>
              </div>
            </div>
          </Step>

          {/* STEP 2: CONTACT DETAILS */}
          <Step>
            <div className="flex flex-col gap-8 py-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-[#3a1f1d] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Your Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TextField fullWidth label="FULL NAME" name="name" value={formData.name} onChange={handleChange} sx={muiBrandStyles} />
                <TextField fullWidth label="PHONE NUMBER" name="phone" type="tel" value={formData.phone} onChange={handleChange} sx={muiBrandStyles} />
                <div className="md:col-span-2">
                  <TextField fullWidth label="EMAIL ADDRESS" name="email" type="email" value={formData.email} onChange={handleChange} sx={muiBrandStyles} />
                </div>
              </div>
            </div>
          </Step>

          {/* STEP 3: PREMIUM REVIEW SUMMARY */}
          <Step>
            <div className="flex flex-col gap-6 py-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-medium text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>Review & Confirm</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mt-4">
                
                {/* Date Component Card */}
                <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[180px] md:min-h-[200px] p-6 md:p-8 rounded-3xl border border-[#3a1f1d]/10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#3a1f1d]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                  <div className="h-12 w-12 bg-[#F9F8F6] rounded-full flex shrink-0 items-center justify-center border border-[#3a1f1d]/5 hover:scale-110 transition-transform duration-300">
                    <CalendarDays className="h-5 w-5 text-[#3a1f1d]/80" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50">Appointment Date</span>
                    <span className="text-xl md:text-2xl font-medium text-[#3a1f1d] mt-1">{formData.date || 'Pending Selection'}</span>
                  </div>
                </div>

                {/* Time Component Card */}
                <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[180px] md:min-h-[200px] p-6 md:p-8 rounded-3xl border border-[#3a1f1d]/10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#3a1f1d]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                  <div className="h-12 w-12 bg-[#F9F8F6] rounded-full flex shrink-0 items-center justify-center border border-[#3a1f1d]/5 hover:scale-110 transition-transform duration-300">
                    <Clock className="h-5 w-5 text-[#3a1f1d]/80" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50">Appointment Time</span>
                    <span className="text-xl md:text-2xl font-medium text-[#3a1f1d] mt-1">{formData.time || 'Pending Selection'}</span>
                  </div>
                </div>

                {/* Name Component Card */}
                <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[180px] md:min-h-[200px] p-6 md:p-8 rounded-3xl border border-[#3a1f1d]/10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#3a1f1d]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                  <div className="h-12 w-12 bg-[#F9F8F6] rounded-full flex shrink-0 items-center justify-center border border-[#3a1f1d]/5 hover:scale-110 transition-transform duration-300">
                    <User className="h-5 w-5 text-[#3a1f1d]/80" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50">Client Name</span>
                    <span className="text-xl md:text-2xl font-medium text-[#3a1f1d] mt-1 text-center">{formData.name || 'Pending Selection'}</span>
                  </div>
                </div>

                {/* Contact Component Card */}
                <div className="flex flex-col items-center justify-center text-center gap-4 min-h-[180px] md:min-h-[200px] p-6 md:p-8 rounded-3xl border border-[#3a1f1d]/10 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-[#3a1f1d]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
                  <div className="h-12 w-12 bg-[#F9F8F6] rounded-full flex shrink-0 items-center justify-center border border-[#3a1f1d]/5 hover:scale-110 transition-transform duration-300">
                    <Phone className="h-5 w-5 text-[#3a1f1d]/80" />
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 w-full">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-50">Client Contact</span>
                    <span className="text-xl md:text-2xl font-medium text-[#3a1f1d] mt-1 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap max-w-[90%] text-center">{formData.phone || formData.email || 'Pending Selection'}</span>
                  </div>
                </div>

              </div>
            </div>
          </Step>

        </Stepper>
      </div>
    </div>
  );
};

export default BookAppointment;