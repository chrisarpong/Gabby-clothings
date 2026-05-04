import { useMemo } from 'react';
import { motion } from 'motion/react';

interface FinancialsTabProps {
  orders: any[];
}

export function FinancialsTab({ orders }: FinancialsTabProps) {
  const stats = useMemo(() => {
    if (!orders) return { total: 0, count: 0 };
    const completedOrders = orders.filter(o => o.status.toLowerCase() === 'completed');
    const total = completedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    return {
      total,
      count: completedOrders.length
    };
  }, [orders]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl w-full"
    >
      <header className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">The Vault</h2>
            <h1 className="font-serif text-3xl md:text-4xl">Fiscal Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Dramatic Valuation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-espresso/10 border border-espresso/10 mb-16 shadow-none rounded-none">
        <div className="bg-white p-8 md:p-12 shadow-none rounded-none overflow-hidden">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50 mb-6">Gross Proceeds (Total)</h3>
          <span className="font-serif text-4xl sm:text-5xl md:text-7xl tracking-tighter block leading-none break-all">
            ₵{stats.total.toLocaleString()}<span className="text-xl md:text-3xl text-espresso/40">.00</span>
          </span>
        </div>
        <div className="bg-white p-8 md:p-12 shadow-none rounded-none overflow-hidden">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50 mb-6">Completed Commissions</h3>
          <span className="font-serif text-4xl sm:text-5xl md:text-7xl tracking-tighter block leading-none">
            {stats.count}<span className="text-xl md:text-3xl text-espresso/40"> units</span>
          </span>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div>
        <h3 className="font-serif text-2xl mb-8">Completed Ledger</h3>
        <div className="bg-white border border-espresso/10 shadow-none rounded-none overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-espresso/10 bg-bone/30">
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Reference</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Date</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Description</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {orders?.filter(o => o.status.toLowerCase() === 'completed').length > 0 ? orders.filter(o => o.status.toLowerCase() === 'completed').map((order: any) => (
                <tr key={order._id} className="border-b border-espresso/5 hover:bg-bone/20 transition-colors last:border-0 group">
                  <td className="py-5 px-6 align-middle">
                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/70">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-espresso/70">{new Date(order._creationTime).toLocaleDateString()}</span>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <span className="font-serif text-lg text-espresso group-hover:italic transition-all">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>
                  </td>
                  <td className="py-5 px-6 align-middle text-right">
                    <span className="font-serif text-md tracking-wide">₵{order.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-espresso/50">
                    <p className="font-serif text-xl italic mb-2">No completed transactions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
