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
          "flex w-full rounded-md border border-hu-input bg-hu-background px-3 py-2 text-base text-hu-foreground placeholder:text-hu-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hu-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          leftIcon && "pl-10",
          size === "sm" && "h-8 text-sm px-2",
          size === "lg" && "h-11 text-base px-4",
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
