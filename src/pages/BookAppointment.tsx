import { motion } from 'framer-motion';

const BookAppointment = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-[100vh] w-full bg-[#F5F5F3]"
      style={{ paddingTop: '130px', paddingLeft: '5%', paddingRight: '5%', paddingBottom: '5rem' }}
    >
      <h1 
        className="text-[#3a1f1d] text-center mb-12 italic" 
        style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem' }}
      >
        Book a Private Fitting
      </h1>
      <div 
        className="w-full max-w-[1000px] mx-auto min-h-[600px] bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        Embed Calendly or Acuity Scheduling Widget Here
      </div>
    </motion.div>
  );
};

export default BookAppointment;
