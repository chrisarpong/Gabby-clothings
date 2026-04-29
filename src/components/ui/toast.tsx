import { Toaster as SonnerToaster } from "sonner";

/**
 * Gabby Newluk – Luxury Toast Provider
 * 
 * Renders a globally-styled Sonner toaster that matches the brand's
 * editorial aesthetic. Mount once in App.tsx.
 * 
 * Usage anywhere in the app:
 *   import { toast } from "sonner";
 *   toast.success("Saved");
 *   toast.error("Something went wrong");
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-4 w-full max-w-[420px] px-6 py-4 bg-[#3a1f1d] text-[#F9F8F6] text-[13px] tracking-wide shadow-[0_8px_30px_rgba(58,31,29,0.25)] border border-[#3a1f1d]/80",
          title: "font-normal",
          description: "text-[#F9F8F6]/60 text-[12px] mt-0.5",
          actionButton:
            "bg-[#F9F8F6] text-[#3a1f1d] text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 hover:bg-white transition-colors ml-auto shrink-0",
          cancelButton:
            "text-[#F9F8F6]/60 text-[10px] uppercase tracking-[0.2em] hover:text-[#F9F8F6] transition-colors ml-auto shrink-0",
          success: "bg-[#3a1f1d] border-emerald-800/30",
          error: "bg-[#3a1f1d] border-red-800/30",
          warning: "bg-[#3a1f1d] border-amber-700/30",
          info: "bg-[#3a1f1d] border-[#3a1f1d]/60",
        },
      }}
      style={{ fontFamily: "'Jost', sans-serif" }}
      duration={3000}
      closeButton={false}
      gap={8}
    />
  );
}
