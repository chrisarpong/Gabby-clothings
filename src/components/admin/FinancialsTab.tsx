import React from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc } from '../../../convex/_generated/dataModel';
import { DollarSign, ArrowUpRight, TrendingUp, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Recent orders for the table
  const recentOrders = [...orders]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 10);

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full bg-surface overflow-y-auto">
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

      {/* Revenue by Day Chart */}
      <div className="bg-white border border-outline-variant/30 p-6 shadow-sm mb-8">
        <h3 className="font-serif text-xl tracking-tight text-primary mb-6">Revenue by Day</h3>
        <div className="h-[300px] w-full">
          {totalRevenue > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} tickFormatter={(val) => `GH₵${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '0', border: '1px solid #e5e7eb', fontFamily: 'Inter' }} />
                <Bar dataKey="revenue" fill="#1C1B1F" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm italic">No revenue data yet</div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white border border-outline-variant/30 shadow-sm">
        <div className="p-6 border-b border-outline-variant/30">
          <h3 className="font-serif text-xl tracking-tight text-primary">Recent Transactions</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container/20 border-b border-outline-variant/30">
              <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Order ID</th>
              <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Customer</th>
              <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Amount</th>
              <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Payment</th>
              <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-on-surface-variant italic text-sm">No transactions yet.</td></tr>
            ) : (
              recentOrders.map((order: Doc<"orders">) => (
                <tr key={order._id} className="border-b border-outline-variant/10 hover:bg-surface-container/20 transition-colors">
                  <td className="p-4 text-xs font-mono text-primary">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4 text-sm text-primary">{order.customerDetails?.firstName || "Guest"} {order.customerDetails?.lastName || ""}</td>
                  <td className="p-4 text-sm font-medium text-primary">GH₵{(order.totalAmount || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase font-label tracking-wide px-2 py-1 ${
                      order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant">{new Date(order._creationTime).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
