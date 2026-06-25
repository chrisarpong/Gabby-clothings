import React, { useState, useEffect } from 'react';
import { useUser, SignOutButton, SignInButton } from '@clerk/clerk-react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
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
  FileText
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

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

// Dummy components for uncompleted sections
const DummyTab = ({ title }: { title: string }) => (
  <div className="p-8">
    <h2 className="font-serif text-3xl text-primary mb-4">{title}</h2>
    <p className="font-sans text-on-surface-variant">This module is under construction.</p>
  </div>
);

type TabKey = 'dashboard' | 'orders' | 'inventory' | 'clients' | 'appointments' | 'news' | 'reviews' | 'financials' | 'marketing' | 'promotions' | 'settings' | 'content';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);

  // convexUser is undefined while loading, null if no matching record found
  const isConvexLoading = convexUser === undefined;

  // RBAC — support both "admin" and "superadmin" roles
  const clerkRole = user?.publicMetadata?.role as string | undefined;
  const isAdminRole = (role?: string) => role === 'admin' || role === 'superadmin';
  const isAdmin = isAdminRole(clerkRole) || isAdminRole(convexUser?.role);
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    if (user && isAdmin && convexUser) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: convexUser.role, // preserve their existing role (admin or superadmin)
      }).catch(console.error);
    }
  }, [user, isAdmin, convexUser]);


  if (!isLoaded || (user && isConvexLoading)) {
    return <div className="min-h-screen bg-surface flex items-center justify-center font-sans tracking-widest text-primary text-sm uppercase">Loading...</div>;
  }

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
    return <Navigate to="/" replace />;
  }

  const tabs: { key: TabKey; name: string; icon: React.ElementType }[] = [
    { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { key: 'orders', name: 'Orders', icon: ShoppingCart },
    { key: 'inventory', name: 'Inventory', icon: Package },
    { key: 'clients', name: 'Clients', icon: Users },
    { key: 'appointments', name: 'Appointments', icon: HeartHandshake },
    { key: 'news', name: 'News & Blog', icon: Volume2 },
    { key: 'reviews', name: 'Reviews', icon: Star },
    { key: 'financials', name: 'Financials', icon: LineChart },
    { key: 'marketing', name: 'Marketing', icon: Volume2 },
    { key: 'promotions', name: 'Promotions', icon: Tag },
    { key: 'content', name: 'Pages & Content', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
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
      <aside 
        onMouseEnter={() => setIsDesktopExpanded(true)}
        onMouseLeave={() => setIsDesktopExpanded(false)}
        onClick={() => setIsDesktopExpanded(true)}
        className={`fixed md:relative inset-y-0 left-0 z-40 ${isDesktopExpanded ? 'md:w-64' : 'md:w-[80px]'} w-64 border-r border-surface-variant bg-surface flex flex-col justify-between shrink-0 transform transition-all duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 top-[65px] md:top-0' : '-translate-x-full'}`}
      >
        <div className="overflow-y-auto overflow-x-hidden">
          <div className={`h-24 hidden md:flex flex-col justify-center border-b border-surface-variant bg-surface-container/20 transition-all duration-300 ${isDesktopExpanded ? 'px-8 items-start' : 'px-0 items-center'}`}>
            {isDesktopExpanded ? (
               <>
                <span className="font-serif text-xl text-primary tracking-wide whitespace-nowrap">
                  GABBY NEWLUK
                </span>
                <span className="font-label text-[9px] tracking-widest uppercase text-on-surface-variant mt-1.5 flex items-center gap-2 whitespace-nowrap">
                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse shrink-0"></span> Admin Panel
                </span>
               </>
            ) : (
               <div className="w-10 h-10 bg-primary text-surface flex items-center justify-center font-serif text-xl font-bold rounded-sm">
                 G
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
        
        <div className={`border-t border-surface-variant bg-surface-container/20 transition-all duration-300 ${isDesktopExpanded ? 'p-6' : 'p-4 flex justify-center'}`}>
          <SignOutButton>
            <button 
              title="Logout" 
              className={`flex items-center justify-center gap-3 py-2.5 font-label text-[10px] tracking-[0.15em] uppercase text-red-700 border border-red-200 bg-red-50 hover:bg-red-700 hover:text-white transition-colors duration-300 rounded-none whitespace-nowrap overflow-hidden ${isDesktopExpanded ? 'w-full px-4 text-left' : 'w-10 h-10 px-0'}`}
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} /> 
              {isDesktopExpanded && <span>Logout</span>}
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
