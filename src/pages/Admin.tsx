import React, { useState } from 'react';
import { useUser, SignOutButton, SignInButton } from '@clerk/clerk-react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  HeartHandshake, 
  Star, 
  LineChart, 
  Volume2, 
  Tag, 
  Settings,
  LogOut,
  ShieldAlert,
  Menu,
  X 
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

import InventoryTab from '../components/admin/InventoryTab';
import SettingsTab from '../components/admin/SettingsTab';
import OrdersTab from '../components/admin/OrdersTab';
import ClientsTab from '../components/admin/ClientsTab';
import DashboardTab from '../components/admin/DashboardTab';
import PromotionsTab from '../components/admin/PromotionsTab';
import ClientRelationsTab from '../components/admin/ClientRelationsTab';
import ReviewsTab from '../components/admin/ReviewsTab';
import FinancialsTab from '../components/admin/FinancialsTab';
import MarketingTab from '../components/admin/MarketingTab';

// Dummy components for uncompleted sections
const DummyTab = ({ title }: { title: string }) => (
  <div className="p-8">
    <h2 className="font-serif text-3xl text-primary mb-4">{title}</h2>
    <p className="font-sans text-on-surface-variant">This module is under construction.</p>
  </div>
);

type TabKey = 'dashboard' | 'orders' | 'inventory' | 'clients' | 'client-relations' | 'reviews' | 'financials' | 'marketing' | 'promotions' | 'settings';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen bg-surface flex items-center justify-center font-sans tracking-widest text-primary text-sm uppercase">Loading...</div>;
  }

  // RBAC
  const isAdmin = user?.publicMetadata?.role === 'admin';

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <ShieldAlert className="w-12 h-12 mb-4 text-outline" />
        <h1 className="font-serif text-3xl mb-2 text-primary">Admin Portal</h1>
        <p className="text-on-surface-variant mb-8">Please sign in to access the administrator dashboard.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/admin">
          <button className="px-6 py-3 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors rounded-none">
            Log In as Admin
          </button>
        </SignInButton>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <ShieldAlert className="w-12 h-12 mb-4 text-red-500" />
        <h1 className="font-serif text-3xl mb-2 text-red-500">Access Denied</h1>
        <p className="text-on-surface-variant mb-8">You do not have administrative privileges to view this page.</p>
        <div className="flex gap-4">
          <SignInButton>
             <button className="px-8 py-3 border-b-2 border-primary text-primary font-sans text-xs tracking-widest uppercase hover:text-outline hover:border-outline transition-colors rounded-none bg-surface">
               Switch Account
             </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; name: string; icon: React.ElementType }[] = [
    { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { key: 'orders', name: 'Orders', icon: ShoppingCart },
    { key: 'inventory', name: 'Inventory', icon: Package },
    { key: 'clients', name: 'Clients', icon: Users },
    { key: 'client-relations', name: 'Client Relations', icon: HeartHandshake },
    { key: 'reviews', name: 'Reviews', icon: Star },
    { key: 'financials', name: 'Financials', icon: LineChart },
    { key: 'marketing', name: 'Marketing', icon: Volume2 },
    { key: 'promotions', name: 'Promotions', icon: Tag },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'inventory': return <InventoryTab />;
      case 'settings': return <SettingsTab />;
      case 'orders': return <OrdersTab />;
      case 'promotions': return <PromotionsTab />;
      case 'clients': return <ClientsTab />;
      case 'client-relations': return <ClientRelationsTab />;
      case 'reviews': return <ReviewsTab />;
      case 'financials': return <FinancialsTab />;
      case 'marketing': return <MarketingTab />;
      default: return <DummyTab title={tabs.find(t => t.key === activeTab)?.name || 'Settings'} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-surface-container-lowest font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-surface-variant bg-surface z-50">
        <span className="font-serif text-lg text-primary tracking-wide">
          GABBY NEWLUK <span className="font-sans text-[9px] tracking-widest uppercase text-outline ml-2">Admin</span>
        </span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-primary p-2 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-40 w-64 border-r border-surface-variant bg-surface flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 top-[65px] md:top-0' : '-translate-x-full'}`}>
        <div className="overflow-y-auto">
          <div className="h-24 hidden md:flex flex-col justify-center px-8 border-b border-surface-variant bg-surface-container/20">
            <span className="font-serif text-xl text-primary tracking-wide">
              GABBY NEWLUK
            </span>
            <span className="font-label text-[9px] tracking-widest uppercase text-on-surface-variant mt-1.5 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span> Admin Panel
            </span>
          </div>
          <nav className="flex flex-col py-6">
            <div className="px-6 mb-3">
               <p className="font-label text-[9px] tracking-widest uppercase text-outline">Main Menu</p>
            </div>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-6 py-3 font-label text-[11px] tracking-[0.1em] uppercase text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-surface border-r-2 border-primary shadow-[inset_4px_0_0_0_rgba(255,255,255,0.1)]'
                      : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
                  {tab.name}
                </button>
              );
            })}
            
            <div className="px-6 mt-6 mb-3">
               <p className="font-label text-[9px] tracking-widest uppercase text-outline">System</p>
            </div>
            <button
              onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-6 py-3 font-label text-[11px] tracking-[0.1em] uppercase text-left transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-primary text-surface border-r-2 border-primary shadow-[inset_4px_0_0_0_rgba(255,255,255,0.1)]'
                  : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <Settings className="w-4 h-4" strokeWidth={activeTab === 'settings' ? 2 : 1.5} />
              Settings
            </button>
          </nav>
        </div>
        
        <div className="p-6 border-t border-surface-variant bg-surface-container/20">
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-3 px-4 py-2 font-label text-[10px] tracking-[0.15em] uppercase text-red-700 border border-red-200 bg-red-50 hover:bg-red-700 hover:text-white transition-colors duration-300 rounded-none text-left">
              <LogOut className="w-4 h-4" strokeWidth={1.5} /> Logout
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface-container-lowest relative ring-1 ring-surface-variant/50">
        {renderContent()}
      </main>
    </div>
  );
}
