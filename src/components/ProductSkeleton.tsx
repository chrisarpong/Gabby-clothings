import { Skeleton } from "./Skeleton";

export function ProductSkeleton() {
  return (
    <div className="flex flex-col h-full w-full">
      <Skeleton className="aspect-[3/4] w-full mb-6" />
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}
