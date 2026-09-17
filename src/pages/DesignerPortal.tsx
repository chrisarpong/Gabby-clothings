import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { Scissors, Calendar, Archive, Ruler, LogOut } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import DesignerTasks from '../components/designer/DesignerTasks';
import DesignerAppointments from '../components/designer/DesignerAppointments';
import DesignerHistory from '../components/designer/DesignerHistory';
import DesignerMeasurements from '../components/designer/DesignerMeasurements';

export default function DesignerPortal() {
  const { user, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);

  const [activeTab, setActiveTab] = useState<'tasks' | 'appointments' | 'history' | 'measurements'>('tasks');

  if (!isLoaded || (user && convexUser === undefined)) {
    return <div className="min-h-screen bg-surface flex items-center justify-center font-sans tracking-widest text-primary text-sm uppercase">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-surface text-primary font-sans">
        <Scissors className="w-12 h-12 mb-4 text-outline" />
        <h1 className="font-serif text-3xl mb-2 text-primary">Designer Portal</h1>
        <p className="text-on-surface-variant mb-8">Please sign in to view your assigned orders.</p>
        <SignInButton mode="modal" fallbackRedirectUrl="/designer">
          <button className="px-6 py-3 bg-primary text-surface font-sans text-xs tracking-widest uppercase hover:bg-tertiary transition-colors rounded-none">
            Log In
          </button>
        </SignInButton>
      </div>
    );
  }

  // Basic check: they must be a staff user (or have a role) to access this
  if (!convexUser?.roleId && convexUser?.role === 'client') {
    return <Navigate to="/" replace />;
  }

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
            {user.firstName} {user.lastName}
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
          <a href="/" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Exit Portal
          </a>
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
