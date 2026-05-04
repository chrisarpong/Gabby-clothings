import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ShoppingBag, Box, Scissors, Users, Star, BarChart3, Megaphone, Tag, Settings, LogOut } from 'lucide-react';
import { SignOutButton } from '@clerk/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userName?: string;
  isAdmin?: boolean;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'inventory', label: 'Inventory', icon: Box },
  { id: 'relations', label: 'Appointments', icon: Scissors },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'financials', label: 'Financials', icon: BarChart3, adminOnly: true },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, adminOnly: true },
  { id: 'promotions', label: 'Promotions', icon: Tag, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab, isOpen, onClose, userName, isAdmin }: SidebarProps) {
  const visibleTabs = TABS.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="md:hidden fixed inset-0 bg-bone/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-espresso text-white flex flex-col p-8 border-r border-[#3a1f1d]/10 shrink-0 transform transition-transform duration-300 ease-[0.16,1,0.3,1]
        md:relative md:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="mb-16">
          <h1 className="font-serif text-2xl tracking-widest uppercase text-white">G.N. Atelier</h1>
          <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-white/50 mt-3">Archival Ledger</p>
        </div>

        <nav className="flex-1 flex flex-col space-y-2">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === (tab.id === 'relations' ? 'relations' : tab.id);
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  onClose?.();
                }}
                className={`
                  flex items-center gap-4 py-3 px-4 transition-colors duration-500 rounded-none
                  ${isActive ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                `}
              >
                <Icon strokeWidth={1} className="w-4 h-4" />
                <span className="font-sans text-[11px] uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-10 mt-auto border-t border-white/10">
          <SignOutButton>
            <button className="flex items-center gap-4 w-full hover:bg-white/5 px-4 py-3 transition-colors text-left group">
              <div className="w-10 h-10 bg-white/5 rounded-none flex items-center justify-center flex-shrink-0 border border-white/5">
                <LogOut strokeWidth={1} className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-serif text-sm truncate text-white">{userName || 'Executive'}</p>
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-white/40 mt-1 truncate">Term_Session</p>
              </div>
            </button>
          </SignOutButton>
        </div>
      </div>
    </>
  );
}
