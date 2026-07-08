import React from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { DollarSign, ArrowUpRight, TrendingUp, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#352421', '#827472', '#d4c3c1', '#735c00', '#1C1B1F'];

export default function FinancialsTab() {
  const orders = useQuery(api.orders.getAll);

  if (orders === undefined) {
    return (
      <div className="p-8 font-sans space-y-6">
        <div className="h-12 bg-surface-variant/30 animate-pulse rounded-sm w-1/3" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-variant/30 animate-pulse rounded-sm" />
          ))}
        </div>
        <div className="h-[300px] bg-surface-variant/30 animate-pulse rounded-sm" />
      </div>
    );
  }

  const validOrders = orders.filter((o: Doc<"orders">) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum: number, o: Doc<"orders">) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / validOrders.length : 0;
  const paidOrders = orders.filter((o: Doc<"orders">) => o.paymentStatus === "paid").length;

  // Group revenue by day of the week from order creation time
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const revenueByDay: Record<string, number> = {};
  dayNames.forEach(d => revenueByDay[d] = 0);
  
  for (const o of validOrders) {
    const day = dayNames[new Date(o._creationTime).getDay()];
    revenueByDay[day] += o.totalAmount || 0;
  }

  const chartData = dayNames.map(name => ({ name, revenue: revenueByDay[name] }));

  // Calculate Revenue by Payment Status for Pie Chart
  const revenueByPaymentStatus: Record<string, number> = {};
  for (const o of validOrders) {
    const status = o.paymentStatus || 'pending';
    revenueByPaymentStatus[status] = (revenueByPaymentStatus[status] || 0) + (o.totalAmount || 0);
  }
  
  const paymentPieData = Object.keys(revenueByPaymentStatus).map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: revenueByPaymentStatus[status]
  })).filter(data => data.value > 0);

  // Recent orders for the table
  const recentOrders = [...orders]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 10);

  return (
    <div className="p-8 font-sans text-on-surface h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Financial Overview</h2>
          <p className="text-sm text-on-surface-variant">Revenue, order metrics, and transaction records.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label mb-2">Total Revenue</span>
          <span className="text-3xl font-serif text-primary flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> GH₵{totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label mb-2">Average Order Value</span>
          <span className="text-3xl font-serif text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> GH₵{avgOrderValue.toFixed(2)}
          </span>
        </div>
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label mb-2">Paid Orders</span>
          <span className="text-3xl font-serif text-primary flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> {paidOrders} / {totalOrders}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue by Day Chart */}
        <div className="lg:col-span-2 bg-surface-container border border-outline-variant/30 p-6 shadow-sm">
          <h3 className="font-serif text-xl tracking-tight text-primary mb-6">Revenue by Day</h3>
          <div className="h-[300px] w-full">
            {totalRevenue > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} tickFormatter={(val) => `GH₵${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb', fontFamily: 'Inter' }} />
                  <Bar dataKey="revenue" fill="#1C1B1F" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-on-surface-variant text-sm italic">No revenue data yet</div>
            )}
          </div>
        </div>

        {/* Revenue by Payment Status Pie Chart */}
        <div className="bg-surface-container border border-outline-variant/30 p-6 shadow-sm flex flex-col items-center justify-center">
           <h3 className="font-serif text-xl tracking-tight text-primary mb-2 self-start">Revenue by Status</h3>
           <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label self-start mb-6">Distribution by payment state</span>
           
           <div className="h-[220px] w-full">
             {paymentPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => `GH₵${Number(value).toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-sm italic">No revenue data</div>
             )}
           </div>
           
           {paymentPieData.length > 0 && (
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
                {paymentPieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-on-surface-variant whitespace-nowrap">{entry.name}</span>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-surface-container border border-outline-variant/30 shadow-sm mb-10">
        <div className="p-6 border-b border-outline-variant/30">
          <h3 className="font-serif text-xl tracking-tight text-primary">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container/20 border-b border-outline-variant/30">
                <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant whitespace-nowrap">Order ID</th>
                <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant whitespace-nowrap">Customer</th>
                <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant whitespace-nowrap">Amount</th>
                <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant whitespace-nowrap">Payment</th>
                <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant italic text-sm">No transactions yet.</td></tr>
              ) : (
                recentOrders.map((order: Doc<"orders">) => (
                  <tr key={order._id} className="border-b border-outline-variant/10 hover:bg-surface-container/20 transition-colors">
                    <td className="p-4 text-xs font-mono text-primary whitespace-nowrap">{order.orderId || order._id.substring(0, 10)}</td>
                    <td className="p-4 text-sm text-primary whitespace-nowrap">{order.customerDetails?.firstName || "Guest"} {order.customerDetails?.lastName || ""}</td>
                    <td className="p-4 text-sm font-medium text-primary whitespace-nowrap">GH₵{(order.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`text-[10px] uppercase font-label tracking-wide px-2 py-1 ${
                        order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant whitespace-nowrap">{new Date(order._creationTime).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
