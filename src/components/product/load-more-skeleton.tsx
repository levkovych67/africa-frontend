export function LoadMoreSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-square rounded-2xl bg-stone-100 animate-pulse" />
          <div className="flex justify-between px-1">
            <div className="h-4 w-1/2 bg-stone-100 rounded animate-pulse" />
            <div className="h-4 w-1/4 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
