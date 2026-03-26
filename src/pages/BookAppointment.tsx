import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import img5 from '../assets/5.jpg';

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: 'bespoke',
    title: 'Bespoke Suit Consultation',
    subtitle: 'Full custom suiting from scratch',
    duration: '90 min',
    deposit: 500,
  },
  {
    id: 'custom-shirting',
    title: 'Custom Shirting & Trousers',
    subtitle: 'Hand-fitted everyday essentials',
    duration: '60 min',
    deposit: 300,
  },
  {
    id: 'alterations',
    title: 'Alterations & Adjustments',
    subtitle: 'Expert tailoring of existing garments',
    duration: '30 min',
    deposit: 150,
  },
];

const TIME_SLOTS = [
  '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StepHeader({ step, label, title }: { step: string; label: string; title: string }) {
  return (
    <motion.div className="mb-12" variants={fadeUp} initial="hidden" animate="visible">
      <span
        className="block text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-2"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {step}
      </span>
      <h2
        className="text-[#3a1f1d] mb-1"
        style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.2rem', lineHeight: 1.15 }}
      >
        {title}
      </h2>
      <p className="text-[#3a1f1d]/50 text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>{label}</p>
      <div className="mt-5 h-px bg-[#3a1f1d]/10" />
    </motion.div>
  );
}

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  delay?: number;
  multiline?: boolean;
  rows?: number;
}

function InputField({ label, type = 'text', value, onChange, placeholder, error, delay = 0, multiline, rows = 4 }: InputFieldProps) {
  const baseClass = `w-full bg-transparent border-0 border-b py-3 px-0 text-base text-[#3a1f1d] placeholder:text-[#3a1f1d]/30 outline-none transition-colors duration-300 rounded-none resize-none ${
    error ? 'border-rose-400 focus:border-rose-600' : 'border-[#3a1f1d]/25 focus:border-[#3a1f1d]'
  }`;
  return (
    <motion.div className="flex flex-col gap-2" variants={fadeUp} custom={delay} initial="hidden" animate="visible">
      <label
        className={`text-[10px] uppercase tracking-[0.25em] transition-colors ${error ? 'text-rose-500' : 'text-[#3a1f1d]/50'}`}
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {label}{error && <span className="ml-2 normal-case tracking-normal not-italic">— required</span>}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
          style={{ fontFamily: "'Jost', sans-serif" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
          style={{ fontFamily: "'Jost', sans-serif" }}
        />
      )}
    </motion.div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function Calendar({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d <= t || d.getDay() === 0; // no Sundays, no past
  };

  const isSelected = (day: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="w-full">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm uppercase tracking-widest text-[#3a1f1d]" style={{ fontFamily: "'Jost', sans-serif" }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center text-[#3a1f1d]/50 hover:text-[#3a1f1d] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] uppercase tracking-widest text-[#3a1f1d]/30 py-1" style={{ fontFamily: "'Jost', sans-serif" }}>{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const disabled = isDisabled(day);
          const sel = isSelected(day);
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={`aspect-square flex items-center justify-center text-sm rounded-full transition-all duration-200 mx-auto w-9 h-9 ${
                sel
                  ? 'bg-[#3a1f1d] text-white'
                  : disabled
                  ? 'text-[#3a1f1d]/20 cursor-not-allowed'
                  : 'text-[#3a1f1d] hover:bg-[#3a1f1d]/8 hover:text-[#3a1f1d]'
              }`}
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function Progress({ step }: { step: number }) {
  const steps = ['Service', 'Date & Time', 'Details', 'Confirm'];
  return (
    <div className="flex items-center justify-center gap-3 mb-12">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-500 ${
              i + 1 < step ? 'bg-[#3a1f1d] text-white' :
              i + 1 === step ? 'bg-[#3a1f1d] text-white ring-4 ring-[#3a1f1d]/15' :
              'bg-[#3a1f1d]/10 text-[#3a1f1d]/40'
            }`} style={{ fontFamily: "'Jost', sans-serif" }}>
              {i + 1 < step ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-[9px] uppercase tracking-widest hidden md:block transition-colors ${
              i + 1 <= step ? 'text-[#3a1f1d]' : 'text-[#3a1f1d]/30'
            }`} style={{ fontFamily: "'Jost', sans-serif" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 md:w-16 transition-all duration-500 ${i + 1 < step ? 'bg-[#3a1f1d]' : 'bg-[#3a1f1d]/15'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Step 2
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 3
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Step 4 / completion
  const [confirmed, setConfirmed] = useState(false);

  const service = SERVICES.find(s => s.id === selectedService);

  const goNext = () => {
    setDirection(1);
    setStep(s => s + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const validateStep3 = () => {
    const e: Record<string, boolean> = {};
    if (!form.firstName.trim()) e.firstName = true;
    if (!form.lastName.trim()) e.lastName = true;
    if (!form.email.trim() || !form.email.includes('@')) e.email = true;
    if (!form.phone.trim()) e.phone = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep3Next = () => {
    if (validateStep3()) goNext();
  };

  const handleConfirm = () => {
    // TODO: trigger Paystack modal here
    setConfirmed(true);
  };

  const formatDate = (d: Date | null) => d
    ? d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-[#F5F5F3]">
      {/* Hero */}
      <div className="relative w-full overflow-hidden" style={{ height: '50vh', minHeight: '360px' }}>
        <img src={img5} alt="Atelier" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
        <motion.div
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
        >
          <p className="uppercase tracking-[0.35em] text-white/50 text-xs mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            The Gabby Newluk Clothing
          </p>
          <h1 className="text-white mb-3" style={{
            fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
            fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.1,
          }}>
            Book Your Appointment
          </h1>
          <p className="text-white/60 max-w-[420px] leading-relaxed text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
            Reserve your private session with our master tailors. Each appointment is your own — unhurried and personal.
          </p>
        </motion.div>
      </div>

      {/* Wizard */}
      <div style={{ padding: '5rem 6% 8rem' }}>
        <div className="max-w-3xl mx-auto">

          {!confirmed ? (
            <>
              <Progress step={step} />

              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  {/* ── STEP 1 ── */}
                  {step === 1 && (
                    <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                      <StepHeader step="Step 01 of 04" label="Choose the service that best fits your needs." title="The Service" />

                      <div className="flex flex-col gap-4">
                        {SERVICES.map((s, i) => (
                          <motion.button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedService(s.id)}
                            variants={fadeUp}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            className={`group text-left w-full border transition-all duration-300 ${
                              selectedService === s.id
                                ? 'border-[#3a1f1d] bg-[#3a1f1d]'
                                : 'border-[#3a1f1d]/15 bg-transparent hover:border-[#3a1f1d]/50 hover:-translate-y-0.5'
                            }`}
                            style={{ padding: '2rem 2.5rem' }}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3
                                  className={`font-semibold text-lg mb-1 transition-colors ${selectedService === s.id ? 'text-[#F5F5F3]' : 'text-[#3a1f1d]'}`}
                                  style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                  {s.title}
                                </h3>
                                <p
                                  className={`text-sm transition-colors ${selectedService === s.id ? 'text-white/60' : 'text-[#3a1f1d]/50'}`}
                                  style={{ fontFamily: "'Jost', sans-serif" }}
                                >
                                  {s.subtitle}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span
                                  className={`block text-xs uppercase tracking-widest mb-1 ${selectedService === s.id ? 'text-white/50' : 'text-[#3a1f1d]/40'}`}
                                  style={{ fontFamily: "'Jost', sans-serif" }}
                                >
                                  {s.duration}
                                </span>
                                <span
                                  className={`block text-xs font-semibold tracking-wide ${selectedService === s.id ? 'text-white/80' : 'text-[#3a1f1d]'}`}
                                  style={{ fontFamily: "'Jost', sans-serif" }}
                                >
                                  GHS {s.deposit} deposit
                                </span>
                              </div>
                            </div>
                            {/* Selection indicator */}
                            <div className={`mt-4 h-px transition-all duration-300 ${selectedService === s.id ? 'bg-white/20' : 'bg-[#3a1f1d]/10'}`} />
                          </motion.button>
                        ))}
                      </div>

                      <div className="mt-12 flex justify-end">
                        <NextButton disabled={!selectedService} onClick={goNext} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2 ── */}
                  {step === 2 && (
                    <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                      <StepHeader step="Step 02 of 04" label="Select a date and time for your private fitting." title="Date & Time" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Calendar */}
                        <motion.div variants={fadeUp} initial="hidden" animate="visible">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-[#3a1f1d]/40 mb-6" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Select Date
                          </p>
                          <Calendar selected={selectedDate} onSelect={setSelectedDate} />
                        </motion.div>

                        {/* Time Slots */}
                        <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-[#3a1f1d]/40 mb-6" style={{ fontFamily: "'Jost', sans-serif" }}>
                            Select Time {!selectedDate && <span className="normal-case tracking-normal not-italic text-[#3a1f1d]/30">— choose a date first</span>}
                          </p>
                          <AnimatePresence>
                            {selectedDate && (
                              <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col gap-3"
                              >
                                {TIME_SLOTS.map((slot, i) => (
                                  <motion.button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedTime(slot)}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.35 }}
                                    className={`w-full py-3.5 px-5 text-sm tracking-wide border rounded-full transition-all duration-200 ${
                                      selectedTime === slot
                                        ? 'bg-[#3a1f1d] text-white border-[#3a1f1d]'
                                        : 'bg-transparent border-[#3a1f1d]/20 text-[#3a1f1d] hover:border-[#3a1f1d]'
                                    }`}
                                    style={{ fontFamily: "'Jost', sans-serif" }}
                                  >
                                    {slot}
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {!selectedDate && (
                            <div className="flex flex-col gap-3">
                              {TIME_SLOTS.map(slot => (
                                <div key={slot} className="w-full py-3.5 px-5 border border-[#3a1f1d]/08 rounded-full bg-[#3a1f1d]/3" />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      </div>

                      <div className="mt-12 flex justify-between">
                        <BackButton onClick={goBack} />
                        <NextButton disabled={!selectedDate || !selectedTime} onClick={goNext} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3 ── */}
                  {step === 3 && (
                    <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                      <StepHeader step="Step 03 of 04" label="Tell us about yourself so we can prepare for your fitting." title="Your Details" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <InputField label="First Name" value={form.firstName} onChange={v => { setForm(f => ({...f, firstName: v})); setErrors(e => ({...e, firstName: false})); }}
                          placeholder="Kofi" error={errors.firstName} delay={0} />
                        <InputField label="Last Name" value={form.lastName} onChange={v => { setForm(f => ({...f, lastName: v})); setErrors(e => ({...e, lastName: false})); }}
                          placeholder="Mensah" error={errors.lastName} delay={1} />
                        <InputField label="Email Address" type="email" value={form.email} onChange={v => { setForm(f => ({...f, email: v})); setErrors(e => ({...e, email: false})); }}
                          placeholder="kofi@example.com" error={errors.email} delay={2} />
                        <InputField label="Phone Number" type="tel" value={form.phone} onChange={v => { setForm(f => ({...f, phone: v})); setErrors(e => ({...e, phone: false})); }}
                          placeholder="+233 XX XXX XXXX" error={errors.phone} delay={3} />
                        <div className="md:col-span-2">
                          <InputField label="Fabrics, Occasions, or Style Notes" value={form.notes} onChange={v => setForm(f => ({...f, notes: v}))}
                            placeholder="Any specific fabrics, occasions, or styles you have in mind? — We'd love to know." delay={4} multiline rows={5} />
                        </div>
                      </div>

                      <div className="mt-12 flex justify-between">
                        <BackButton onClick={goBack} />
                        <NextButton onClick={handleStep3Next} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 4 ── */}
                  {step === 4 && (
                    <motion.div key="step4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
                      <StepHeader step="Step 04 of 04" label="Review your booking and secure your fitting with a deposit." title="Secure Your Fitting" />

                      {/* Summary Pane */}
                      <motion.div variants={fadeUp} initial="hidden" animate="visible"
                        className="bg-white border border-[#3a1f1d]/08 mb-10"
                        style={{ padding: '2.5rem 3rem' }}
                      >
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-6" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Booking Summary
                        </p>
                        <div className="flex flex-col gap-5">
                          {[
                            { label: 'Service', value: service?.title ?? '—' },
                            { label: 'Date', value: formatDate(selectedDate) },
                            { label: 'Time', value: selectedTime ?? '—' },
                            { label: 'Client', value: `${form.firstName} ${form.lastName}` },
                            { label: 'Contact', value: form.email },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-start justify-between gap-8 pb-5 border-b border-[#3a1f1d]/06 last:border-0 last:pb-0">
                              <span className="text-[10px] uppercase tracking-[0.25em] text-[#3a1f1d]/40 flex-shrink-0" style={{ fontFamily: "'Jost', sans-serif" }}>
                                {label}
                              </span>
                              <span className="text-sm text-[#3a1f1d] text-right" style={{ fontFamily: "'Jost', sans-serif" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Deposit Section */}
                      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="visible"
                        className="border border-[#3a1f1d]/12 mb-10"
                        style={{ padding: '2rem 2.5rem', background: 'rgba(58, 31, 29, 0.02)' }}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>
                              Consultation Deposit
                            </p>
                            <p className="text-sm text-[#3a1f1d]/60 leading-relaxed max-w-[380px]" style={{ fontFamily: "'Jost', sans-serif" }}>
                              A refundable deposit is required to secure your slot. This will be deducted from your final garment total.
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="block text-2xl font-semibold text-[#3a1f1d]" style={{ fontFamily: "'Playfair Display', serif" }}>
                              GHS {service?.deposit ?? '—'}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-[#3a1f1d]/40" style={{ fontFamily: "'Jost', sans-serif" }}>
                              Refundable
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* CTA */}
                      <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
                        <button
                          type="button"
                          onClick={handleConfirm}
                          className="w-full bg-[#3a1f1d] text-[#F5F5F3] uppercase tracking-[0.2em] text-sm py-6 hover:bg-black transition-colors duration-300"
                          style={{ fontFamily: "'Jost', sans-serif" }}
                        >
                          Proceed to Payment — GHS {service?.deposit ?? '—'}
                        </button>
                        <p className="text-center text-[#3a1f1d]/30 text-xs mt-5" style={{ fontFamily: "'Jost', sans-serif" }}>
                          Secured via Paystack. Your deposit is refundable up to 48 hours before your appointment.
                        </p>
                      </motion.div>

                      <div className="mt-10 flex justify-start">
                        <BackButton onClick={goBack} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* ── CONFIRMATION ── */
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center"
              style={{ paddingTop: '4rem', paddingBottom: '4rem' }}
            >
              <div className="w-14 h-14 rounded-full bg-[#3a1f1d] flex items-center justify-center mx-auto mb-8">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '2.5rem' }}>
                Fitting Secured
              </h2>
              <p className="text-[#3a1f1d]/60 mb-2 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
                Thank you, <strong>{form.firstName}</strong>. Your <strong>{service?.title}</strong> is confirmed for<br />
                <strong>{formatDate(selectedDate)}</strong> at <strong>{selectedTime}</strong>.
              </p>
              <p className="text-[#3a1f1d]/40 text-sm mt-3 mb-10" style={{ fontFamily: "'Jost', sans-serif" }}>
                A confirmation email will be sent to <strong>{form.email}</strong>.
              </p>
              <button
                onClick={() => {
                  setStep(1); setDirection(1); setSelectedService(null);
                  setSelectedDate(null); setSelectedTime(null);
                  setForm({ firstName: '', lastName: '', email: '', phone: '', notes: '' });
                  setConfirmed(false);
                }}
                className="border border-[#3a1f1d] text-[#3a1f1d] uppercase tracking-widest text-xs hover:bg-[#3a1f1d] hover:text-white transition-colors duration-300"
                style={{ padding: '14px 36px', fontFamily: "'Jost', sans-serif" }}
              >
                Book Another Appointment
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Button helpers ───────────────────────────────────────────────────────────

function NextButton({ disabled = false, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 uppercase tracking-[0.18em] text-xs transition-all duration-300 ${
        disabled
          ? 'text-[#3a1f1d]/25 cursor-not-allowed'
          : 'text-[#3a1f1d] hover:gap-5'
      }`}
      style={{ fontFamily: "'Jost', sans-serif", padding: '14px 0' }}
    >
      Continue
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 uppercase tracking-[0.18em] text-xs text-[#3a1f1d]/40 hover:text-[#3a1f1d] hover:gap-5 transition-all duration-300"
      style={{ fontFamily: "'Jost', sans-serif", padding: '14px 0' }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
      </svg>
      Back
    </button>
  );
}

export default BookAppointment;
