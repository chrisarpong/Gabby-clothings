'use client'

import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-center" 
      theme="dark" 
      toastOptions={{
        style: {
          background: '#09090b',
          border: '1px solid #27272a',
          color: '#ffffff',
          borderRadius: '0.5rem',
        },
        className: 'font-sans'
      }}
    />
  );
}

export { toast };
