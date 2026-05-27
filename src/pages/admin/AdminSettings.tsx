import React, { useState } from 'react';
import { User, Bell, Lock, Globe, Database, HelpCircle } from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General Info', icon: Globe },
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Export', icon: Database },
  ];

  return (
    <div className="p-10 flex flex-col h-full overflow-hidden max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-10 shrink-0">
        <h1 className="font-serif text-3xl md:text-4xl text-primary tracking-tight">Settings</h1>
        <p className="font-label text-xs tracking-[0.2em] uppercase text-outline mt-3">Platform Configuration & Preferences</p>
      </div>

      <div className="flex flex-1 overflow-hidden border border-outline-variant/30 bg-surface">
        
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-outline-variant/30 bg-surface-container/10 flex flex-col pt-4 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 font-label text-[10px] tracking-[0.15em] uppercase transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-surface-container/40 text-primary border-r-2 border-primary'
                    : 'text-outline hover:bg-surface-container/20 hover:text-primary border-r-2 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            );
          })}
          
          <div className="mt-auto p-6">
            <button className="flex items-center gap-2 text-outline hover:text-primary transition-colors font-label text-[10px] tracking-widest uppercase">
              <HelpCircle className="w-4 h-4" /> Help Center
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 overflow-y-auto p-10 lg:p-14">
          
          {activeTab === 'general' && (
            <div className="max-w-xl animate-in fade-in duration-300">
              <h2 className="font-serif text-2xl text-primary mb-8 pb-4 border-b border-outline-variant/30">General Information</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Store Name</label>
                  <input 
                    type="text" 
                    defaultValue="Gabby Newluk Atelier"
                    className="w-full bg-transparent border-b border-outline-variant/50 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary" 
                  />
                </div>
                
                <div>
                  <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Support Email</label>
                  <input 
                    type="email" 
                    defaultValue="contact@gabbynewluk.com"
                    className="w-full bg-transparent border-b border-outline-variant/50 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Currency</label>
                    <select defaultValue="GHS (GH₵)" className="w-full bg-transparent border-b border-outline-variant/50 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary cursor-pointer appearance-none rounded-none">
                      <option>USD ($)</option>
                      <option>GHS (GH₵)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Timezone</label>
                    <select className="w-full bg-transparent border-b border-outline-variant/50 py-2 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary cursor-pointer appearance-none rounded-none">
                      <option>Eastern Time (ET)</option>
                      <option>Pacific Time (PT)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-label text-[10px] tracking-widest uppercase text-outline mb-3">Store Location Address</label>
                  <textarea 
                    rows={3} 
                    defaultValue="124 Sartorial Way, Fashion District, New York, NY 10001"
                    className="w-full bg-transparent border border-outline-variant/30 p-3 font-sans text-sm focus:outline-none focus:border-primary transition-colors text-primary resize-none" 
                  />
                </div>
              </div>

              <div className="mt-12">
                <button className="bg-primary text-on-primary px-8 py-4 font-label text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'general' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-surface-container/50 flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-outline" strokeWidth={1} />
              </div>
              <h3 className="font-serif text-2xl text-primary mb-2">Configuration Module</h3>
              <p className="font-sans text-sm text-outline max-w-sm mx-auto">
                The {tabs.find(t => t.id === activeTab)?.label} panel is currently restricted in the sandbox environment.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
