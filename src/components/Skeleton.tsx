import React from "react";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-none bg-surface-variant/40 ${className || ""}`}
      {...props}
    />
  );
}

export { Skeleton };
