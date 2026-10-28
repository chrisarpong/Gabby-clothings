import React, { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { useStaffAction, useStaffMutation, useStaffQuery } from '../../hooks/useStaffAuth';
import { MessageSquare, Send, Eye, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesTab() {
  const messages = useStaffQuery(api.messages.getMessages);
  const markAsRead = useStaffMutation(api.messages.markAsRead);
  const replyToMessage = useStaffAction(api.email.replyToMessage);
  const [replyingTo, setReplyingTo] = useState<Doc<'messages'> | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  if (messages === undefined) return <div className="p-8 text-sm text-on-surface-variant">Loading messages…</div>;

  const markRead = async (messageId: Id<'messages'>) => {
    try {
      await markAsRead({ messageId });
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update message');
    }
  };

  return (
    <div className="p-8 font-sans text-on-surface h-full bg-surface overflow-y-auto">
      <div className="mb-8 border-b border-outline-variant/30 pb-4">
        <h2 className="font-serif text-3xl text-primary mb-1 tracking-tight">Messages</h2>
        <p className="text-sm text-on-surface-variant">Customer messages and replies.</p>
      </div>
      <div className="bg-surface-container border border-outline-variant/30 shadow-sm">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant italic text-sm">No messages yet.</div>
        ) : messages.map((message: Doc<'messages'>) => (
          <article key={message._id} className={`p-5 border-b border-outline-variant/10 ${message.status === 'unread' ? 'bg-surface-container/10' : ''}`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-medium text-primary">{message.name} <span className="text-xs text-on-surface-variant">{message.email}</span></p>
                <p className="text-xs font-semibold text-primary mt-2">{message.subject}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-on-surface-variant">{new Date(message._creationTime).toLocaleDateString()}</span>
                <button onClick={() => setReplyingTo(message)} title="Reply to message" className="text-primary"><MessageSquare className="w-4 h-4" /></button>
                {message.status === 'unread' && <button onClick={() => markRead(message._id)} title="Mark as read" className="text-primary"><Eye className="w-4 h-4" /></button>}
              </div>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-3 whitespace-pre-wrap">{message.message}</p>
          </article>
        ))}
      </div>

      {replyingTo && (
        <div className="fixed inset-0 bg-primary/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-2xl border border-outline-variant shadow-xl">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container">
              <h3 className="font-serif text-2xl text-primary">Reply to {replyingTo.name}</h3>
              <button onClick={() => setReplyingTo(null)} aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-on-surface-variant">To: {replyingTo.email} · {replyingTo.subject}</p>
              <textarea value={reply} onChange={event => setReply(event.target.value)} rows={8} className="w-full p-3 border border-outline-variant bg-surface focus:outline-none focus:border-primary" placeholder="Type your response" />
            </div>
            <div className="p-6 border-t border-outline-variant bg-surface-container flex justify-end">
              <button
                disabled={sending || !reply.trim()}
                onClick={async () => {
                  if (!reply.trim()) return;
                  setSending(true);
                  try {
                    await replyToMessage({ messageId: replyingTo._id, message: reply });
                    toast.success('Reply sent');
                    setReplyingTo(null);
                    setReply('');
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to send reply');
                  } finally {
                    setSending(false);
                  }
                }}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
