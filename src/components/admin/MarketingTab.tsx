
import React from 'react';
import { useQuery, useMutation } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Mail, Users, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingTab() {
  const messages = useQuery(api.messages.getMessages);
  const subscribers = useQuery(api.subscribers.getAll);
  const markAsRead = useMutation(api.messages.markAsRead);

  if (messages === undefined || subscribers === undefined) {
    return (
      <div className="p-8 font-sans space-y-6">
        <div className="h-12 bg-surface-variant/30 animate-pulse rounded-sm w-1/3" />
        <div className="grid grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-28 bg-surface-variant/30 animate-pulse rounded-sm" />
          ))}
        </div>
        <div className="h-64 bg-surface-variant/30 animate-pulse rounded-sm" />
      </div>
    );
  }

  const unreadCount = messages.filter(m => m.status === "unread").length;
  const activeSubscribers = subscribers.filter(s => s.status === "active").length;

  const handleMarkRead = async (messageId: any) => {
    try {
      await markAsRead({ messageId });
      toast.success("Marked as read");
    } catch { toast.error("Failed to update message"); }
  };

  return (
    <div className="p-8 font-sans text-brand-charcoal h-full bg-surface overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Messages & Subscribers</h2>
          <p className="text-sm text-on-surface-variant">Contact form messages and newsletter subscriber list.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex items-center gap-6">
          <div className="p-3 bg-surface rounded-sm border border-outline-variant/30 text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Messages</span>
            <span className="text-2xl font-serif text-primary">{messages.length}</span>
            {unreadCount > 0 && <span className="text-xs text-amber-600 mt-1">{unreadCount} unread</span>}
          </div>
        </div>
        <div className="bg-surface-container/20 border border-outline-variant/30 p-6 flex items-center gap-6">
          <div className="p-3 bg-surface rounded-sm border border-outline-variant/30 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-label">Newsletter Subscribers</span>
            <span className="text-2xl font-serif text-primary">{activeSubscribers}</span>
            <span className="text-xs text-on-surface-variant mt-1">{subscribers.length} total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Inbox */}
        <div className="bg-white border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
            <h3 className="font-serif text-xl tracking-tight text-primary">Contact Messages</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] uppercase font-label tracking-wide px-2 py-1 bg-amber-50 text-amber-700">{unreadCount} new</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant italic text-sm">No messages yet.</div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`p-4 border-b border-outline-variant/10 ${msg.status === 'unread' ? 'bg-surface-container/10' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-sans text-sm font-medium text-primary">{msg.name}</span>
                      <span className="text-xs text-on-surface-variant ml-2">{msg.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-on-surface-variant">{new Date(msg._creationTime).toLocaleDateString()}</span>
                      {msg.status === 'unread' && (
                        <button onClick={() => handleMarkRead(msg._id)} className="text-primary hover:text-primary/70 transition-colors" title="Mark as read">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-primary mb-1">{msg.subject}</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white border border-outline-variant/30 shadow-sm flex flex-col">
          <div className="p-6 border-b border-outline-variant/30">
            <h3 className="font-serif text-xl tracking-tight text-primary">Newsletter Subscribers</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {subscribers.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant italic text-sm">No subscribers yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container/20 border-b border-outline-variant/30">
                    <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Email</th>
                    <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Status</th>
                    <th className="p-4 font-label text-[10px] tracking-widest uppercase text-on-surface-variant">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub._id} className="border-b border-outline-variant/10">
                      <td className="p-4 text-sm text-primary">{sub.email}</td>
                      <td className="p-4">
                        <span className={`text-[10px] uppercase font-label tracking-wide px-2 py-1 ${
                          sub.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>{sub.status}</span>
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant">{new Date(sub._creationTime).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
