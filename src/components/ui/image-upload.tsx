import React, { useCallback, useRef, useState, useEffect } from "react";
import { ImagePlus, X, Upload, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface ImageUploadProps {
  title: React.ReactNode;
  hint: string;
  onChange: (file: File | null) => void;
}

export function ImageUpload({ title, hint, onChange }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onChange(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onChange(null);
  };

  // Cleanup memory leak
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, []);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#3a1f1d] text-center">
        {title}
      </div>

      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-56 cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#3a1f1d]/20 bg-[#F9F8F6] transition-colors hover:bg-[#3a1f1d]/5 hover:border-[#3a1f1d]/40",
            isDragging && "border-[#3a1f1d]/60 bg-[#3a1f1d]/10"
          )}
        >
          <div className="rounded-full bg-white p-3 shadow-sm border border-[#3a1f1d]/10">
            <ImagePlus className="h-6 w-6 text-[#3a1f1d]/60" />
          </div>
          <div className="text-center px-4">
            <p className="text-[13px] font-medium text-[#3a1f1d]">Click to select</p>
            <p className="text-[11px] text-[#3a1f1d]/60 mt-1">{hint}</p>
          </div>
        </div>
      ) : (
        <div className="relative group w-full">
          <div className="relative h-56 w-full overflow-hidden rounded-xl border border-[#3a1f1d]/10 shadow-sm">
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#3a1f1d]/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-[#3a1f1d] hover:scale-110 transition-transform shadow-lg">
                <Upload className="h-4 w-4" />
              </button>
              <button onClick={handleRemove} className="h-10 w-10 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-transform shadow-lg">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {fileName && (
            <div className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-widest text-[#3a1f1d]/70 bg-[#F9F8F6] px-4 py-2 border border-[#3a1f1d]/10 rounded-lg">
              <span className="truncate pr-4">{fileName}</span>
              <button onClick={handleRemove} className="shrink-0 hover:text-red-700 transition-colors"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
