import { useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '../components/admin/ConfirmDialog';

export function useConfirm() {
  const [request, setRequest] = useState<{ title: string; message: string; confirmLabel?: string; resolve: (value: boolean) => void; opener: HTMLElement | null } | null>(null);
  const confirm = useCallback((title: string, message: string, confirmLabel?: string) => new Promise<boolean>(resolve => {
    setRequest(previous => { previous?.resolve(false); return { title, message, confirmLabel, resolve, opener: document.activeElement as HTMLElement | null }; });
  }), []);
  useEffect(() => () => { setRequest(previous => { previous?.resolve(false); return null; }); }, []);
  const close = (value: boolean) => { if (!request) return; request.resolve(value); setRequest(null); };
  const dialog = request ? <ConfirmDialog open title={request.title} message={request.message} confirmLabel={request.confirmLabel} returnFocus={request.opener} onConfirm={() => close(true)} onCancel={() => close(false)} /> : null;
  return { confirm, dialog };
}
