import React from 'react';
import { Users, Search } from 'lucide-react';

export default function SalesCRM() {
  return (
    <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-serif text-2xl text-primary mb-1">Client Directory</h2>
          <p className="text-sm text-on-surface-variant">Manage walk-in clients and view their measurements.</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant bg-surface text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-surface border border-surface-variant flex-1 flex flex-col items-center justify-center text-center p-8">
        <Users className="w-12 h-12 text-outline mb-4" />
        <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-2">CRM Under Construction</h3>
        <p className="text-on-surface-variant text-sm max-w-md">
          This tab will show a list of past walk-in clients, their contact information, and their custom measurements for easy re-ordering.
        </p>
      </div>
    </div>
  );
}
