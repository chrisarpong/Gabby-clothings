import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export const FinancialsTab = ({ orders }: { orders: any[] }) => {
  const [chartView, setChartView] = useState<'monthly' | 'quarterly'>('quarterly');

  // --- Financial KPIs ---
  const { grossRevenue, aov, netProfit, completedCount } = useMemo(() => {
    if (!orders) return { grossRevenue: 0, aov: 0, netProfit: 0, completedCount: 0 };
    
    const paidOrders = orders.filter(o => ['completed', 'shipped', 'processing'].includes(o.status));
    const total = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const aovCalc = paidOrders.length > 0 ? total / paidOrders.length : 0;
    
    return {
      grossRevenue: total,
      aov: aovCalc,
      netProfit: total * 0.70, // 70% margin as requested
      completedCount: paidOrders.length
    };
  }, [orders]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    if (!orders) return [];
    
    const data: Record<string, number> = {};
    const paidOrders = orders.filter(o => ['completed', 'shipped', 'processing'].includes(o.status));

    if (chartView === 'monthly') {
      // Group by month
      paidOrders.forEach(o => {
        const d = new Date(o._creationTime);
        const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        data[monthKey] = (data[monthKey] || 0) + o.totalAmount;
      });
    } else {
      // Group by quarter
      paidOrders.forEach(o => {
        const d = new Date(o._creationTime);
        const q = Math.floor(d.getMonth() / 3) + 1;
        const qKey = `Q${q} '${d.getFullYear().toString().substring(2)}`;
        data[qKey] = (data[qKey] || 0) + o.totalAmount;
      });
    }

    // Sort the keys based on real dates
    const sortedKeys = Object.keys(data).sort((a, b) => {
      if (chartView === 'monthly') {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        return new Date(`${monthA} 1 20${yearA}`).getTime() - new Date(`${monthB} 1 20${yearB}`).getTime();
      } else {
        const [qA, yearA] = a.split(" '");
        const [qB, yearB] = b.split(" '");
        const qNumA = parseInt(qA.replace('Q', ''));
        const qNumB = parseInt(qB.replace('Q', ''));
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return qNumA - qNumB;
      }
    });

    return sortedKeys.map(key => ({
      name: key,
      revenue: data[key]
    }));
  }, [orders, chartView]);

  return (
    <div className="w-full">
      {/* Header */}
      <header className="mb-16 flex justify-between items-end">
        <div>
          <h1 className="text-[32px] font-normal leading-[1.2] text-[#220b09]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Financial Performance
          </h1>
          <p className="text-[10px] tracking-[0.05em] text-[#827472] mt-2 uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
            Q3 2023 Overview
          </p>
        </div>
        <button className="border border-[#827472]/20 px-6 py-3 text-[11px] font-semibold tracking-[0.15em] text-[#220b09] hover:bg-[#e3e2e0] transition-colors uppercase flex items-center gap-2" style={{ fontFamily: "'Jost', sans-serif" }}>
          Download Report <Download className="w-4 h-4" />
        </button>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        <Card className="border border-[#827472]/10 p-8 relative flex flex-col justify-between h-40 bg-transparent rounded-none shadow-none">
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
            Gross Revenue
          </p>
          <p className="text-[32px] font-normal leading-[1.2] text-[#220b09] mt-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </Card>
        <Card className="border border-[#827472]/10 p-8 relative flex flex-col justify-between h-40 bg-transparent rounded-none shadow-none">
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
            Average Order Value
          </p>
          <p className="text-[32px] font-normal leading-[1.2] text-[#220b09] mt-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {aov.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </Card>
        <Card className="border border-[#827472]/10 p-8 relative flex flex-col justify-between h-40 bg-transparent rounded-none shadow-none">
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
            Net Profit
          </p>
          <p className="text-[32px] font-normal leading-[1.2] text-[#220b09] mt-auto" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {netProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </Card>
      </section>

      {/* Chart Section */}
      <section className="mb-32 border border-[#827472]/10 p-8">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-[24px] font-normal text-[#220b09]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Revenue Trends
          </h2>
          <div className="flex gap-4">
            <span 
              onClick={() => setChartView('quarterly')}
              className={`text-[11px] font-semibold tracking-[0.15em] uppercase pb-1 cursor-pointer transition-colors ${chartView === 'quarterly' ? 'text-[#220b09] border-b border-[#220b09]' : 'text-[#827472] hover:text-[#220b09] border-b border-transparent'}`} 
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Quarterly
            </span>
            <span 
              onClick={() => setChartView('monthly')}
              className={`text-[11px] font-semibold tracking-[0.15em] uppercase pb-1 cursor-pointer transition-colors ${chartView === 'monthly' ? 'text-[#220b09] border-b border-[#220b09]' : 'text-[#827472] hover:text-[#220b09] border-b border-transparent'}`} 
              style={{ fontFamily: "'Jost', sans-serif" }}
            >
              Monthly
            </span>
          </div>
        </div>
        
        {/* Recharts Area Chart */}
        <div className="w-full h-96 relative border-l border-b border-[#827472]/10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3a1f1d" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3a1f1d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#827472', fontFamily: "'Jost', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#827472', fontFamily: "'Jost', sans-serif" }}
                tickFormatter={(val) => `GHS ${val.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(130,116,114,0.2)', fontFamily: "'Jost', sans-serif", fontSize: '12px', borderRadius: 0 }}
                itemStyle={{ color: '#220b09' }}
                formatter={(value: number) => [`GHS ${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3a1f1d" strokeWidth={1.5} fillOpacity={1} fill="url(#colorTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Ledger Section */}
      <section>
        <h2 className="text-[24px] font-normal text-[#220b09] mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          Transaction Ledger
        </h2>
        <div className="w-full border-t border-[#827472]/10 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="border-b border-[#827472]/10 hover:bg-transparent">
                <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase font-normal w-32" style={{ fontFamily: "'Jost', sans-serif" }}>ID</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase font-normal col-span-2" style={{ fontFamily: "'Jost', sans-serif" }}>Client</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Type</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase font-normal" style={{ fontFamily: "'Jost', sans-serif" }}>Amount</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold tracking-[0.15em] text-[#827472] uppercase font-normal text-right" style={{ fontFamily: "'Jost', sans-serif" }}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[16px] tracking-[0.01em] text-[#220b09]" style={{ fontFamily: "'Jost', sans-serif" }}>
              {orders === undefined ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[#827472] italic">Loading transactions...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[#827472] italic">No transactions found.</TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const itemsStr = order.items.map((i: any) => i.name).join(', ');
                  const isPaid = ['completed', 'shipped', 'processing'].includes(order.status);
                  
                  return (
                    <TableRow key={order._id} className="border-b border-[#827472]/5 hover:bg-[#e3e2e0]/30 transition-colors py-2">
                      <TableCell className="text-[10px] tracking-[0.05em] text-[#827472] uppercase">
                        TRX-{order._id.substring(order._id.length - 4).toUpperCase()}
                      </TableCell>
                      <TableCell className="text-[18px]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {order.shippingAddress.firstName[0]}. {order.shippingAddress.lastName}
                      </TableCell>
                      <TableCell className="text-[16px] text-[#220b09] truncate max-w-[200px]">
                        {itemsStr}
                      </TableCell>
                      <TableCell className="text-[18px]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        GHS {order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-block border px-3 py-1 text-[9px] font-semibold tracking-[0.15em] uppercase ${isPaid ? 'border-[#827472]/20 text-[#220b09]' : 'border-[#827472]/20 text-[#827472]'}`} style={{ fontFamily: "'Jost', sans-serif" }}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-8 flex justify-center">
          <button className="text-[11px] font-semibold tracking-[0.15em] text-[#827472] hover:text-[#220b09] transition-colors border-b border-transparent hover:border-[#220b09] pb-1 uppercase tracking-widest" style={{ fontFamily: "'Jost', sans-serif" }}>
            View Full Ledger
          </button>
        </div>
      </section>
    </div>
  );
};
