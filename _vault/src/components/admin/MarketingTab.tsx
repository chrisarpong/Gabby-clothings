import { motion } from 'motion/react';

interface MarketingTabProps {
  subscribers: any[];
}

export function MarketingTab({ subscribers }: MarketingTabProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl w-full"
    >
      <header className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">The Audience</h2>
            <h1 className="font-serif text-3xl md:text-4xl">Gazette Subscribers</h1>
          </div>
          <div className="text-left md:text-right">
            <span className="font-serif text-4xl md:text-5xl block">{subscribers?.length.toLocaleString() || 0}</span>
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50">Total Correspondents</span>
          </div>
        </div>
      </header>

      <div className="bg-white border border-espresso/10 p-6 md:p-8 shadow-none rounded-none mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
        <div>
          <h3 className="font-serif text-xl mb-1">Dispatch New Issue</h3>
          <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-espresso/50">Draft the latest atelier missive</p>
        </div>
        <button className="w-full md:w-auto bg-espresso text-white py-3 px-6 font-sans text-[9px] uppercase tracking-[0.4em] hover:bg-espresso/90 transition-colors shadow-none rounded-none">
          Compose
        </button>
      </div>

      <div className="bg-white border border-espresso/10 shadow-none rounded-none overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-espresso/10 bg-bone/30">
              <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Address</th>
              <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Acquisition Date</th>
            </tr>
          </thead>
          <tbody>
            {subscribers?.length > 0 ? subscribers.map((sub, i) => (
              <tr key={i} className="border-b border-espresso/5 hover:bg-bone/20 transition-colors last:border-0 group">
                <td className="py-5 px-6 align-middle">
                  <span className="font-sans text-xs tracking-wider text-espresso opacity-80 group-hover:opacity-100 transition-opacity">{sub.email}</span>
                </td>
                <td className="py-5 px-6 align-middle text-right">
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/60">{new Date(sub._creationTime).toLocaleDateString()}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={2} className="py-16 text-center text-espresso/50">
                  <p className="font-serif text-xl italic mb-2">No correspondents subscribed.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
