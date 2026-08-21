import { languageBreakdown, type RepoLike } from '@/lib/dashboard-metrics'
import { ACCENT } from './viz-tokens'

/**
 * Ranked bars, one hue. The language name is the identity channel, so colour
 * has no work to do here — which also keeps it out of CVD trouble. A single
 * series needs no legend; the subtitle says what's plotted.
 */
export default function LanguageBreakdown({ repos }: { repos: RepoLike[] }) {
  const rows = languageBreakdown(repos)
  const max = rows.length > 0 ? rows[0].count : 0

  return (
    <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
      <h2 className="text-[15px] font-semibold text-white">Languages</h2>
      <p className="mt-1 text-[12px] text-[#666]">Repositories per language</p>

      {rows.length === 0 ? (
        <p className="mt-5 text-[13px] text-[#666]">
          No languages detected yet.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate text-[13px] text-[#aaa]">
                {row.name}
              </span>

              {/* Track keeps every bar on one baseline so lengths compare. */}
              <span className="h-2 min-w-0 flex-1 rounded-[2px] bg-[#161616]">
                <span
                  className="block h-full rounded-r-[4px]"
                  style={{
                    width: `${Math.max((row.count / max) * 100, 4)}%`,
                    backgroundColor: ACCENT,
                  }}
                />
              </span>

              <span className="w-8 shrink-0 text-right text-[12px] tabular-nums text-[#888]">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
