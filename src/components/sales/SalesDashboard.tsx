import React from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';

export default function SalesDashboard() {
  const orders = useQuery(api.orders.getAll) || [];
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o._creationTime);
    return orderDate >= today && o.orderId?.startsWith('GB-');
  });

  const todayTotal = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="font-serif text-2xl text-primary mb-1">Daily Performance</h2>
        <p className="text-sm text-on-surface-variant">Your sales summary for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface border border-surface-variant p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Today's Sales</p>
            <p className="font-serif text-2xl text-primary">₵{todayTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface border border-surface-variant p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Orders Processed</p>
            <p className="font-serif text-2xl text-primary">{todayOrders.length}</p>
          </div>
        </div>
        <div className="bg-surface border border-surface-variant p-6 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Weekly Target</p>
            <p className="font-serif text-2xl text-primary">In Progress</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-surface-variant flex-1 p-6 flex flex-col">
        <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Top Selling Items</h3>
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-on-surface-variant text-sm">Not enough data to display trends yet.</p>
        </div>
      </div>
    </div>
  );
}
