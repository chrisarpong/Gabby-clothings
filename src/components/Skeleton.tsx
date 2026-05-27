import React from "react";
import { cn } from "../lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-none bg-surface-variant/40", className)}
      {...props}
    />
  );
}

export { Skeleton };
