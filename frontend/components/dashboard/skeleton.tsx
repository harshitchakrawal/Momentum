/**
 * Loading placeholders shaped like the content they stand in for, so the page
 * doesn't reflow when data lands. `animate-pulse` is suppressed for anyone who
 * asked for reduced motion.
 */

function Block({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block rounded bg-[#161616] motion-safe:animate-pulse ${className}`}
    />
  )
}

export function StatTileSkeleton() {
  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3.5">
      <Block className="h-2.5 w-20" />
      <Block className="mt-3.5 h-6 w-14" />
      <Block className="mt-3 h-2.5 w-24" />
    </div>
  )
}

export function HeatmapSkeleton({ weeks = 53 }: { weeks?: number }) {
  return (
    <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <Block className="h-3.5 w-32" />
      {/* Same 11px cell / 3px gap geometry as the real grid, so nothing shifts. */}
      <div className="mt-6 flex overflow-hidden" style={{ gap: 3 }}>
        {Array.from({ length: weeks }).map((_, w) => (
          <div
            key={w}
            className="grid shrink-0"
            style={{ gap: 3, gridTemplateRows: 'repeat(7, 11px)', width: 11 }}
          >
            {Array.from({ length: 7 }).map((_, d) => (
              <Block key={d} className="rounded-[2px]" />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export function PanelSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
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
        <div key={i} className="rounded-md border border-[#1a1a1a] p-4">
          <Block className="h-3 w-2/5" />
          <Block className="mt-2.5 h-2.5 w-1/4" />
        </div>
      ))}
    </div>
  )
}
