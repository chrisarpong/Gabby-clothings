import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full border-0 border-b border-[#3a1f1d]/20 rounded-none bg-transparent px-0 py-3 text-[15px] text-[#3a1f1d] placeholder:text-[#3a1f1d]/30 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#3a1f1d] shadow-none transition-colors duration-200 resize-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
