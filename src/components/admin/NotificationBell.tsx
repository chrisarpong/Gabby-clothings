import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../../../convex/_generated/api';
import { useStaffQuery } from '../../hooks/useStaffAuth';

type StaffTab = 'messages' | 'appointments' | 'orders';

export default function NotificationBell({ onNavigate }: { onNavigate: (tab: StaffTab) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const feed = useStaffQuery(api.staffNotifications.getFeed);
  const unreadCount = feed?.counts.total ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(open => !open)}
        aria-label={`Open notifications${unreadCount ? `, ${unreadCount} items` : ''}`}
        className="relative p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-variant/20 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-surface">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-transparent" />
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant/30 shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-outline-variant/30 bg-surface-container-lowest">
                <h3 className="font-bold text-xs uppercase tracking-widest text-primary">Staff notifications</h3>
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {feed === undefined ? (
                  <div className="p-6 text-center text-on-surface-variant text-xs">Loading notifications…</div>
                ) : feed.items.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-xs italic">No notifications right now.</div>
                ) : feed.items.map((item, index) => (
                  <button
                    key={`${item.type}-${item.createdAt}-${index}`}
                    onClick={() => { setIsOpen(false); onNavigate(item.tab as StaffTab); }}
                    className="w-full text-left p-4 border-b border-outline-variant/10 hover:bg-primary/5 transition-colors"
                  >
                    <span className="block text-sm font-medium text-primary">{item.title}</span>
                    <span className="block mt-1 text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">{new Date(item.createdAt).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
