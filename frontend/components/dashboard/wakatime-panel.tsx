'use client'

import { ACCENT } from './viz-tokens'

/**
 * WakaTime's `stats/last_7_days` payload, narrowed to the fields we render.
 * Everything is optional because the account may have no data for the range.
 */
interface WakatimeEntry {
  name: string
  percent: number
  total_seconds: number
  /** Pre-formatted by WakaTime, e.g. "1 hr 23 mins". */
  text: string
}

export interface WakatimeStats {
  data?: {
    human_readable_total?: string
    human_readable_daily_average?: string
    total_seconds?: number
    languages?: WakatimeEntry[]
    projects?: WakatimeEntry[]
    editors?: WakatimeEntry[]
  }
}

/** Enough rows to see the shape, few enough to stay scannable. */
const ROWS = 5

/**
 * Ranked bars, one hue. The row's name is the identity channel, so colour has
 * no work to do — which is also why there's no legend. Each bar is direct-
 * labelled with WakaTime's own formatted duration rather than a raw number.
 */
function Ranked({
  title,
  rows,
  empty,
}: {
  title: string
  rows: WakatimeEntry[]
  empty: string
}) {
  const top = rows.slice(0, ROWS)
  const max = top.length > 0 ? top[0].total_seconds : 0

  return (
    <div>
      <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#666]">
        {title}
      </h3>

      {top.length === 0 ? (
        <p className="mt-4 text-[13px] text-[#666]">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {top.map((row) => (
            <li
              key={row.name}
              title={`${row.name} — ${row.text} (${row.percent.toFixed(1)}%)`}
              className="flex items-center gap-3"
            >
              <span className="w-24 shrink-0 truncate text-[13px] text-[#aaa]">
                {row.name}
              </span>

              {/* Track keeps every bar on one baseline so lengths compare. */}
              <span className="h-2 min-w-0 flex-1 rounded-[2px] bg-[#161616]">
                <span
                  className="block h-full rounded-r-[4px]"
                  style={{
                    width: `${Math.max((row.total_seconds / max) * 100, 4)}%`,
                    backgroundColor: ACCENT,
                  }}
                />
              </span>

              <span className="w-20 shrink-0 text-right text-[12px] tabular-nums text-[#888]">
                {row.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function WakatimePanel({ stats }: { stats: WakatimeStats }) {
  const data = stats.data ?? {}
  const languages = data.languages ?? []
  const projects = data.projects ?? []

  // A connected account with no tracked time yet is a real state, not an error.
  const hasTime = (data.total_seconds ?? 0) > 0

  return (
    <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold text-white">Coding time</h2>
        <p className="text-[12px] text-[#666]">Last 7 days · WakaTime</p>
      </div>

      {!hasTime ? (
        <p className="mt-5 text-[13px] text-[#666]">
          No time tracked in the last 7 days. Once your editor plugin reports
          activity it will show up here.
        </p>
      ) : (
        <>
          {/* Headline numbers — a total is a single value, so it's a number,
              not a chart. */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <div>
              <p className="text-[26px] font-semibold leading-none text-white">
                {data.human_readable_total ?? '—'}
              </p>
              <p className="mt-1.5 text-[12px] text-[#666]">Total</p>
            </div>
            <div>
              <p className="text-[26px] font-semibold leading-none text-white">
                {data.human_readable_daily_average ?? '—'}
              </p>
              <p className="mt-1.5 text-[12px] text-[#666]">Daily average</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Ranked
              title="Languages"
              rows={languages}
              empty="No languages tracked."
            />
            <Ranked
              title="Projects"
              rows={projects}
              empty="No projects tracked."
            />
          </div>
        </>
      )}
    </section>
  )
}

/** WakaTime's `status_bar/today` payload, narrowed to the grand total. */
export interface WakatimeToday {
  data?: {
    grand_total?: {
      /** Pre-formatted, e.g. "2 hrs 30 mins". */
      text?: string
      total_seconds?: number
    }
  }
}
