import React from 'react';

export const FileUpload = {
  Root: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col gap-4 w-full">{children}</div>
  ),
  DropZone: ({ accept, hint, onDropFiles }: { accept?: string, hint?: string, onDropFiles: (files: FileList) => void }) => {
    return (
      <div className="relative overflow-hidden border border-dashed border-[#3a1f1d]/30 rounded-xl p-8 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-[#F9F8F6] hover:border-[#3a1f1d]/50 transition-all duration-300 group">
        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
          <div className="w-10 h-10 mb-3 rounded-full bg-[#3a1f1d]/5 flex items-center justify-center text-[#3a1f1d] group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <span className="text-sm font-medium text-[#3a1f1d] mb-1">Click to upload or drag and drop</span>
          <span className="text-xs opacity-60 text-center">{hint}</span>
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
            accept={accept} 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                onDropFiles(e.target.files);
              }
            }} 
          />
        </label>
      </div>
    );
  },
  List: ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col gap-3 w-full">{children}</div>
  ),
  ListItemProgressBar: ({ name, size, progress, onDelete }: any) => {
    const sizeKB = (size / 1024).toFixed(1);
    const sizeMB = (size / 1024 / 1024).toFixed(2);
    const displaySize = size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
    
    return (
      <div className="flex items-center justify-between p-4 border border-[#3a1f1d]/10 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-4 flex-1 overflow-hidden">
          <div className="w-8 h-8 shrink-0 rounded-full bg-green-50 flex items-center justify-center text-green-600">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-xs font-medium text-[#3a1f1d] truncate">{name}</span>
            <span className="text-[10px] opacity-60 mt-0.5">{displaySize} • {progress}% uploaded</span>
          </div>
        </div>
        <button type="button" onClick={onDelete} className="ml-4 p-2 shrink-0 text-[#3a1f1d]/40 border border-transparent rounded hover:border-[#3a1f1d]/20 hover:bg-[#3a1f1d]/5 hover:text-red-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    );
  }
};
