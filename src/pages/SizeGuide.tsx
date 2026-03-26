import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as const } }),
};

const tabs = ['Agbada & Kaftans', 'Suits & Blazers', 'Shirts & Trousers'];

const agbadaData = {
  headers: ['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)', 'Length (in)', 'Sleeve (in)'],
  rows: [
    ['S', '36–38', '30–32', '36–38', '58', '34'],
    ['M', '39–41', '33–35', '39–41', '60', '35'],
    ['L', '42–44', '36–38', '42–44', '62', '36'],
    ['XL', '45–47', '39–41', '45–47', '64', '37'],
    ['XXL', '48–50', '42–44', '48–50', '66', '38'],
    ['3XL', '51–53', '45–47', '51–53', '68', '39'],
  ],
};

const suitData = {
  headers: ['Size', 'Chest (in)', 'Waist (in)', 'Shoulder (in)', 'Jacket Length (in)', 'Sleeve (in)'],
  rows: [
    ['36R', '36–37', '30–31', '17.5', '29', '32.5'],
    ['38R', '38–39', '32–33', '18', '30', '33'],
    ['40R', '40–41', '34–35', '18.5', '30.5', '33.5'],
    ['42R', '42–43', '36–37', '19', '31', '34'],
    ['44R', '44–45', '38–39', '19.5', '31.5', '34.5'],
    ['46R', '46–47', '40–41', '20', '32', '35'],
  ],
};

const shirtData = {
  headers: ['Size', 'Neck (in)', 'Chest (in)', 'Waist (in)', 'Shirt Length (in)', 'Trouser Waist (in)', 'Inseam (in)'],
  rows: [
    ['S', '14–14.5', '34–36', '28–30', '29', '28–30', '30'],
    ['M', '15–15.5', '38–40', '32–34', '30', '32–34', '31'],
    ['L', '16–16.5', '42–44', '36–38', '31', '36–38', '32'],
    ['XL', '17–17.5', '46–48', '40–42', '32', '40–42', '32'],
    ['XXL', '18–18.5', '50–52', '44–46', '33', '44–46', '33'],
  ],
};

const allData = [agbadaData, suitData, shirtData];

const tips = [
  { title: 'Chest', desc: 'Measure around the fullest part of your chest, keeping the tape parallel to the floor.' },
  { title: 'Waist', desc: 'Measure around your natural waistline — the narrowest part of your torso.' },
  { title: 'Hips', desc: 'Measure around the fullest part of your hips and seat.' },
  { title: 'Inseam', desc: 'Measure from the crotch to the bottom of the ankle, along the inside of the leg.' },
];

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState(0);
  const data = allData[activeTab];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="min-h-screen bg-[#F5F5F3]" style={{ paddingTop: '130px', paddingBottom: '6rem' }}>
      <div className="max-w-5xl mx-auto px-[5%]">

        {/* Header */}
        <motion.div className="mb-14" variants={fadeUp} initial="hidden" animate="visible">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#3a1f1d]/40 mb-3" style={{ fontFamily: "'Jost', sans-serif" }}>Fit Guide</p>
          <h1 className="text-[#3a1f1d] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Measurement & Size Guide
          </h1>
          <div className="h-px bg-[#3a1f1d]/10 max-w-[120px]" />
          <p className="mt-6 text-sm text-[#3a1f1d]/60 max-w-[560px] leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>
            All Gabby Newluk garments are crafted to fit the body with precision. Use the charts below as a starting reference — our tailors will take your exact measurements during your fitting appointment.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div className="flex gap-0 mb-10 border-b border-[#3a1f1d]/10" variants={fadeUp} custom={1} initial="hidden" animate="visible">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors duration-200 ${activeTab === i ? 'border-b-2 border-[#3a1f1d] text-[#3a1f1d]' : 'text-[#3a1f1d]/40 hover:text-[#3a1f1d]/70'}`}
              style={{ fontFamily: "'Jost', sans-serif", marginBottom: '-1px' }}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="overflow-x-auto mb-16">
          <table className="w-full text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
            <thead>
              <tr className="border-b border-[#3a1f1d]/10">
                {data.headers.map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-[10px] uppercase tracking-widest text-[#3a1f1d]/50 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className={`border-b border-[#3a1f1d]/06 ${i % 2 === 0 ? 'bg-white/50' : ''}`}>
                  {row.map((cell, j) => (
                    <td key={j} className={`py-3.5 px-4 text-sm ${j === 0 ? 'font-semibold text-[#3a1f1d]' : 'text-[#3a1f1d]/70'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* How To Measure */}
        <motion.div variants={fadeUp} custom={2} initial="hidden" animate="visible">
          <h2 className="text-2xl italic text-[#3a1f1d] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>How to Take Your Measurements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tips.map((tip, i) => (
              <div key={tip.title} className="flex gap-5 pb-8 border-b border-[#3a1f1d]/08">
                <span className="text-[10px] uppercase tracking-widest text-[#3a1f1d]/30 mt-0.5 w-4 flex-shrink-0" style={{ fontFamily: "'Jost', sans-serif" }}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-sm font-semibold text-[#3a1f1d] mb-1" style={{ fontFamily: "'Jost', sans-serif" }}>{tip.title}</p>
                  <p className="text-sm text-[#3a1f1d]/60 leading-relaxed" style={{ fontFamily: "'Jost', sans-serif" }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 bg-[#3a1f1d] text-[#F5F5F3] p-8">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: "'Jost', sans-serif" }}>Not Sure?</p>
            <p className="text-sm leading-relaxed text-white/70 mb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
              Our tailors will take all necessary measurements during your appointment. Simply book a session and leave the rest to us.
            </p>
            <a href="/book-appointment" className="text-xs uppercase tracking-widest text-white border-b border-white/40 pb-0.5 hover:border-white transition-colors" style={{ fontFamily: "'Jost', sans-serif" }}>
              Book an Appointment →
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SizeGuide;
