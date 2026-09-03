export function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-7 w-40 rounded bg-surface-raised" />
      <div className="mb-4 h-10 w-full max-w-2xl rounded bg-surface-raised" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`skeleton-row-${index}`} className="h-11 w-full rounded bg-surface-raised" />
        ))}
      </div>
    </div>
  );
}
