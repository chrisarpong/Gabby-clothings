import React, { useState } from 'react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { ShoppingBag, History, Users, BarChart3, LogOut } from 'lucide-react';

import SalesPOS from '../components/sales/SalesPOS';
import SalesHistory from '../components/sales/SalesHistory';
import SalesCRM from '../components/sales/SalesCRM';
import SalesDashboard from '../components/sales/SalesDashboard';

export default function SalesPortal() {
  const { profile, logout } = useStaffAuth();
  // We still need the products query, wait! SalesPOS needs products, but it expects no staffToken argument. 
  // Wait, products.getActive is public, so it's fine!
  const products = useQuery(api.products.getActive) || [];

  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'crm' | 'dashboard'>('pos');

  if (!profile) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'pos':
        return <SalesPOS products={products} setActiveTab={setActiveTab} />;
      case 'history':
        return <SalesHistory />;
      case 'crm':
        return <SalesCRM onStartSale={() => setActiveTab('pos')} />;
      case 'dashboard':
        return <SalesDashboard />;
      default:
        return <SalesPOS products={products} setActiveTab={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'pos', label: 'New Sale', icon: ShoppingBag },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'crm', label: 'Client CRM', icon: Users },
    { id: 'dashboard', label: 'Performance', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen flex bg-surface-container-lowest font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface border-r border-surface-variant flex flex-col hidden md:flex">
        <div className="p-6 border-b border-surface-variant">
          <h1 className="font-serif text-2xl text-primary tracking-tight mb-2">Sales Portal</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
            {profile.name}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary text-surface' 
                    : 'text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-surface' : 'text-on-surface-variant'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-variant">
          <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-surface border-b border-surface-variant px-4 py-4 flex justify-between items-center z-30">
          <h1 className="font-serif text-xl text-primary tracking-tight">Sales POS</h1>
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="bg-surface-container border border-outline-variant p-2 text-sm focus:outline-none"
          >
            {navItems.map(item => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
