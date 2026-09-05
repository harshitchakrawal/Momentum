function Block({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block rounded bg-line motion-safe:animate-pulse ${className}`}
    />
  )
}

export function StatTileSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3.5">
      <Block className="my-0.75 h-3 w-20" />
      <Block className="mt-2 h-6.5 w-16" />
      <Block className="mt-2.75 mb-0.75 h-3 w-24" />
    </div>
  )
}

const HEATMAP_WEEKS = 53
const HEATMAP_MIN_WIDTH = HEATMAP_WEEKS * 11 + (HEATMAP_WEEKS - 1) * 3

export function HeatmapSkeleton({ weeks = HEATMAP_WEEKS }: { weeks?: number }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <Block className="my-1 h-3.5 w-32" />
        <Block className="my-0.75 h-3 w-28" />
      </div>

      <div className="overflow-hidden pb-1">
        <div className="flex gap-1.5" style={{ minWidth: HEATMAP_MIN_WIDTH }}>
          <div
            className="grid w-5 shrink-0 pr-1"
            style={{ gap: 3, gridTemplateRows: 'repeat(8, minmax(0, 1fr))' }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center">
                {i === 2 || i === 4 || i === 6 ? (
                  <Block className="h-1.75 w-full" />
                ) : null}
              </span>
            ))}
          </div>

          <div
            className="grid min-w-0 flex-1"
            style={{
              gap: 3,
              gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: weeks }).map((_, w) => (
              <span key={`m${w}`} className="flex aspect-square items-center">
                {w % 9 === 1 ? <Block className="h-1.75 w-full" /> : null}
              </span>
            ))}
            {Array.from({ length: weeks * 7 }).map((_, i) => (
              <Block key={i} className="aspect-square rounded-[2px]" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5">
        <Block className="h-2.75 w-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} className="h-2.75 w-2.75 rounded-[2px]" />
        ))}
        <Block className="h-2.75 w-6" />
      </div>
    </section>
  )
}

export function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <Block className="h-3.5 w-24" />
      <div className="mt-5 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Block className="h-2.5 w-20 shrink-0" />
            <Block className="h-2 flex-1" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-md border border-line p-4">
          <Block className="h-3 w-2/5" />
          <Block className="mt-2.5 h-2.5 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export function RepoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-line p-3">
          <Block className="my-1 h-3 w-3/5" />
          <Block className="mt-2.25 mb-0.75 h-2.5 w-2/5" />
        </div>
      ))}
    </div>
  )
}
