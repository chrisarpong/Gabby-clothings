import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  leftIcon?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, size = "md", ...props }, ref) => (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-hu-muted-foreground pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg border-2 border-hu-border bg-white text-base text-hu-foreground transition-all duration-200 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#3a1f1d] disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-11",
          size === "sm" && "h-10 text-sm px-3",
          size === "md" && "h-14 text-base px-4",
          size === "lg" && "h-16 text-lg px-5",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
)
Input.displayName = "Input"

export { Input }
