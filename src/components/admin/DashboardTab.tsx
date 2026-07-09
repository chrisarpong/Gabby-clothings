import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { TrendingUp, Users, ShoppingBag, Calendar, Activity, AlertTriangle, Plus, Tag, Settings, ChevronRight, UserPlus, CheckCircle, XCircle, Clock, ShieldCheck, Printer, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

type TabKey = 'dashboard' | 'orders' | 'inventory' | 'clients' | 'appointments' | 'news' | 'reviews' | 'financials' | 'marketing' | 'promotions' | 'settings' | 'content';

// Colors for Pie Chart
const COLORS = ['#352421', '#827472', '#d4c3c1', '#735c00'];

function DashboardContent({ setActiveTab, adminName }: { setActiveTab?: (tab: TabKey) => void, adminName?: string }) {
  const stats = useQuery(api.analytics.getDashboardStats);
  const adminLogs = useQuery(api.adminLogs.getRecentLogs, { limit: 100 });
  const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');
  const [greeting, setGreeting] = useState('Good day');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrintLogs = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let html = `
      <html>
      <head>
        <title>Admin Activity Log</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
          h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; }
          .time { color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h1>GABBY NEWLUK - Admin Activity Log</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Admin Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    (adminLogs || []).forEach((log: any) => {
      html += `
        <tr>
          <td class="time">${new Date(log._creationTime).toLocaleString()}</td>
          <td>${log.adminName}</td>
          <td>${log.action}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

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

  // Dummy data for Pie Chart if we don't have real order statuses in analytics stats
  // In a real scenario, we'd query orders and group by status. We'll simulate based on recent orders.
  const pieData = [
    { name: 'Pending', value: 45 },
    { name: 'Processing', value: 30 },
    { name: 'Shipped', value: 20 },
    { name: 'Delivered', value: 5 },
  ];

  return (
    <div className="p-6 md:p-10 font-sans text-on-surface h-full bg-surface-container-lowest overflow-y-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-outline-variant/30">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary tracking-tight">
            {greeting}, {adminName || 'Admin'}
          </h2>
        </div>
        
        {/* Dynamic Clock Widget */}
        <div className="mt-4 md:mt-0 flex items-center justify-between w-full md:w-auto bg-surface-container border border-outline-variant/30 rounded-xl px-4 md:px-5 py-3 shadow-sm">
           <div className="flex flex-col mr-4 md:mr-6 border-r border-outline-variant/30 pr-4 md:pr-6">
             <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Local Time</span>
             <span className="font-mono text-xs md:text-sm text-primary font-medium tracking-tight">
               {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}
             </span>
           </div>
           <div className="flex items-center gap-1.5 md:gap-2">
             <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
             <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-primary font-bold">Secure Session</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-surface-container backdrop-blur-md border border-outline-variant/30 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
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
        
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-surface-container backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
             <div>
               <h3 className="font-serif text-2xl tracking-tight text-primary mb-1">Performance Trends</h3>
               <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Last 6 Months</span>
             </div>
             
             <div className="flex bg-surface-variant/20 p-1 rounded-lg">
                <button 
                  onClick={() => setChartMode('revenue')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${chartMode === 'revenue' ? 'bg-surface-container shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Revenue
                </button>
                <button 
                  onClick={() => setChartMode('orders')}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${chartMode === 'orders' ? 'bg-surface-container shadow-sm text-primary' : 'text-on-surface-variant hover:text-primary'}`}
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
                  <RechartsTooltip 
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

        {/* Orders Pie Chart */}
        <div className="bg-surface-container backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col items-center justify-center">
           <h3 className="font-serif text-xl tracking-tight text-primary mb-2 self-start">Orders by Status</h3>
           <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label self-start mb-6">Current active distribution</span>
           
           <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
           
           <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 w-full px-4">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-on-surface-variant">{entry.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-surface-container backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl tracking-tight text-primary">Quick Actions</h3>
            <button 
              onClick={() => setIsLogsModalOpen(true)}
              className="text-[10px] tracking-widest uppercase font-bold text-primary hover:text-black transition-colors flex items-center gap-1 border border-outline-variant/50 px-3 py-1.5 rounded-md hover:bg-surface-variant/20"
            >
              Activity Log
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveTab && setActiveTab('inventory')}
              className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group"
            >
              <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Add Product</span>
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('promotions')}
              className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group"
            >
              <Tag className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Promotion</span>
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('clients')}
              className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group"
            >
              <UserPlus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold tracking-wider uppercase">New Client</span>
            </button>
            <button 
              onClick={() => setActiveTab && setActiveTab('settings')}
              className="flex flex-col items-center justify-center p-4 bg-surface-variant/20 hover:bg-primary hover:text-white text-primary rounded-xl transition-colors group"
            >
              <Settings className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold tracking-wider uppercase">Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-surface-container backdrop-blur-md border border-outline-variant/30 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 flex flex-col h-full min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-serif text-xl tracking-tight text-primary">Recent Orders</h3>
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
          <button 
            onClick={() => setActiveTab && setActiveTab('orders')}
            className="w-full mt-4 py-3 text-xs uppercase tracking-widest text-primary font-bold hover:bg-surface-variant/20 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            View All Orders <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Admin Activity Logs Modal */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl border border-outline-variant/30">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/50 rounded-t-2xl">
               <div>
                 <h2 className="font-serif text-2xl text-primary tracking-tight mb-1">Admin Activity Log</h2>
                 <p className="text-xs text-on-surface-variant tracking-wider uppercase font-medium">Audit Trail & Access Records</p>
               </div>
               <div className="flex items-center gap-3">
                 <button 
                   onClick={handlePrintLogs}
                   className="flex items-center gap-2 px-4 py-2 bg-primary text-surface rounded-md text-[10px] font-bold tracking-widest uppercase hover:bg-tertiary transition-colors"
                 >
                   <Printer className="w-4 h-4" /> Print
                 </button>
                 <button onClick={() => setIsLogsModalOpen(false)} className="p-2 hover:bg-surface-variant/50 rounded-full transition-colors text-primary">
                   <X className="w-5 h-5" />
                 </button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-surface">
               {adminLogs === undefined ? (
                 <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
               ) : adminLogs.length === 0 ? (
                 <div className="text-center py-10 text-on-surface-variant italic">No administrative logs found.</div>
               ) : (
                 <div className="overflow-x-auto w-full">
                   <table className="w-full text-left border-collapse min-w-[500px]">
                     <thead>
                     <tr className="bg-surface-container/50">
                       <th className="p-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-medium border-b border-outline-variant/30">Timestamp</th>
                       <th className="p-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-medium border-b border-outline-variant/30">Admin Name</th>
                       <th className="p-3 text-[10px] uppercase tracking-widest text-on-surface-variant font-medium border-b border-outline-variant/30">Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {adminLogs.map((log: any) => (
                       <tr key={log._id} className="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors">
                         <td className="p-3 text-xs text-on-surface-variant font-mono">
                           {new Date(log._creationTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' })}
                         </td>
                         <td className="p-3 text-sm text-primary font-medium">{log.adminName}</td>
                         <td className="p-3 text-sm text-primary">
                           {log.action}
                           {log.details && <span className="block text-xs text-on-surface-variant mt-1">{log.details}</span>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardTab({ setActiveTab, adminName }: { setActiveTab?: (tab: TabKey) => void, adminName?: string }) {
  return (
    <DashboardErrorBoundary>
      <DashboardContent setActiveTab={setActiveTab} adminName={adminName} />
    </DashboardErrorBoundary>
  );
}
