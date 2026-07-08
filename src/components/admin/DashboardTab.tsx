import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { TrendingUp, Users, ShoppingBag, Calendar, Activity, AlertTriangle, Plus, Tag, Settings, ChevronRight, UserPlus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message || 'An unexpected error occurred' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 font-sans flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertTriangle className="w-10 h-10 text-primary/50 mb-4" />
          <h3 className="font-serif text-xl text-primary mb-2">Dashboard Unavailable</h3>
          <p className="text-sm text-on-surface-variant max-w-md mb-6">
            {this.state.error.includes('Admin') || this.state.error.includes('Unauth')
              ? 'Your session may have expired or your admin permissions are still syncing. Please refresh the page.'
              : 'Something went wrong while loading the dashboard. Please refresh the page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
            className="px-6 py-2.5 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardContent() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');
  const [greeting, setGreeting] = useState('Good day');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  if (stats === undefined || stats === null) {
    return (
      <div className="p-8 font-sans space-y-8 bg-surface-container-lowest min-h-full">
        <div className="h-10 bg-surface-variant/30 animate-pulse rounded-md w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-variant/30 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-surface-variant/30 animate-pulse rounded-xl" />
          <div className="h-[400px] bg-surface-variant/30 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  const monthlyData = stats.monthlyRevenue ?? [];
  const thisMonth = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1] : { revenue: 0, orders: 0 };
  const lastMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : { revenue: 0, orders: 0 };
  
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const revGrowth = calculateGrowth(thisMonth.revenue, lastMonth.revenue);
  const ordGrowth = calculateGrowth(thisMonth.orders, lastMonth.orders);

  const kpis = [
    { label: "Total Revenue", value: `GH₵${(stats.totalRevenue ?? 0).toLocaleString()}`, icon: TrendingUp, trend: revGrowth },
    { label: "Total Orders", value: String(stats.totalOrders ?? 0), icon: ShoppingBag, trend: ordGrowth },
    { label: "Active Clients", value: String(stats.totalClients ?? 0), icon: Users, trend: null },
    { label: "Pending Appointments", value: String(stats.upcomingAppointments ?? 0), icon: Calendar, trend: null },
  ];

  return (
    <div className="p-6 md:p-10 font-sans text-brand-charcoal h-full bg-surface-container-lowest overflow-y-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-outline-variant/30">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary mb-2 tracking-tight">
            {greeting}, Admin
          </h2>
          <p className="text-sm text-on-surface-variant font-medium">
            Here's what's happening at your maison today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="text-xs tracking-widest uppercase text-on-surface-variant font-label">{kpi.label}</span>
              <div className="p-2.5 bg-surface rounded-xl border border-outline-variant/30 text-primary shadow-sm group-hover:bg-primary group-hover:text-surface transition-colors">
                 <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-auto relative z-10">
              <span className="text-3xl md:text-4xl font-serif text-primary tracking-tight">{kpi.value}</span>
              
              {kpi.trend !== null && (
                <div className={`flex items-center gap-1 text-[10px] font-bold tracking-wider px-2 py-1 rounded-md bg-surface-variant/30 text-primary`}>
                  {kpi.trend >= 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
             <div>
               <h3 className="font-serif text-2xl tracking-tight text-primary mb-1">Performance Trends</h3>
               <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Last 6 Months</span>
             </div>
             
             <div className="flex bg-surface-variant/20 p-1 rounded-lg">
                <button 
                  onClick={() => setChartMode('revenue')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${chartMode === 'revenue' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Revenue
                </button>
                <button 
                  onClick={() => setChartMode('orders')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${chartMode === 'orders' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Orders
                </button>
             </div>
          </div>
          
          <div className="h-[320px] w-full flex-1">
            {monthlyData.some((m: any) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1C1B1F" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#1C1B1F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} 
                    tickFormatter={(val) => chartMode === 'revenue' ? `GH₵${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}` : val} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontFamily: 'Inter', padding: '12px 16px' }}
                    itemStyle={{ color: '#1C1B1F', fontWeight: 600, fontSize: '16px' }}
                    labelStyle={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                    formatter={(value: any) => [chartMode === 'revenue' ? `GH₵${Number(value).toLocaleString()}` : value, chartMode === 'revenue' ? 'Revenue' : 'Orders']}
                  />
                  <Area type="monotone" dataKey={chartMode} stroke="#1C1B1F" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" activeDot={{ r: 6, fill: '#1C1B1F', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-on-surface-variant text-sm italic bg-surface-variant/10 rounded-xl border border-dashed border-outline-variant/50">
                <TrendingUp className="w-8 h-8 mb-3 opacity-20" />
                No data available yet — complete your first sale!
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col">
            <h3 className="font-serif text-xl tracking-tight text-primary mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group">
                <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Add Product</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group">
                <Tag className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Promotion</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group">
                <UserPlus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider uppercase">New Client</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group">
                <Settings className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Settings</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-serif text-xl tracking-tight text-primary">Recent Activity</h3>
               <Activity className="w-4 h-4 text-outline" />
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {(stats.recentActivity ?? []).length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-sm italic">No recent activity.</div>
              ) : (
                <div className="space-y-5">
                  {(stats.recentActivity ?? []).map((log: any, i: number) => {
                    const isCancelled = log.action.toLowerCase().includes('cancel');
                    const isNew = log.action.toLowerCase().includes('new');
                    
                    return (
                    <div key={i} className="flex gap-4 group">
                      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-surface-variant/50 text-primary`}>
                        {isCancelled ? <XCircle className="w-4 h-4" /> : 
                         isNew ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col flex-1 border-b border-outline-variant/20 pb-4 group-last:border-0 group-last:pb-0">
                        <span className="font-sans text-sm text-primary font-semibold">{log.action}</span>
                        <span className="text-xs text-on-surface-variant mt-0.5">{log.client}</span>
                        <div className="flex justify-between items-center mt-2">
                           <span className="text-[10px] uppercase tracking-wider text-outline font-bold">{log.time}</span>
                           {log.amount !== '-' && <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded-md text-primary font-medium">{log.amount}</span>}
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
            <button className="w-full mt-4 py-3 text-xs uppercase tracking-widest text-primary font-bold hover:bg-surface-variant/20 rounded-xl transition-colors flex items-center justify-center gap-2">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardTab() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
