import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, Users, TrendingUp, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export const OverviewTab = ({ orders, stats, clients }: { orders: any[], stats: any, clients: any[] }) => {
  const recentActivities = useMemo(() => {
    if (!orders || !clients) return [];
    
    const actions: any[] = [];
    
    orders.slice(0, 5).forEach(o => {
      actions.push({
        id: `ord-${o._id}`,
        type: 'order',
        title: 'New Bespoke Order',
        desc: `Order from ${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
        time: o._creationTime,
        icon: <ShoppingBag className="w-4 h-4 text-emerald-600" />,
        bg: 'bg-emerald-50'
      });
    });

    clients.slice(0, 3).forEach(c => {
      actions.push({
        id: `cli-${c._id}`,
        type: 'client',
        title: 'New Client Registry',
        desc: `${c.firstName} ${c.lastName} joined the atelier`,
        time: c._creationTime,
        icon: <Users className="w-4 h-4 text-blue-600" />,
        bg: 'bg-blue-50'
      });
    });

    return actions.sort((a, b) => b.time - a.time).slice(0, 4);
  }, [orders, clients]);

  const chartData = [
    { name: 'Mon', revenue: 4500 },
    { name: 'Tue', revenue: 5200 },
    { name: 'Wed', revenue: 4800 },
    { name: 'Thu', revenue: 6100 },
    { name: 'Fri', revenue: 5900 },
    { name: 'Sat', revenue: 7200 },
    { name: 'Sun', revenue: 6800 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Overview
          </h2>
          <p className="text-sm text-[#3a1f1d]/60 mt-1">Snapshot of your atelier's performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#3a1f1d]/40" />
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {stats?.totalOrders || 0}
          </span>
          <p className="text-[10px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% from last month
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#3a1f1d]/40" />
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {(stats?.totalRevenue || 0).toLocaleString()}
          </span>
          <p className="text-[10px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8.4% growth
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Active Clients</span>
            <Users className="w-4 h-4 text-[#3a1f1d]/40" />
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {clients?.length || 0}
          </span>
          <p className="text-[10px] text-[#3a1f1d]/40 font-medium mt-2">Verified registrations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-base font-semibold text-[#2C1816]">Performance Trends</h3>
            <div className="flex items-center gap-2 text-[11px] text-[#3a1f1d]/50">
              <span className="w-2 h-2 rounded-full bg-[#3a1f1d]"></span> Weekly Revenue
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3a1f1d" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3a1f1d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#8B7D7B' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#8B7D7B' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e8e4e2', borderRadius: '8px', fontFamily: "'Jost', sans-serif", fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#2C1816' }}
                  formatter={(value: any) => [`GHS ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3a1f1d" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm flex flex-col">
          <div className="p-6 border-b border-[#3a1f1d]/5">
            <h3 className="text-base font-semibold text-[#2C1816]">Recent Activity</h3>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex gap-4">
                <div className={`w-9 h-9 rounded-full ${act.bg} flex items-center justify-center shrink-0`}>
                  {act.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#2C1816]">{act.title}</p>
                  <p className="text-xs text-[#3a1f1d]/50 mt-0.5">{act.desc}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#3a1f1d]/30 uppercase tracking-wider font-semibold">
                    <Clock className="w-2.5 h-2.5" /> {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex justify-between items-center">
          <h3 className="text-base font-semibold text-[#2C1816]">Active Orders</h3>
          <button className="text-[11px] font-semibold text-[#3a1f1d] uppercase tracking-wider hover:opacity-70 transition-opacity">View All</button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Dossier ID</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Client</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders === undefined ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-[#3a1f1d]/40 italic">Syncing dossiers...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-8 text-center text-[#3a1f1d]/40 italic">No active dossiers.</TableCell>
              </TableRow>
            ) : (
              orders.slice(0, 5).map((order) => (
                <TableRow key={order._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors">
                  <TableCell className="py-4 px-6 text-[13px] font-medium text-[#2C1816]">
                    DOS-{order._id.substring(order._id.length - 4).toUpperCase()}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-[13px] text-[#3a1f1d]/70">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3a1f1d]/5 text-[#3a1f1d] uppercase tracking-wide">
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
