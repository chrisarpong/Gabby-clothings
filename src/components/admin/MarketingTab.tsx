
import React, { useState } from 'react';
import { useQuery, useMutation, useAction } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { Mail, Users, Eye, EyeOff, Send, MessageSquare, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingTab() {
  const messages = useQuery(api.messages.getMessages);
  const subscribers = useQuery(api.subscribers.getAll);
  const markAsRead = useMutation(api.messages.markAsRead);
  const sendNewsletterBroadcast = useAction(api.email.sendNewsletterBroadcast);
  const replyToMessageAction = useAction(api.email.replyToMessage);

  // Newsletter State
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);

  // Reply State
  const [replyingToMsg, setReplyingToMsg] = useState<Doc<"messages"> | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

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

  const unreadCount = messages.filter((m: Doc<"messages">) => m.status === "unread").length;
  const activeSubscribers = subscribers.filter((s: Doc<"subscribers">) => s.status === "active").length;

  const handleMarkRead = async (messageId: Id<"messages">) => {
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
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setIsNewsletterModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-on-primary font-label text-[11px] tracking-[0.2em] uppercase py-3 px-6 hover:bg-surface-tint transition-colors"
          >
            <Send className="w-4 h-4" /> Compose Newsletter
          </button>
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
              messages.map((msg: Doc<"messages">) => (
                <div key={msg._id} className={`p-4 border-b border-outline-variant/10 ${msg.status === 'unread' ? 'bg-surface-container/10' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-sans text-sm font-medium text-primary">{msg.name}</span>
                      <span className="text-xs text-on-surface-variant ml-2">{msg.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-on-surface-variant">{new Date(msg._creationTime).toLocaleDateString()}</span>
                      
                      <button 
                        onClick={() => setReplyingToMsg(msg)} 
                        className="text-primary hover:text-primary/70 transition-colors flex items-center gap-1" 
                        title="Reply to message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

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
                  {subscribers.map((sub: Doc<"subscribers">) => (
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

      {/* Compose Newsletter Modal */}
      {isNewsletterModalOpen && (
        <div className="fixed inset-0 bg-brand-charcoal/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-2xl border border-outline-variant shadow-xl">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <h3 className="font-serif text-2xl text-primary">Compose Newsletter</h3>
              <button onClick={() => setIsNewsletterModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-surface-variant/30 p-4 border border-outline-variant text-sm text-on-surface-variant italic">
                This email will be sent to <strong>{activeSubscribers}</strong> active subscribers.
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant">Subject</label>
                <input 
                  type="text" 
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                  className="p-3 border border-outline-variant bg-surface focus:outline-none focus:border-primary font-sans text-primary"
                  placeholder="e.g. New Collection Arrival"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant">Message (HTML supported internally)</label>
                <textarea 
                  value={newsletterMessage}
                  onChange={(e) => setNewsletterMessage(e.target.value)}
                  rows={8}
                  className="p-3 border border-outline-variant bg-surface focus:outline-none focus:border-primary font-sans text-primary resize-y"
                  placeholder="Write your newsletter content here..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant bg-surface-container flex justify-end gap-4">
              <button 
                onClick={() => setIsNewsletterModalOpen(false)}
                className="px-6 py-3 font-label text-xs tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors"
                disabled={isSendingNewsletter}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!newsletterSubject || !newsletterMessage) return toast.error("Please fill in subject and message.");
                  setIsSendingNewsletter(true);
                  try {
                    const result = await sendNewsletterBroadcast({ subject: newsletterSubject, message: newsletterMessage });
                    toast.success(result);
                    setIsNewsletterModalOpen(false);
                    setNewsletterSubject("");
                    setNewsletterMessage("");
                  } catch (e: any) {
                    toast.error(e.message || "Failed to send newsletter.");
                  } finally {
                    setIsSendingNewsletter(false);
                  }
                }}
                disabled={isSendingNewsletter}
                className="flex items-center gap-2 bg-primary text-on-primary font-label text-xs tracking-widest uppercase py-3 px-8 hover:bg-surface-tint transition-colors disabled:opacity-50"
              >
                {isSendingNewsletter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingNewsletter ? "Sending..." : "Broadcast"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyingToMsg && (
        <div className="fixed inset-0 bg-brand-charcoal/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-2xl border border-outline-variant shadow-xl">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <h3 className="font-serif text-2xl text-primary">Reply to {replyingToMsg.name}</h3>
              <button onClick={() => setReplyingToMsg(null)} className="text-on-surface-variant hover:text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-surface-variant/30 p-4 border border-outline-variant text-sm">
                <p className="text-on-surface-variant"><strong>To:</strong> {replyingToMsg.email}</p>
                <p className="text-on-surface-variant"><strong>Regarding:</strong> {replyingToMsg.subject}</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label text-xs tracking-widest uppercase text-on-surface-variant">Your Reply</label>
                <textarea 
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={8}
                  className="p-3 border border-outline-variant bg-surface focus:outline-none focus:border-primary font-sans text-primary resize-y"
                  placeholder="Type your response here..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant bg-surface-container flex justify-end gap-4">
              <button 
                onClick={() => setReplyingToMsg(null)}
                className="px-6 py-3 font-label text-xs tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors"
                disabled={isSendingReply}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!replyMessage) return toast.error("Message cannot be empty.");
                  setIsSendingReply(true);
                  try {
                    await replyToMessageAction({ 
                      email: replyingToMsg.email, 
                      subject: replyingToMsg.subject, 
                      message: replyMessage, 
                      originalMessage: replyingToMsg.message 
                    });
                    toast.success("Reply sent successfully.");
                    if (replyingToMsg.status === 'unread') {
                      await markAsRead({ messageId: replyingToMsg._id });
                    }
                    setReplyingToMsg(null);
                    setReplyMessage("");
                  } catch (e: any) {
                    toast.error(e.message || "Failed to send reply.");
                  } finally {
                    setIsSendingReply(false);
                  }
                }}
                disabled={isSendingReply}
                className="flex items-center gap-2 bg-primary text-on-primary font-label text-xs tracking-widest uppercase py-3 px-8 hover:bg-surface-tint transition-colors disabled:opacity-50"
              >
                {isSendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSendingReply ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
