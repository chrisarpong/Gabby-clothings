import React from 'react';
import { Mail, Instagram, TrendingUp, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyTrafficData = [
  { name: '10am', visitors: 120 },
  { name: '12pm', visitors: 300 },
  { name: '2pm', visitors: 450 },
  { name: '4pm', visitors: 320 },
  { name: '6pm', visitors: 600 },
  { name: '8pm', visitors: 800 },
];

export default function MarketingTab() {
  return (
    <div className="p-8 font-sans text-brand-charcoal h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Marketing & Analytics</h2>
          <p className="text-sm text-on-surface-variant">Manage newsletter campaigns and monitor store traffic.</p>
        </div>
        <button className="mt-4 md:mt-0 text-xs font-label uppercase tracking-widest px-6 py-2 bg-primary text-surface hover:bg-primary/90 transition-colors">
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-outline-variant/30 p-6 flex flex-col shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3 text-primary">
               <Mail className="w-5 h-5" />
               <h3 className="font-serif tracking-tight text-lg">Newsletter Subscribers</h3>
             </div>
             <span className="text-2xl font-serif text-primary">4,200</span>
           </div>
           <p className="text-sm text-on-surface-variant mb-6 flex-1">Your latest editorial "Shadows of Winter" achieved a 42% open rate.</p>
           <button className="text-xs font-label uppercase tracking-widest border-b border-primary w-fit pb-1 hover:text-primary/70 transition-colors">
             View Subscriber List
           </button>
        </div>

        <div className="bg-white border border-outline-variant/30 p-6 flex flex-col shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <div className="flex items-center gap-3 text-primary">
               <Instagram className="w-5 h-5" />
               <h3 className="font-serif tracking-tight text-lg">Social Conversions</h3>
             </div>
             <span className="text-2xl font-serif text-primary">15%</span>
           </div>
           <p className="text-sm text-on-surface-variant mb-6 flex-1">15% of your sales this week originated from the Instagram Shop integration.</p>
           <button className="text-xs font-label uppercase tracking-widest border-b border-primary w-fit pb-1 hover:text-primary/70 transition-colors">
             Connect Social Accounts
           </button>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-3 text-primary">
             <Users className="w-5 h-5" />
             <h3 className="font-serif text-xl tracking-tight text-primary">Live Store Traffic</h3>
           </div>
           <span className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-green-700">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 42 Active Now
           </span>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyTrafficData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C1B1F" stopOpacity={0.05}/>
                  <stop offset="95%" stopColor="#1C1B1F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb', fontFamily: 'Inter' }}
                itemStyle={{ color: '#1C1B1F', fontWeight: 500 }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#1C1B1F" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
