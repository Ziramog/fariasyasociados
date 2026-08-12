export function ReviewSkeleton() {
  return (
    <div className="flex flex-col p-5 rounded-2xl border border-zinc-100 bg-white animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-zinc-200 rounded w-32" />
          <div className="h-3 bg-zinc-100 rounded w-20" />
        </div>
      </div>
      <div className="flex gap-1 mt-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-3.5 h-3.5 rounded bg-zinc-200" />)}</div>
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-100 rounded w-5/6" />
        <div className="h-3 bg-zinc-100 rounded w-4/6" />
      </div>
    </div>
  );
}

export function ReviewGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <ReviewSkeleton key={i} />)}
    </div>
  );
}
