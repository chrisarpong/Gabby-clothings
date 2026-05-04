import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex w-full border-0 border-b border-[#3a1f1d]/20 rounded-none bg-transparent px-0 py-3 text-[15px] text-[#3a1f1d] placeholder:text-[#3a1f1d]/30 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#3a1f1d] shadow-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
