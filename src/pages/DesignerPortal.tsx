import React, { useState } from 'react';
import { useStaffAuth } from '../hooks/useStaffAuth';
import { Scissors, Calendar, Archive, Ruler, LogOut } from 'lucide-react';
import DesignerTasks from '../components/designer/DesignerTasks';
import DesignerAppointments from '../components/designer/DesignerAppointments';
import DesignerHistory from '../components/designer/DesignerHistory';
import DesignerMeasurements from '../components/designer/DesignerMeasurements';

export default function DesignerPortal() {
  const { profile, logout } = useStaffAuth();

  const [activeTab, setActiveTab] = useState<'tasks' | 'appointments' | 'history' | 'measurements'>('tasks');

  if (!profile) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return <DesignerTasks />;
      case 'appointments':
        return <DesignerAppointments />;
      case 'history':
        return <DesignerHistory />;
      case 'measurements':
        return <DesignerMeasurements />;
      default:
        return <DesignerTasks />;
    }
  };

  const navItems = [
    { id: 'tasks', label: 'Active Tasks', icon: Scissors },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'history', label: 'Completed Work', icon: Archive },
    { id: 'measurements', label: 'Measurement DB', icon: Ruler },
  ] as const;

  return (
    <div className="min-h-screen flex bg-surface-container-lowest font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface border-r border-surface-variant flex flex-col hidden md:flex">
        <div className="p-6 border-b border-surface-variant">
          <h1 className="font-serif text-2xl text-primary tracking-tight mb-2">Designer Portal</h1>
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
                onClick={() => setActiveTab(item.id as any)}
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
          <h1 className="font-serif text-xl text-primary tracking-tight">Designer Workspace</h1>
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
