import { motion } from 'framer-motion';
import { useState } from 'react';
import { Show, RedirectToSignIn } from '@clerk/react';
import { TextField } from '@mui/material';
import { Button } from '../components/ui/Button';

const Account = () => {
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    inseam: '',
    shoulder: '',
    neck: ''
  });

  const muiBrandStyles = {
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': { borderColor: '#3a1f1d' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#3a1f1d' },
  };

  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
      <Show when="signed-in">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-[100vh] w-full bg-[#F5F5F3]"
          style={{ paddingTop: '130px', paddingLeft: '5%', paddingRight: '5%', paddingBottom: '5rem' }}
        >
          <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-12">
            {/* Left Sidebar */}
            <div className="flex flex-col gap-6 border-r border-[#e0e0e0] pr-6">
              <h2 className="text-[#3a1f1d] font-bold text-lg mb-4 uppercase tracking-widest font-[var(--font-sans)]">Dashboard</h2>
              <button className="text-left font-[var(--font-sans)] text-[#555] hover:text-[#3a1f1d] transition-colors">Order History</button>
              <button className="text-left font-[var(--font-sans)] text-[#3a1f1d] font-semibold border-l-2 border-[#3a1f1d] pl-4">My Measurements</button>
              <button className="text-left font-[var(--font-sans)] text-[#555] hover:text-[#3a1f1d] transition-colors">Settings</button>
            </div>

            {/* Main Area */}
            <div className="flex flex-col bg-white p-8 md:p-12 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h1 className="text-[#3a1f1d] mb-8 italic" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem' }}>
                My Measurements
              </h1>
              <p className="font-[var(--font-sans)] text-[#555] mb-8">
                Save your exact body dimensions so our master tailors can craft your pieces with pinpoint accuracy. All measurements should be in inches.
              </p>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
                {Object.keys(measurements).map((key) => (
                  <TextField 
                    key={key}
                    fullWidth variant="outlined" label={key.toUpperCase()}
                    placeholder={`Enter ${key} in inches`}
                    value={measurements[key as keyof typeof measurements]}
                    onChange={(e) => setMeasurements({...measurements, [key]: e.target.value})}
                    sx={muiBrandStyles}
                  />
                ))}
                
                <div className="md:col-span-2 mt-8">
                  <Button 
                    type="button"
                    style={{ backgroundColor: '#3a1f1d', borderColor: '#3a1f1d', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1.25rem', width: '100%' }}
                  >
                    Save Measurements
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </Show>
    </>
  );
};

export default Account;
