import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import img5 from '../assets/5.jpg';

const services = [
  {
    id: 'bespoke',
    title: 'Bespoke Consultation',
    duration: '90 min',
    price: 'Complimentary',
    description: 'A one-on-one session with our master tailor to discuss your vision, take measurements, and select fabrics for your custom piece.',
  },
  {
    id: 'fitting',
    title: 'Private Fitting',
    duration: '60 min',
    price: 'Complimentary',
    description: 'Try on your commissioned garment with our tailor for final adjustments, ensuring the perfect silhouette and drape.',
  },
  {
    id: 'styling',
    title: 'Personal Styling',
    duration: '120 min',
    price: 'GHS 500',
    description: 'Our creative director curates a full look from our collections, tailored to your personality, occasion, and body type.',
  },
  {
    id: 'bridal',
    title: 'Bridal & Events',
    duration: '120 min',
    price: 'By Quotation',
    description: 'Comprehensive consultation for wedding parties and special occasions — from groomsmen coordinated sets to ceremonial agbadas.',
  },
];

const timeSlots = [
  '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const BookAppointment = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitted(true);
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#F5F5F3]"
    >
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: '55vh', minHeight: '400px' }}>
        <img src={img5} alt="Atelier" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <motion.div
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <p
            className="uppercase tracking-[0.35em] text-white/60 text-xs mb-5"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            The Gabby Newluk Clothing
          </p>
          <h1
            className="text-white mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
              lineHeight: 1.1,
            }}
          >
            Book Your Appointment
          </h1>
          <p
            className="text-white/70 max-w-[480px] leading-relaxed"
            style={{ fontFamily: "'Jost', sans-serif", fontSize: '1rem' }}
          >
            Experience the art of bespoke tailoring.
            Select a service, choose your time, and let us craft something extraordinary for you.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="w-full" style={{ padding: '6rem 6% 8rem' }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-[700px] mx-auto text-center"
              style={{ padding: '5rem 2rem' }}
            >
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#3a1f1d] flex items-center justify-center"
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2
                className="text-[#3a1f1d] mb-4"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.5rem' }}
              >
                Appointment Confirmed
              </h2>
              <p
                className="text-[#3a1f1d]/70 mb-2 leading-relaxed"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                Thank you, <strong>{formData.name || 'Valued Client'}</strong>. Your{' '}
                <strong>{services.find(s => s.id === selectedService)?.title}</strong> has been
                scheduled for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
              </p>
              <p
                className="text-[#3a1f1d]/50 text-sm mb-8"
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                A confirmation email will be sent to {formData.email || 'your inbox'} shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setSelectedService(null);
                  setSelectedDate('');
                  setSelectedTime(null);
                  setFormData({ name: '', email: '', phone: '', notes: '' });
                }}
                className="border border-[#3a1f1d] text-[#3a1f1d] uppercase tracking-widest text-xs hover:bg-[#3a1f1d] hover:text-white transition-colors duration-300"
                style={{ padding: '12px 32px', fontFamily: "'Jost', sans-serif" }}
              >
                Book Another
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="max-w-[1200px] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Step 1: Service Selection */}
              <motion.div
                className="mb-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-5 mb-12">
                  <span
                    className="w-10 h-10 rounded-full bg-[#3a1f1d] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    1
                  </span>
                  <h2
                    className="text-[#3a1f1d]"
                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.8rem' }}
                  >
                    Select Your Service
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`text-left p-8 border transition-all duration-300 rounded-sm ${selectedService === service.id
                          ? 'border-[#3a1f1d] bg-[#3a1f1d] text-white shadow-lg'
                          : 'border-[#d5d0c8] bg-white hover:border-[#3a1f1d]/40 hover:shadow-md'
                        }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3
                          className="font-semibold text-base"
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          {service.title}
                        </h3>
                        <span
                          className={`text-xs uppercase tracking-wider ${selectedService === service.id ? 'text-white/70' : 'text-[#3a1f1d]/50'
                            }`}
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          {service.duration}
                        </span>
                      </div>
                      <p
                        className={`text-sm leading-[1.7] mb-4 ${selectedService === service.id ? 'text-white/80' : 'text-[#3a1f1d]/60'
                          }`}
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        {service.description}
                      </p>
                      <span
                        className={`text-xs uppercase tracking-wider font-semibold ${selectedService === service.id ? 'text-white' : 'text-[#3a1f1d]'
                          }`}
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        {service.price}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Step 2: Date & Time */}
              <motion.div
                className="mb-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-5 mb-12">
                  <span
                    className="w-10 h-10 rounded-full bg-[#3a1f1d] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    2
                  </span>
                  <h2
                    className="text-[#3a1f1d]"
                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.8rem' }}
                  >
                    Choose Date & Time
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Date Picker */}
                  <div className="flex flex-col gap-4">
                    <label
                      className="text-[#3a1f1d]/70 uppercase tracking-wider text-xs font-semibold"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      min={getMinDate()}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white border border-[#d5d0c8] py-4 px-5 text-sm text-[#3a1f1d] outline-none focus:border-[#3a1f1d] transition-colors rounded-sm"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      required
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="flex flex-col gap-4">
                    <label
                      className="text-[#3a1f1d]/70 uppercase tracking-wider text-xs font-semibold"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      Preferred Time
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3.5 px-3 text-xs border transition-all duration-200 rounded-sm ${selectedTime === slot
                              ? 'border-[#3a1f1d] bg-[#3a1f1d] text-white'
                              : 'border-[#d5d0c8] bg-white text-[#3a1f1d] hover:border-[#3a1f1d]/40'
                            }`}
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3: Your Details */}
              <motion.div
                className="mb-24"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-5 mb-12">
                  <span
                    className="w-10 h-10 rounded-full bg-[#3a1f1d] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                  >
                    3
                  </span>
                  <h2
                    className="text-[#3a1f1d]"
                    style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.8rem' }}
                  >
                    Your Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px]">
                  <div className="flex flex-col gap-3">
                    <label className="text-[#3a1f1d]/70 uppercase tracking-wider text-xs font-semibold" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kofi Mensah"
                      className="w-full bg-white border border-[#d5d0c8] py-4 px-5 text-sm text-[#3a1f1d] placeholder:text-[#aaa] outline-none focus:border-[#3a1f1d] transition-colors rounded-sm"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[#3a1f1d]/70 uppercase tracking-wider text-xs font-semibold" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="kofi@example.com"
                      className="w-full bg-white border border-[#d5d0c8] py-4 px-5 text-sm text-[#3a1f1d] placeholder:text-[#aaa] outline-none focus:border-[#3a1f1d] transition-colors rounded-sm"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[#3a1f1d]/70 uppercase tracking-wider text-xs font-semibold" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full bg-white border border-[#d5d0c8] py-4 px-5 text-sm text-[#3a1f1d] placeholder:text-[#aaa] outline-none focus:border-[#3a1f1d] transition-colors rounded-sm"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-2">
                    <label className="text-[#3a1f1d]/70 uppercase tracking-wider text-xs font-semibold" style={{ fontFamily: "'Jost', sans-serif" }}>
                      Additional Notes
                    </label>
                    <textarea
                      rows={5}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Tell us about the occasion, preferences, or any special requirements..."
                      className="w-full bg-white border border-[#d5d0c8] py-4 px-5 text-sm text-[#3a1f1d] placeholder:text-[#aaa] outline-none focus:border-[#3a1f1d] transition-colors resize-none rounded-sm"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div
                className="flex flex-col items-center text-center pt-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <button
                  type="submit"
                  disabled={!selectedService || !selectedDate || !selectedTime}
                  className={`uppercase tracking-widest text-xs transition-all duration-300 ${selectedService && selectedDate && selectedTime
                      ? 'bg-[#3a1f1d] text-white hover:bg-black cursor-pointer'
                      : 'bg-[#d5d0c8] text-[#999] cursor-not-allowed'
                    }`}
                  style={{ padding: '18px 56px', fontFamily: "'Jost', sans-serif", letterSpacing: '0.15em' }}
                >
                  Confirm Appointment
                </button>
                <p
                  className="text-[#3a1f1d]/40 text-xs mt-6 max-w-[400px]"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                >
                  By booking, you agree to our cancellation policy. Appointments can be rescheduled up to 24 hours in advance.
                </p>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BookAppointment;
