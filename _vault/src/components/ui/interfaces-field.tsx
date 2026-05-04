/**
 * interfaces-field.tsx
 *
 * A composite field system for the Gabby Newluk checkout UI.
 * Provides semantic grouping, spacing discipline, and consistent
 * label/description typography without any external dependencies.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────
// FieldGroup — top-level container for all field sets
// Handles vertical rhythm between sections
// ─────────────────────────────────────────────
interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-10", className)}
      {...props}
    >
      {children}
    </div>
  )
)
FieldGroup.displayName = "FieldGroup"

// ─────────────────────────────────────────────
// FieldSet — groups a legend + related fields
// Replaces <fieldset> for better styling control
// ─────────────────────────────────────────────
interface FieldSetProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldSet = React.forwardRef<HTMLDivElement, FieldSetProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      {children}
    </div>
  )
)
FieldSet.displayName = "FieldSet"

// ─────────────────────────────────────────────
// FieldLegend — section heading (replaces <legend>)
// ─────────────────────────────────────────────
interface FieldLegendProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const FieldLegend = React.forwardRef<HTMLHeadingElement, FieldLegendProps>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-[13px] font-semibold tracking-[0.15em] uppercase text-[#3a1f1d]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
)
FieldLegend.displayName = "FieldLegend"

// ─────────────────────────────────────────────
// FieldDescription — soft helper text below legend
// ─────────────────────────────────────────────
interface FieldDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  FieldDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[12px] text-[#3a1f1d]/50 mt-0.5", className)}
    {...props}
  >
    {children}
  </p>
))
FieldDescription.displayName = "FieldDescription"

// ─────────────────────────────────────────────
// FieldSeparator — visual divider between FieldSets
// ─────────────────────────────────────────────
interface FieldSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldSeparator = React.forwardRef<HTMLDivElement, FieldSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-[1px] w-full bg-[#3a1f1d]/8 my-2", className)}
      {...props}
    />
  )
)
FieldSeparator.displayName = "FieldSeparator"

// ─────────────────────────────────────────────
// Field — individual label + input wrapper
// Provides consistent vertical spacing
// ─────────────────────────────────────────────
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
)
Field.displayName = "Field"

// ─────────────────────────────────────────────
// FieldLabel — label text above each input
// ─────────────────────────────────────────────
interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const FieldLabel = React.forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-[11px] uppercase tracking-[0.15em] font-medium text-[#3a1f1d]/60",
        className
      )}
      {...props}
    >
      {children}
    </label>
  )
)
FieldLabel.displayName = "FieldLabel"

// ─────────────────────────────────────────────
// FieldContent — wraps the actual input/control
// ─────────────────────────────────────────────
interface FieldContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const FieldContent = React.forwardRef<HTMLDivElement, FieldContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children}
    </div>
  )
)
FieldContent.displayName = "FieldContent"

// ─────────────────────────────────────────────
// FieldError — validation error message
// ─────────────────────────────────────────────
interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-[11px] text-red-600 mt-1", className)}
      {...props}
    >
      {children}
    </p>
  )
)
FieldError.displayName = "FieldError"

export {
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldSeparator,
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
}
