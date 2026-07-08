import React from 'react';
import { useQuery } from '@/hooks/useConvex';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Image as ImageIcon } from 'lucide-react';

interface CMSImagePreviewProps {
  imageId: string;
  className?: string;
  alt?: string;
}

export function CMSImagePreview({ imageId, className = "w-full h-full object-cover", alt = "Preview" }: CMSImagePreviewProps) {
  const url = useQuery(api.products.getFileUrl, { storageId: imageId as Id<"_storage"> });

  if (url === undefined) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-surface-variant/30 animate-pulse">
        <ImageIcon className="w-5 h-5 text-on-surface-variant/50" />
      </div>
    );
  }

  if (url === null) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-surface-variant/30 text-[10px] text-red-500 text-center p-2 font-mono">
        Invalid<br/>Image
      </div>
    );
  }

  return (
    <img src={url} alt={alt} className={className} />
  );
}
