import { useCallback, useState } from 'react';
import ConfirmDialog from '../components/admin/ConfirmDialog';

export function useConfirm() {
  const [request, setRequest] = useState<{ title: string; message: string; confirmLabel?: string; resolve: (value: boolean) => void } | null>(null);
  const confirm = useCallback((title: string, message: string, confirmLabel?: string) => new Promise<boolean>(resolve => setRequest({ title, message, confirmLabel, resolve })), []);
  const dialog = request ? <ConfirmDialog open title={request.title} message={request.message} confirmLabel={request.confirmLabel} onConfirm={() => { request.resolve(true); setRequest(null); }} onCancel={() => { request.resolve(false); setRequest(null); }} /> : null;
  return { confirm, dialog };
}
