import React from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }: {
  open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" role="presentation">
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-6 shadow-xl">
      <h2 id="confirm-dialog-title" className="font-serif text-xl text-primary">{title}</h2>
      <p className="mt-3 text-sm text-on-surface-variant">{message}</p>
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-outline-variant">Cancel</button><button type="button" autoFocus onClick={onConfirm} className="px-4 py-2 text-sm bg-primary text-white">{confirmLabel}</button></div>
    </div>
  </div>;
}
