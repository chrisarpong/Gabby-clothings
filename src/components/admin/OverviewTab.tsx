import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Scissors, Banknote, Package, Bell } from 'lucide-react';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export const OverviewTab = ({ orders, clients, appointments }: { orders: any[], clients: any[], appointments?: any[] }) => {
  // --- KPI Calculations ---
  const revenue = useMemo(() => {
    if (!orders) return 0;
    return orders
      .filter(o => o.status === 'completed' || o.status === 'shipped')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const activeDossiers = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  }, [orders]);

  const newClients = clients ? clients.length : 0;

  // --- Chart Data (Revenue over last 30 days) ---
  const chartData = useMemo(() => {
    if (!orders) return [];
    const data: { [key: string]: number } = {};
    const today = new Date();
    
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      data[dateStr] = 0;
    }

    orders.forEach(o => {
      if (o.status === 'completed' || o.status === 'shipped') {
        const orderDate = new Date(o._creationTime);
        const diffDays = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 30) {
          const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (data[dateStr] !== undefined) {
            data[dateStr] += o.totalAmount;
          }
        }
      }
    });

    return Object.keys(data).map(date => ({ date, revenue: data[date] }));
  }, [orders]);

  // --- Recent Actions (Mixed from Orders & Appointments) ---
  const recentActions = useMemo(() => {
    const actions = [];
    if (orders) {
      orders.slice(0, 3).forEach(o => {
        actions.push({
          id: o._id,
          type: 'order',
          title: `Order updated: ${o.status.toUpperCase()}`,
          time: o._creationTime,
          icon: o.status === 'completed' ? Banknote : Package
        });
      });
    }
    if (appointments) {
      appointments.slice(0, 2).forEach(a => {
        actions.push({
          id: a._id,
          type: 'appointment',
          title: `Appointment booked: ${a.name}`,
          time: a._creationTime,
          icon: Scissors
        });
      });
    }
    return actions.sort((a, b) => b.time - a.time).slice(0, 4);
  }, [orders, appointments]);

  // --- Active Dossiers Table ---
  const activeOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => o.status === 'pending' || o.status === 'processing').slice(0, 5);
  }, [orders]);

  return (
    <div className="w-full">
      <header className="mb-16">
        <h2 className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Overview
        </h2>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="border border-[#1a1c1b]/10 p-8 flex flex-col justify-between h-40 bg-transparent rounded-none shadow-none">
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
            Revenue (MTD)
          </span>
          <span className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="border border-[#1a1c1b]/10 p-8 flex flex-col justify-between h-40 bg-transparent rounded-none shadow-none">
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
            Active Dossiers
          </span>
          <span className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {activeDossiers}
          </span>
        </Card>
        <Card className="border border-[#1a1c1b]/10 p-8 flex flex-col justify-between h-40 bg-transparent rounded-none shadow-none">
          <span className="text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
            New Clients
          </span>
          <span className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {newClients}
          </span>
        </Card>
      </section>

      {/* Chart & Activity Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Revenue Over Time Chart */}
        <div className="lg:col-span-8 border border-[#1a1c1b]/10 p-8 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[11px] font-semibold tracking-[0.15em] text-[#1a1c1b] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
              Revenue Over Time
            </h3>
            <span className="text-[10px] tracking-[0.05em] text-[#504443] uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
              LAST 30 DAYS
            </span>
          </div>
          <div className="flex-1 w-full relative pt-8 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3a1f1d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3a1f1d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#504443', fontFamily: "'Jost', sans-serif", letterSpacing: '0.05em' }}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#504443', fontFamily: "'Jost', sans-serif" }}
                  tickFormatter={(val) => `GHS ${val.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#F9F8F6', border: '1px solid rgba(58,31,29,0.1)', fontFamily: "'Jost', sans-serif", fontSize: '12px' }}
                  itemStyle={{ color: '#3a1f1d' }}
                  formatter={(value: number) => [`GHS ${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3a1f1d" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-4 border border-[#1a1c1b]/10 p-8 flex flex-col min-h-[400px] bg-transparent rounded-none shadow-none">
          <h3 className="text-[11px] font-semibold tracking-[0.15em] text-[#1a1c1b] uppercase mb-8 border-b border-[#1a1c1b]/10 pb-4" style={{ fontFamily: "'Jost', sans-serif" }}>
            Recent Actions
          </h3>
          <div className="flex flex-col gap-6">
            {recentActions.map((action, idx) => {
              const Icon = action.icon;
              // Calculate relative time safely
              const hoursAgo = Math.max(1, Math.floor((new Date().getTime() - action.time) / (1000 * 3600)));
              const timeDisplay = hoursAgo < 24 ? `${hoursAgo} HOURS AGO` : `${Math.floor(hoursAgo / 24)} DAYS AGO`;
              
              return (
                <div key={`${action.id}-${idx}`} className="flex gap-4 items-start">
                  <div className="w-8 h-8 flex items-center justify-center border border-[#1a1c1b]/10 shrink-0">
                    <Icon className="w-4 h-4 text-[#1a1c1b]" />
                  </div>
                  <div>
                    <p className="text-[16px] tracking-[0.01em] text-[#1a1c1b] text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {action.title}
                    </p>
                    <p className="text-[10px] tracking-[0.05em] text-[#504443] mt-1 uppercase" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {timeDisplay}
                    </p>
                  </div>
                </div>
              );
            })}
            {recentActions.length === 0 && (
              <p className="text-[13px] text-[#504443] italic">No recent activity.</p>
            )}
          </div>
        </Card>
      </section>

      {/* Data Table Section (Orders & Bespoke Preview) */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-8 border-b border-[#1a1c1b]/10 pb-4">
          <h3 className="text-[32px] font-normal leading-[1.2] text-[#1a1c1b]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Active Dossiers
          </h3>
          <button className="text-[11px] font-semibold tracking-[0.15em] text-[#1a1c1b] uppercase hover:opacity-70 transition-opacity border-b border-[#1a1c1b] pb-1" style={{ fontFamily: "'Jost', sans-serif" }}>
            View All
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#1a1c1b]/10 hover:bg-transparent">
                <TableHead className="py-4 px-2 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Client</TableHead>
                <TableHead className="py-4 px-2 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Garment</TableHead>
                <TableHead className="py-4 px-2 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Status</TableHead>
                <TableHead className="py-4 px-2 text-[11px] font-semibold tracking-[0.15em] text-[#504443] uppercase font-normal text-right" style={{ fontFamily: "'Jost', sans-serif" }}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[16px] tracking-[0.01em] text-sm" style={{ fontFamily: "'Jost', sans-serif" }}>
              {activeOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-[#504443] italic">No active dossiers.</TableCell>
                </TableRow>
              ) : (
                activeOrders.map(order => (
                  <TableRow key={order._id} className="border-b border-[#1a1c1b]/5 hover:bg-[#f4f3f1] transition-colors">
                    <TableCell className="py-4 px-2 text-[#1a1c1b]">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </TableCell>
                    <TableCell className="py-4 px-2 text-[#504443]">
                      {order.items.map((i: any) => i.name).join(', ')}
                    </TableCell>
                    <TableCell className="py-4 px-2">
                      <span className="px-2 py-1 border border-[#1a1c1b]/10 text-xs tracking-wider uppercase text-[#1a1c1b]">
                        {order.status.replace('-', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-2 text-right">
                      <button className="text-[11px] font-semibold tracking-[0.15em] text-[#3a1f1d] uppercase hover:opacity-70" style={{ fontFamily: "'Jost', sans-serif" }}>
                        Review
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};
