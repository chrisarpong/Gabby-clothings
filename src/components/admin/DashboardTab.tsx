import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { TrendingUp, Users, ShoppingBag, Calendar, Activity, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Error boundary to catch query errors gracefully
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
          <AlertTriangle className="w-10 h-10 text-amber-500 mb-4" />
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

  // undefined = query still loading, null = auth not ready yet — show skeleton for both
  if (stats === undefined || stats === null) {
    return (
      <div className="p-8 font-sans space-y-8">
        <div className="h-10 bg-surface-variant/30 animate-pulse rounded-sm w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-variant/30 animate-pulse rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[350px] bg-surface-variant/30 animate-pulse rounded-sm" />
          <div className="h-[350px] bg-surface-variant/30 animate-pulse rounded-sm" />
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Revenue", value: `GH₵${(stats.totalRevenue ?? 0).toLocaleString()}`, icon: TrendingUp },
    { label: "Total Orders", value: String(stats.totalOrders ?? 0), icon: ShoppingBag },
    { label: "Active Clients", value: String(stats.totalClients ?? 0), icon: Users },
    { label: "Pending Appointments", value: String(stats.upcomingAppointments ?? 0), icon: Calendar },
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
            <div className="flex items-baseline mt-auto">
              <span className="text-3xl font-serif text-primary">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart — Real monthly revenue */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/30 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-serif text-xl tracking-tight text-primary">Revenue Trends</h3>
             <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Last 6 Months</span>
          </div>
          <div className="h-[300px] w-full">
            {(stats.monthlyRevenue ?? []).some((m: any) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1C1B1F" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1C1B1F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} tickFormatter={(val) => `GH₵${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb', fontFamily: 'Inter' }}
                    itemStyle={{ color: '#1C1B1F', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1C1B1F" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant text-sm italic">No revenue data yet — complete your first sale!</div>
            )}
          </div>
        </div>

        {/* Recent Activity — Real orders */}
        <div className="bg-white border border-outline-variant/30 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-serif text-xl tracking-tight text-primary">Recent Activity</h3>
             <Activity className="w-4 h-4 text-outline" />
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {(stats.recentActivity ?? []).length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant text-sm italic">No recent activity.</div>
            ) : (
              <div className="space-y-6">
                {(stats.recentActivity ?? []).map((log: any, i: number) => (
                  <div key={i} className="flex flex-col gap-1 border-b border-outline-variant/20 pb-4 last:border-0 last:pb-0">
                    <span className="font-sans text-sm text-primary font-medium">{log.action}</span>
                    <div className="flex justify-between items-center text-xs text-on-surface-variant font-sans">
                       <span>{log.client} • {log.time}</span>
                       {log.amount !== '-' && <span className="font-mono bg-surface-container/20 px-2 py-0.5">{log.amount}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
