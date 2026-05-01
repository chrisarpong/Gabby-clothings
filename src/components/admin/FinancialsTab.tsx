import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Wallet, Receipt } from 'lucide-react';
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

  const { grossRevenue, aov, netProfit } = useMemo(() => {
    if (!orders) return { grossRevenue: 0, aov: 0, netProfit: 0, completedCount: 0 };
    
    const paidOrders = orders.filter(o => ['completed', 'shipped', 'processing'].includes(o.status));
    const total = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const aovCalc = paidOrders.length > 0 ? total / paidOrders.length : 0;
    
    return {
      grossRevenue: total,
      aov: aovCalc,
      netProfit: total * 0.70,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    if (!orders) return [];
    
    const data: Record<string, number> = {};
    const paidOrders = orders.filter(o => ['completed', 'shipped', 'processing'].includes(o.status));

    if (chartView === 'monthly') {
      paidOrders.forEach(o => {
        const d = new Date(o._creationTime);
        const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        data[monthKey] = (data[monthKey] || 0) + o.totalAmount;
      });
    } else {
      paidOrders.forEach(o => {
        const d = new Date(o._creationTime);
        const q = Math.floor(d.getMonth() / 3) + 1;
        const qKey = `Q${q} '${d.getFullYear().toString().substring(2)}`;
        data[qKey] = (data[qKey] || 0) + o.totalAmount;
      });
    }

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Financials
          </h2>
          <p className="text-sm text-[#3a1f1d]/60 mt-1">Revenue trends and transaction history</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white border border-[#3a1f1d]/15 text-[#3a1f1d] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#3a1f1d]/5 transition-colors">
          Download Report <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Avg Order Value</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {aov.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#3a1f1d]/8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <span className="text-2xl font-semibold text-[#2C1816]" style={{ fontFamily: "'Playfair Display', serif" }}>
            GHS {netProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-[#2C1816]">Revenue Trends</h3>
          <div className="flex bg-[#F5F2EE] rounded-lg p-1">
            <button 
              onClick={() => setChartView('quarterly')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${chartView === 'quarterly' ? 'bg-white text-[#2C1816] shadow-sm' : 'text-[#3a1f1d]/50'}`}
            >
              Quarterly
            </button>
            <button 
              onClick={() => setChartView('monthly')}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${chartView === 'monthly' ? 'bg-white text-[#2C1816] shadow-sm' : 'text-[#3a1f1d]/50'}`}
            >
              Monthly
            </button>
          </div>
        </div>
        
        <div className="h-72">
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
                tick={{ fontSize: 11, fill: '#8B7D7B' }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#8B7D7B' }}
                tickFormatter={(val) => `GHS ${val.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e8e4e2', borderRadius: '8px', fontFamily: "'Jost', sans-serif", fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                itemStyle={{ color: '#2C1816' }}
                formatter={(value: any) => [`GHS ${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3a1f1d" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#3a1f1d]/8 shadow-sm overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="text-base font-semibold text-[#2C1816]">Transaction Ledger</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#3a1f1d]/8 hover:bg-transparent">
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">ID</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Client</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Items</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide">Amount</TableHead>
              <TableHead className="py-3 px-6 text-xs font-medium text-[#3a1f1d]/60 uppercase tracking-wide text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders === undefined ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-[#3a1f1d]/40">Loading transactions...</TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-[#3a1f1d]/40">No transactions found.</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const itemsStr = order.items.map((i: any) => i.name).join(', ');
                const isPaid = ['completed', 'shipped', 'processing'].includes(order.status);
                
                return (
                  <TableRow key={order._id} className="border-b border-[#3a1f1d]/5 hover:bg-[#FDFBF9] transition-colors">
                    <TableCell className="py-4 px-6 text-xs font-mono text-[#3a1f1d]/50">
                      TRX-{order._id.substring(order._id.length - 4).toUpperCase()}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-[#2C1816]">
                      {order.shippingAddress.firstName[0]}. {order.shippingAddress.lastName}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-[#3a1f1d]/70 truncate max-w-[200px]">
                      {itemsStr}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-[#2C1816]">
                      GHS {order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
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
    </div>
  );
};
