import React, { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import { useStaffMutation } from '../../hooks/useStaffAuth';
import { toast } from 'sonner';

export default function StaffFileLink({ storageId, index }: { storageId: string; index: number }) {
  const createLink = useStaffMutation(api.appointments.createStaffFileLink);
  const [loading, setLoading] = useState(false);
  const open = async () => {
    const win = window.open('', '_blank');
    if (win) win.opener = null;
    setLoading(true);
    try {
      const url = await createLink({ storageId: storageId as any });
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch (error) {
      win?.close();
      toast.error(error instanceof Error ? error.message : 'Could not open file');
    } finally { setLoading(false); }
  };
  return <button type="button" disabled={loading} onClick={open} className="text-blue-600 hover:underline text-[10px] border border-blue-200 px-1.5 py-0.5 disabled:opacity-50">{loading ? 'Loading…' : `📷 ${index + 1}`}</button>;
}
