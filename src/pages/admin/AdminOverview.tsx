import React from 'react';
import { ArrowUpRight, ArrowDownRight, Package, Users, Scissors, DollarSign, Activity, ChevronRight, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
  const kpis = [
    { label: 'Gross Revenue', value: '$124,500', change: '+12.5%', isPositive: true, icon: DollarSign, period: 'vs last month' },
    { label: 'Active Orders', value: '42', change: '+5.2%', isPositive: true, icon: Package, period: 'vs last month' },
    { label: 'Upcoming Fittings', value: '18', change: '-2.1%', isPositive: false, icon: Scissors, period: 'vs last week' },
    { label: 'New Clients', value: '12', change: '+8.4%', isPositive: true, icon: Users, period: 'this month' },
  ];

  const recentActivity = [
    { id: 1, message: 'New custom suit order placed by M. Sterling', time: '10 mins ago', type: 'Order', status: 'pending' },
    { id: 2, message: 'Client A. Okafor updated measurements', time: '1 hour ago', type: 'Client', status: 'updated' },
    { id: 3, message: 'Fitting scheduled for D. Chen (Oct 24)', time: '3 hours ago', type: 'Appointment', status: 'scheduled' },
    { id: 4, message: 'Order #1019 shipped via Express Delivery', time: '5 hours ago', type: 'Fulfillment', status: 'completed' },
    { id: 5, message: 'Inventory alert: Navy Wool Silk blend low', time: '1 day ago', type: 'Inventory', status: 'alert' },
  ];

  return (
    <div className="p-10 max-w-[1600px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end mb-12 shrink-0">
        <div>
          <h1 className="font-serif text-4xl text-primary tracking-tight">Overview</h1>
          <p className="font-label text-xs tracking-[0.2em] uppercase text-outline mt-3">Executive Summary & Activity</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface border border-outline-variant/30 text-primary px-6 py-3 font-label text-[10px] tracking-[0.2em] uppercase hover:bg-surface-variant transition-colors">
            Export Report
          </button>
          <button className="bg-primary text-on-primary px-6 py-3 font-label text-[10px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity">
            New Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0 overflow-auto pb-10">
        
        {/* Left Column (Main Data) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="bg-surface border border-outline-variant/30 p-8 flex flex-col justify-between group hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container/50 flex items-center justify-center">
                      <kpi.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="font-label text-[10px] tracking-widest text-outline uppercase">{kpi.label}</span>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-primary">
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="font-serif text-4xl text-primary">{kpi.value}</span>
                    <span className={`flex items-center gap-1 font-label text-[11px] tracking-wider ${kpi.isPositive ? 'text-[#2C6E2C] dark:text-[#A0CBA0]' : 'text-[#822C2C] dark:text-[#CBA0A0]'}`}>
                      {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {kpi.change}
                    </span>
                  </div>
                  <span className="font-label text-[9px] tracking-widest text-outline uppercase">{kpi.period}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="bg-surface border border-outline-variant/30 flex-1 p-8 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-serif text-xl text-primary">Revenue Trend</h2>
              <select className="bg-transparent font-label text-[10px] tracking-widest uppercase text-outline focus:outline-none focus:text-primary cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-end gap-2 relative">
              {/* Y-Axis Lines Backdrop */}
              <div className="absolute inset-0 flex flex-col justify-between z-0 pointer-events-none">
                {[0, 1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="w-full h-px bg-outline-variant/10"></div>
                ))}
              </div>
              
              {/* Bars */}
              {[35, 45, 30, 60, 85, 55, 75].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 group z-10 h-full justify-end cursor-crosshair">
                  <div className="w-full max-w-[48px] bg-surface-container relative h-[85%] flex items-end overflow-hidden">
                    <div 
                      className="w-full bg-primary/20 group-hover:bg-primary transition-all duration-500 ease-out" 
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="font-label text-[10px] tracking-widest text-outline">
                    {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Activity Feed & Quick Actions) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          <div className="bg-surface border border-outline-variant/30 flex-1 flex flex-col">
            <div className="p-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/10">
              <h2 className="font-serif text-xl text-primary flex items-center gap-3">
                <Activity className="w-5 h-5 text-outline" /> Activity Log
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
              {recentActivity.map((activity, i) => (
                <div key={activity.id} className="relative pl-6 group">
                  {/* Timeline line */}
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-[-24px] w-px bg-outline-variant/20" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-outline-variant/30 group-hover:bg-primary transition-colors z-10" />
                  
                  <div className="mb-1">
                    <span className="inline-block px-2 py-0.5 bg-surface-container text-primary font-label text-[9px] tracking-widest uppercase mb-2">
                      {activity.type}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-primary leading-relaxed mb-2 pr-4">{activity.message}</p>
                  <span className="font-label text-[9px] tracking-widest text-outline uppercase">{activity.time}</span>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container/10">
              <button className="w-full flex items-center justify-center gap-2 py-3 font-label text-[10px] tracking-[0.2em] uppercase text-primary hover:bg-surface-variant transition-colors">
                View All Activity <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
