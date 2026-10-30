import React, { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, returnFocus }: {
  open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; returnFocus?: HTMLElement | null;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    return () => { if (returnFocus && document.contains(returnFocus)) returnFocus.focus(); };
  }, [returnFocus]);
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); onCancel(); return; }
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  if (!open) return null;
  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={event => { if (event.target === event.currentTarget) onCancel(); }} onKeyDown={onKeyDown}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="w-full max-w-md bg-surface-container-lowest border border-outline-variant p-6 shadow-xl">
      <h2 id="confirm-dialog-title" className="font-serif text-xl text-primary">{title}</h2>
      <p className="mt-3 text-sm text-on-surface-variant">{message}</p>
      <div className="mt-6 flex justify-end gap-3"><button ref={cancelRef} type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-outline-variant">Cancel</button><button type="button" onClick={onConfirm} className="px-4 py-2 text-sm bg-primary text-white">{confirmLabel}</button></div>
    </div>
  </div>;
}
