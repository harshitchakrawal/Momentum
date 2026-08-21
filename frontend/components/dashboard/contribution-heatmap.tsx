'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { buildHeatmap, type CommitLike, type HeatmapCell } from '@/lib/dashboard-metrics'
import { HEATMAP_SCALE, heatLevel } from './viz-tokens'

/** A full year, like GitHub's contribution graph. */
const WEEKS = 53

/** Floor for a cell. Below this the year stops being readable, so the grid
 *  scrolls instead of shrinking further. */
const MIN_CELL = 11
const GAP = 3

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function describe(cell: HeatmapCell): string {
  const when = cell.date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  if (cell.count === 0) return `No commits on ${when}`
  return `${cell.count} commit${cell.count === 1 ? '' : 's'} on ${when}`
}

export default function ContributionHeatmap({
  commits,
  weeks = WEEKS,
}: {
  commits: CommitLike[]
  weeks?: number
}) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Cells grow to fill whatever width the card gives us, so a year always spans
  // the panel instead of stopping short of it.
  const [cell, setCell] = useState(MIN_CELL)
  const row = cell + GAP

  useEffect(() => {
    const el = gridRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width - (weeks - 1) * GAP
      setCell(Math.max(MIN_CELL, Math.floor(available / weeks)))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [weeks])

  const { columns, total } = useMemo(() => {
    const { columns } = buildHeatmap(commits, weeks)
    const total = columns
      .flat()
      .reduce((sum, cell) => sum + (cell.future ? 0 : cell.count), 0)
    return { columns, total }
  }, [commits, weeks])

  // A year is wider than the panel on most screens, and the interesting end is
  // the recent one — so open scrolled to today rather than a year ago.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [columns])

  // Month label sits above the first column that starts a new month.
  const monthLabels = columns.map((column, i) => {
    const month = column[0].date.getMonth()
    const previous = i === 0 ? null : columns[i - 1][0].date.getMonth()
    return month !== previous ? MONTHS[month] : ''
  })

  return (
    <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-white">Commit activity</h2>
        {/* Hover read-out, anchored here so it can never clip at the grid edge. */}
        <p className="text-[12px] text-[#888]">
          {hovered
            ? describe(hovered)
            : `${total.toLocaleString()} commit${total === 1 ? '' : 's'} in the last year`}
        </p>
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <div className="flex" style={{ gap: GAP * 2 }}>
          {/* Weekday gutter — sticky so it stays put while the year scrolls. */}
          <div
            className="sticky left-0 z-10 grid shrink-0 bg-[#0d0d0d] pr-1"
            style={{ gap: GAP, gridTemplateRows: `repeat(7, ${cell}px)`, paddingTop: row + 2 }}
          >
            {WEEKDAYS.map((day, i) => (
              <span
                key={i}
                className="flex items-center text-[9px] leading-none text-[#555]"
                style={{ height: cell }}
              >
                {day}
              </span>
            ))}
          </div>

          {/* min-w-0 lets this take its width from the card rather than from
              its own contents, which is what the observer measures. */}
          <div ref={gridRef} className="min-w-0 flex-1">
            <div className="flex" style={{ gap: GAP, height: row }}>
              {monthLabels.map((label, i) => (
                <span
                  key={i}
                  className="text-[9px] leading-none text-[#555]"
                  style={{ width: cell }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="flex" style={{ gap: GAP }} onMouseLeave={() => setHovered(null)}>
              {columns.map((column, w) => (
                <div
                  key={w}
                  className="grid"
                  style={{ gap: GAP, gridTemplateRows: `repeat(7, ${cell}px)` }}
                >
                  {column.map((day) =>
                    day.future ? (
                      <span key={day.key} style={{ width: cell, height: cell }} />
                    ) : (
                      <span
                        key={day.key}
                        title={describe(day)}
                        onMouseEnter={() => setHovered(day)}
                        className="rounded-[2px] transition-transform hover:scale-125"
                        style={{
                          width: cell,
                          height: cell,
                          backgroundColor: HEATMAP_SCALE[heatLevel(day.count)],
                        }}
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[#555]">
        <span>Less</span>
        {HEATMAP_SCALE.map((color) => (
          <span
            key={color}
            className="rounded-[2px]"
            style={{ width: MIN_CELL, height: MIN_CELL, backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  )
}
