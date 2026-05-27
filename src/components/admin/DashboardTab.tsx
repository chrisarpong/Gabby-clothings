import React from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { TrendingUp, Users, ShoppingBag, Calendar, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const dummyRevenueData = [
  { name: 'Jan', revenue: 12000, orders: 40 },
  { name: 'Feb', revenue: 15000, orders: 55 },
  { name: 'Mar', revenue: 10000, orders: 35 },
  { name: 'Apr', revenue: 22000, orders: 80 },
  { name: 'May', revenue: 18000, orders: 60 },
  { name: 'Jun', revenue: 25000, orders: 90 },
];

const resentActivity = [
  { action: "New custom tailoring order", client: "Eleanor Vance", time: "2 hours ago", amount: "GH₵3,200" },
  { action: "Scheduled fitting appointment", client: "Arthur Pendelton", time: "4 hours ago", amount: "-" },
  { action: "Purchased 'Midnight Noir Suit'", client: "Sofia Rossi", time: "5 hours ago", amount: "GH₵1,850" },
  { action: "Restocked 'Ivory Silk Thread'", client: "System", time: "1 day ago", amount: "-" },
];

export default function DashboardTab() {
  const stats = useQuery(api.analytics.getDashboardStats);

  if (stats === undefined) return <div className="p-8 font-sans animate-pulse">Loading dashboard...</div>;

  const kpis = [
    { label: "Total Revenue", value: `GH₵${stats.totalRevenue.toLocaleString()}`, trend: "+12.5%", isPositive: true, icon: TrendingUp },
    { label: "Total Orders", value: stats.totalOrders.toString(), trend: "+5.1%", isPositive: true, icon: ShoppingBag },
    { label: "Active Clients", value: stats.totalClients.toString(), trend: "+8.2%", isPositive: true, icon: Users },
    { label: "Pending Appointments", value: stats.upcomingAppointments.toString(), trend: "-2.0%", isPositive: false, icon: Calendar },
  ];

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-on-surface-variant">Real-time metrics and performance of your maison.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">{kpi.label}</span>
              <div className="p-2 bg-surface rounded-sm border border-outline-variant/30 text-primary">
                 <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-3xl font-serif text-primary">{kpi.value}</span>
              <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 ${kpi.isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/30 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-serif text-xl tracking-tight text-primary">Revenue Trends</h3>
             <select className="bg-surface-container/30 border border-outline-variant/30 text-xs py-1 px-2 font-sans focus:outline-none">
                <option>Last 6 Months</option>
                <option>This Year</option>
             </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dummyRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C1B1F" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1C1B1F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} tickFormatter={(val) => `GH₵${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb', fontFamily: 'Inter' }}
                  itemStyle={{ color: '#1C1B1F', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1C1B1F" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-outline-variant/30 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-serif text-xl tracking-tight text-primary">Recent Activity</h3>
             <Activity className="w-4 h-4 text-outline" />
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {resentActivity.map((log, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                  <span className="font-sans text-sm text-primary font-medium">{log.action}</span>
                  <div className="flex justify-between items-center text-xs text-on-surface-variant font-sans">
                     <span>{log.client} • {log.time}</span>
                     {log.amount !== '-' && <span className="font-mono bg-surface-container/20 px-2 py-0.5">{log.amount}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-6 w-full py-2 border border-outline-variant/50 text-xs tracking-widest uppercase font-label hover:bg-surface-container/20 transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
}
