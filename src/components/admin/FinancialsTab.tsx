import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyFinancialData = [
  { name: 'Mon', revenue: 4000, expenses: 1200 },
  { name: 'Tue', revenue: 3000, expenses: 1398 },
  { name: 'Wed', revenue: 2000, expenses: 3800 },
  { name: 'Thu', revenue: 2780, expenses: 1908 },
  { name: 'Fri', revenue: 1890, expenses: 1800 },
  { name: 'Sat', revenue: 2390, expenses: 1800 },
  { name: 'Sun', revenue: 3490, expenses: 1300 },
];

export default function FinancialsTab() {
  return (
    <div className="p-8 font-sans text-brand-charcoal h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Financial Overview</h2>
          <p className="text-sm text-on-surface-variant">Revenue, expenses, and accounting records.</p>
        </div>
        <button className="mt-4 md:mt-0 text-xs font-label uppercase tracking-widest px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-surface transition-colors">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label mb-2">Net Revenue (This Week)</span>
          <span className="text-4xl font-serif text-primary mb-2">GH₵19,550</span>
          <div className="flex items-center gap-1 text-xs font-mono text-green-700">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs last week
          </div>
        </div>
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label mb-2">Total Expenses</span>
          <span className="text-4xl font-serif text-primary mb-2">GH₵13,206</span>
          <div className="flex items-center gap-1 text-xs font-mono text-red-700">
            <ArrowUpRight className="w-3 h-3" /> +2.1% vs last week
          </div>
        </div>
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label mb-2">Profit Margin</span>
          <span className="text-4xl font-serif text-primary mb-2">32.4%</span>
          <div className="flex items-center gap-1 text-xs font-mono text-green-700">
            <ArrowUpRight className="w-3 h-3" /> +1.2% vs last week
          </div>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 p-6 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-serif text-xl tracking-tight text-primary">Cash Flow Weekly</h3>
           <CreditCard className="w-4 h-4 text-outline" />
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dummyFinancialData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} tickFormatter={(val) => `GH₵${val/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb', fontFamily: 'Inter' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="revenue" fill="#1C1B1F" radius={[2, 2, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" fill="#9ca3af" radius={[2, 2, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
