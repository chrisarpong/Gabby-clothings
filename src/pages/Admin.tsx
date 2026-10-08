import React, { useState } from 'react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { ThemeToggle } from '../components/ThemeToggle';
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
  X,
  Shield,
  FileText
} from 'lucide-react';
import logo from '../assets/logo.png';
import { hasPermission, StaffRole } from '../../convex/staffPermissions';

import InventoryTab from '../components/admin/InventoryTab';
import SettingsTab from '../components/admin/SettingsTab';
import OrdersTab from '../components/admin/OrdersTab';
import ClientsTab from '../components/admin/ClientsTab';
import DashboardTab from '../components/admin/DashboardTab';
import PromotionsTab from '../components/admin/PromotionsTab';
import AdminAppointmentsTab from '../components/admin/AdminAppointmentsTab';
import ReviewsTab from '../components/admin/ReviewsTab';
import FinancialsTab from '../components/admin/FinancialsTab';
import MarketingTab from '../components/admin/MarketingTab';
import ContentTab from '../components/admin/ContentTab';
import NewsTab from '../components/admin/NewsTab';
import TeamManagementTab from '../components/admin/TeamManagementTab';
import NotificationBell from '../components/admin/NotificationBell';

type TabKey = 'dashboard' | 'orders' | 'inventory' | 'clients' | 'appointments' | 'news' | 'reviews' | 'financials' | 'marketing' | 'promotions' | 'settings' | 'content' | 'team_management';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const { profile, logout } = useStaffAuth();

  // StaffRoute handles unauthenticated state, so we know profile exists
  if (!profile) return null;

  const allTabs: { key: TabKey; name: string; icon: React.ElementType; permission: string }[] = [
    { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { key: 'orders', name: 'Orders', icon: ShoppingCart, permission: 'orders' },
    { key: 'inventory', name: 'Inventory', icon: Package, permission: 'inventory' },
    { key: 'clients', name: 'Clients', icon: Users, permission: 'clients' },
    { key: 'appointments', name: 'Appointments', icon: HeartHandshake, permission: 'appointments' },
    { key: 'news', name: 'News & Blog', icon: Volume2, permission: 'news' },
    { key: 'reviews', name: 'Reviews', icon: Star, permission: 'reviews' },
    { key: 'financials', name: 'Financials', icon: LineChart, permission: 'financials' },
    { key: 'marketing', name: 'Marketing', icon: Volume2, permission: 'marketing' },
    { key: 'promotions', name: 'Promotions', icon: Tag, permission: 'promotions' },
    { key: 'content', name: 'Pages & Content', icon: FileText, permission: 'content' },
    { key: 'team_management', name: 'Team & Roles', icon: Shield, permission: 'team_management' },
  ];

  const tabs = allTabs.filter(tab => hasPermission(profile.role as StaffRole, tab.permission));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab setActiveTab={setActiveTab} adminName={profile.name || 'Admin'} />;
      case 'inventory': return <InventoryTab />;
      case 'settings': return <SettingsTab />;
      case 'orders': return <OrdersTab />;
      case 'promotions': return <PromotionsTab />;
      case 'clients': return <ClientsTab />;
      case 'appointments': return <AdminAppointmentsTab />;
      case 'news': return <NewsTab />;
      case 'reviews': return <ReviewsTab />;
      case 'financials': return <FinancialsTab />;
      case 'marketing': return <MarketingTab />;
      case 'content': return <ContentTab />;
      case 'team_management': return <TeamManagementTab />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-surface-container-lowest font-sans">
      
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
      <aside 
        onMouseEnter={() => setIsDesktopExpanded(true)}
        onMouseLeave={() => setIsDesktopExpanded(false)}
        onClick={() => setIsDesktopExpanded(true)}
        className={`fixed md:relative inset-y-0 left-0 z-40 ${isDesktopExpanded ? 'md:w-64' : 'md:w-[80px]'} w-64 border-r border-surface-variant bg-surface flex flex-col justify-between shrink-0 transform transition-all duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 top-[65px] md:top-0' : '-translate-x-full'}`}
      >
        <div className="overflow-y-auto overflow-x-hidden">
          <div className={`h-24 hidden md:flex flex-col justify-center border-b border-surface-variant bg-surface-container/20 transition-all duration-300 ${isDesktopExpanded ? 'px-8 items-start' : 'px-0 items-center'}`}>
            {isDesktopExpanded ? (
               <div className="flex items-center gap-3">
                 <img src={logo} alt="Gabby Newluk" className="h-10 w-auto object-contain" />
                 <div className="flex flex-col">
                   <span className="font-serif text-[18px] leading-none text-[#352421] italic tracking-tight whitespace-nowrap">Gabby Newluk</span>
                   <span className="font-label text-[8px] tracking-[0.2em] uppercase text-on-surface-variant mt-1.5 font-bold">Admin Portal</span>
                 </div>
               </div>
            ) : (
               <div className="w-10 h-10 flex items-center justify-center">
                 <img src={logo} alt="G" className="h-8 w-auto object-contain" />
               </div>
            )}
          </div>
          <nav className="flex flex-col py-6">
            <div className={`mb-3 transition-all duration-300 ${isDesktopExpanded ? 'px-6' : 'px-0 text-center'}`}>
               {isDesktopExpanded ? (
                 <p className="font-label text-[9px] tracking-widest uppercase text-outline whitespace-nowrap">Main Menu</p>
               ) : (
                 <div className="w-8 mx-auto h-px bg-surface-variant"></div>
               )}
            </div>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  title={tab.name}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveTab(tab.key); 
                    setIsMobileMenuOpen(false); 
                  }}
                  className={`flex items-center gap-4 py-3 font-label text-[11px] tracking-[0.1em] uppercase text-left transition-all duration-200 whitespace-nowrap overflow-hidden ${
                    isDesktopExpanded ? 'px-6' : 'justify-center px-0'
                  } ${
                    isActive
                      ? 'bg-primary text-surface border-r-2 border-primary shadow-[inset_4px_0_0_0_rgba(255,255,255,0.1)]'
                      : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                  {isDesktopExpanded && <span>{tab.name}</span>}
                </button>
              );
            })}
            
            <div className={`mt-6 mb-3 transition-all duration-300 ${isDesktopExpanded ? 'px-6' : 'px-0 text-center'}`}>
               {isDesktopExpanded ? (
                 <p className="font-label text-[9px] tracking-widest uppercase text-outline whitespace-nowrap">System</p>
               ) : (
                 <div className="w-8 mx-auto h-px bg-surface-variant"></div>
               )}
            </div>
            <button
              title="Settings"
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveTab('settings'); 
                setIsMobileMenuOpen(false); 
              }}
              className={`flex items-center gap-4 py-3 font-label text-[11px] tracking-[0.1em] uppercase text-left transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isDesktopExpanded ? 'px-6' : 'justify-center px-0'
              } ${
                activeTab === 'settings'
                  ? 'bg-primary text-surface border-r-2 border-primary shadow-[inset_4px_0_0_0_rgba(255,255,255,0.1)]'
                  : 'text-on-surface-variant hover:bg-surface-container/50 hover:text-primary'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" strokeWidth={activeTab === 'settings' ? 2 : 1.5} />
              {isDesktopExpanded && <span>Settings</span>}
            </button>
          </nav>
        </div>
        
        <div className={`border-t border-surface-variant bg-surface-container/20 transition-all duration-300 ${isDesktopExpanded ? 'p-6 space-y-4' : 'p-4 flex flex-col gap-4 items-center'}`}>
          <div className={isDesktopExpanded ? 'flex justify-center' : 'flex justify-center w-full'}>
            <ThemeToggle isCompact={!isDesktopExpanded} />
          </div>
          <button 
              onClick={() => logout()}
              title="Logout" 
              className={`flex items-center justify-center gap-3 py-2.5 font-label text-[10px] tracking-[0.15em] uppercase text-red-500 border border-red-900/30 bg-red-950/20 hover:bg-red-600 hover:text-white transition-colors duration-300 rounded-none whitespace-nowrap overflow-hidden ${isDesktopExpanded ? 'w-full px-4 text-left' : 'w-10 h-10 px-0'}`}
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} /> 
              {isDesktopExpanded && <span>Logout</span>}
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-surface-container-lowest relative ring-1 ring-surface-variant/50">
        <div className="absolute top-4 right-4 z-[100]">
          <NotificationBell />
        </div>
        {renderContent()}
      </main>
    </div>
  );
}
