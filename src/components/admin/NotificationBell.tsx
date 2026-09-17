import React, { useState } from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Bell, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;
  const notifications = useQuery(api.notifications.getUserNotifications) || [];
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-variant/20 rounded-full"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-transparent"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-surface border border-outline-variant/30 shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-bold text-xs uppercase tracking-widest text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-[10px] text-primary hover:underline uppercase tracking-widest font-bold"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-on-surface-variant text-xs italic">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`p-4 border-b border-outline-variant/10 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm ${!notif.read ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <button 
                            onClick={() => markAsRead({ notificationId: notif._id })}
                            className="text-primary hover:text-tertiary"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">{notif.body}</p>
                      <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
