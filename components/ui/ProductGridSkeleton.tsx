export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid animate-pulse grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="aspect-square rounded-2xl bg-surface-container" />
          <div className="mt-4 h-4 w-3/4 rounded bg-surface-container" />
          <div className="mt-2 h-3 w-1/2 rounded bg-surface-container" />
          <div className="mt-3 h-10 rounded-xl bg-surface-container" />
        </div>
      ))}
    </div>
  )
}
