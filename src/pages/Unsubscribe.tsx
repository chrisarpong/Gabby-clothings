import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@/hooks/useConvex';
import { api } from '../../convex/_generated/api';
import { useEffect, useState } from 'react';

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const unsubscribe = useMutation(api.subscribers.unsubscribe);
  const [message, setMessage] = useState('Processing your unsubscribe request…');
  useEffect(() => {
    const email = params.get('email'); const token = params.get('token');
    if (!email || !token) { setMessage('This unsubscribe link is incomplete.'); return; }
    unsubscribe({ email, token }).then(() => setMessage('You have been unsubscribed from marketing emails.')).catch(() => setMessage('This unsubscribe link is invalid or expired.'));
  }, [params, unsubscribe]);
  return <main className="min-h-screen flex items-center justify-center p-8"><div className="text-center"><h1 className="font-serif text-4xl text-primary mb-4">Email preferences</h1><p className="text-on-surface-variant">{message}</p></div></main>;
}
