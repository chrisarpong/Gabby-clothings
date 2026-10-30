import React from 'react';
import { api } from '../../../convex/_generated/api';
import { useStaffQuery } from '../../hooks/useStaffAuth';

export default function StaffFileLink({ storageId, index }: { storageId: string; index: number }) {
  const url = useStaffQuery(api.appointments.staffFileLink, { storageId: storageId as any });
  if (!url) return <span className="text-[10px] text-on-surface-variant">Loading…</span>;
  return <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-[10px] border border-blue-200 px-1.5 py-0.5">📷 {index + 1}</a>;
}
