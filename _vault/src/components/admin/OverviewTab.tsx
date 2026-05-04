import { useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

interface OverviewTabProps {
  orders: any[];
  stats: any;
  clients: any[];
}

export function OverviewTab({ orders, stats, clients }: OverviewTabProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  const recentOrders = useMemo(() => {
    return orders?.slice(0, 3) || [];
  }, [orders]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-6xl w-full"
    >
      <motion.header variants={itemVariants} className="mb-8 md:mb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4">
          <div>
            <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">Q2 Executive Summary</h2>
            <h1 className="font-serif text-3xl md:text-5xl">Atelier Ledger</h1>
          </div>
          <p className="font-sans text-[10px] md:text-xs tracking-[0.1em] text-espresso/80">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </motion.header>

      {/* KPI Grid - Asymmetrical Editorial Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-espresso/10 border border-espresso/10 mb-16 shadow-none rounded-none">
        
        <motion.div variants={itemVariants} className="bg-white p-8 md:col-span-2 shadow-none rounded-none">
          <div className="flex flex-col h-full justify-between">
            <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50">Capital Retention</h3>
            <div className="mt-8">
              <span className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight break-all">
                ₵{(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <div className="flex items-center space-x-2 mt-4 text-espresso/60 flex-wrap">
                <ArrowUpRight strokeWidth={1} className="w-4 h-4 shrink-0" />
                <span className="font-sans text-[10px] md:text-xs tracking-widest uppercase">Gross Asset Evaluation</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 shadow-none rounded-none flex flex-col justify-between">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50">Patron Network</h3>
          <div className="mt-8">
            <span className="font-serif text-4xl">{clients?.length || 0}</span>
            <p className="font-sans text-xs tracking-widest text-espresso/60 mt-2 uppercase">Verified Private Clientele</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 shadow-none rounded-none">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50">Total Commissions</h3>
          <div className="mt-8 flex justify-between items-end">
            <span className="font-serif text-4xl">{stats?.totalOrders || 0}</span>
            <span className="font-sans text-[9px] uppercase tracking-[0.2em] border-b border-espresso pb-1 text-espresso">
              Active Registry
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-8 md:col-span-2 shadow-none rounded-none flex flex-col justify-between">
          <h3 className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/50">Latest Admission</h3>
          <div className="mt-8">
            <span className="font-serif text-3xl">
              {recentOrders[0] ? `${recentOrders[0].shippingAddress.firstName} ${recentOrders[0].shippingAddress.lastName}` : 'No recent activity'}
            </span>
          </div>
        </motion.div>

      </div>

      {/* Recent Activity Minimap */}
      <motion.section variants={itemVariants} className="border-t border-espresso/10 pt-12">
        <h3 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-8">Recent Admissions</h3>
        <div className="space-y-4">
          {recentOrders.length > 0 ? recentOrders.map((order: any) => (
            <div key={order._id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-espresso/5 pb-4 last:border-0 hover:bg-white/40 transition-colors px-2 -mx-2 gap-2 md:gap-0">
              <div className="flex gap-8 md:gap-12 w-full md:w-2/3">
                <span className="font-sans text-[10px] tracking-[0.2em] uppercase w-20 md:w-24 shrink-0 text-espresso/50">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                <span className="font-serif text-base">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>
              </div>
              <div className="flex gap-4 md:gap-12 w-full md:w-1/3 justify-between md:justify-end items-center pl-28 md:pl-0">
                <span className="font-serif italic text-sm md:text-base">₵{order.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                <span className="font-sans text-[9px] tracking-[0.3em] uppercase border border-espresso/20 px-2 py-1 bg-white shadow-none rounded-none">{order.status}</span>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-espresso/50">
              <p className="font-serif text-lg italic mb-1">No recent admissions.</p>
              <p className="font-sans text-[8px] tracking-[0.2em] uppercase">The ledger waits.</p>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
