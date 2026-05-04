import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { SlideOut } from './SlideOut';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function ClientsTab() {
  const clients = useQuery(api.users.getAllUsers) || [];
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    let result = clients;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c: any) => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || 
        c._id?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, clients]);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-6xl w-full"
      >
        <header className="mb-8 md:mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-espresso/10 pb-6 gap-4 md:gap-0">
            <div>
              <h2 className="font-sans text-[10px] uppercase tracking-[0.4em] text-espresso/60 mb-2">The Inner Circle</h2>
              <h1 className="font-serif text-3xl md:text-4xl">Patron Registry</h1>
            </div>
            <div className="relative w-full sm:w-64">
              <Search strokeWidth={1} className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/40" />
              <input 
                type="text" 
                placeholder="SEARCH REGISTRY..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-espresso/20 py-2 pl-6 pr-4 outline-none focus:border-espresso font-sans text-[10px] tracking-[0.2em] shadow-none rounded-none placeholder:text-espresso/30 uppercase text-espresso transition-colors"
              />
            </div>
          </div>
        </header>

        <div className="bg-white border border-espresso/10 shadow-none rounded-none overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-espresso/10 bg-bone/30">
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Patron ID</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Name</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal">Contact</th>
                <th className="py-4 px-6 font-sans text-[9px] uppercase tracking-[0.4em] text-espresso/50 font-normal text-right">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? filteredClients.map((client: any) => (
                <tr 
                  key={client._id} 
                  onClick={() => setSelectedClient(client)}
                  className={`border-b border-espresso/5 hover:bg-bone/40 transition-colors last:border-0 cursor-pointer`}
                >
                  <td className="py-5 px-6 align-middle">
                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/70">#{client._id?.substring(client._id.length - 6).toUpperCase()}</span>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <span className="font-serif text-lg text-espresso">{client.firstName} {client.lastName}</span>
                  </td>
                  <td className="py-5 px-6 align-middle">
                    <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-espresso/50">{client.email}</span>
                  </td>
                  <td className="py-5 px-6 align-middle text-right">
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em] border border-espresso/10 px-2 py-1">{client.role || 'Patron'}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-espresso/50">
                    <p className="font-serif text-xl italic mb-2">No patrons registered.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <SlideOut 
        isOpen={!!selectedClient} 
        onClose={() => setSelectedClient(null)}
        title="Patron Profile"
        subtitle={`${selectedClient?.firstName} ${selectedClient?.lastName}`}
      >
        {selectedClient && (
          <div className="space-y-12">
            <div>
               <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Registry Record</h3>
               <div className="space-y-6">
                 <div className="flex justify-between items-end border-b border-espresso/10 pb-2">
                   <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/60">Email</span>
                   <span className="font-serif text-lg tracking-wide text-espresso">{selectedClient.email}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-espresso/10 pb-2">
                   <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/60">Role</span>
                   <span className="font-serif text-lg tracking-wide text-espresso">{selectedClient.role || 'Patron'}</span>
                 </div>
                 <div className="flex justify-between items-end border-b border-espresso/10 pb-2">
                   <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-espresso/60">Admitted On</span>
                   <span className="font-serif text-lg tracking-wide text-espresso">{new Date(selectedClient._creationTime).toLocaleDateString()}</span>
                 </div>
               </div>
            </div>

            {selectedClient.measurements && (
              <div>
                <h3 className="font-sans text-[9px] uppercase tracking-[0.3em] text-espresso/50 mb-4">Anatomical Record</h3>
                <div className="space-y-4">
                  {Object.entries(selectedClient.measurements).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center border-b border-espresso/5 pb-2">
                      <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-espresso/40">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="font-serif text-base text-espresso">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SlideOut>
    </>
  );
}
