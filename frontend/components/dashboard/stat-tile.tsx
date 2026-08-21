import { DELTA_UP, DELTA_DOWN } from './viz-tokens'

/** Compact large numbers so a tile never wraps: 1,284 → 1,284 · 12900 → 12.9K */
function formatValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

export interface StatTileProps {
  label: string
  value: number
  /** Unit shown after the value, e.g. "days". */
  unit?: string
  delta?: {
    value: number
    /** Named period the delta is measured against, e.g. "last week". */
    period: string
  }
  /** Shown instead of a delta — a static bit of context. */
  hint?: string
}

export default function StatTile({
  label,
  value,
  unit,
  delta,
  hint,
}: StatTileProps) {
  const direction = delta ? Math.sign(delta.value) : 0
  const deltaColor =
    direction > 0 ? DELTA_UP : direction < 0 ? DELTA_DOWN : '#666'

  return (
    <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3.5">
      <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666]">
        {label}
      </p>

      {/* Proportional figures on purpose — tabular-nums makes a large standalone
          number look loose. Tabular is for columns, not headline values. */}
      <p className="mt-2 flex items-baseline gap-1.5 text-[26px] font-semibold leading-none text-white">
        {formatValue(value)}
        {unit && (
          <span className="text-[13px] font-normal text-[#666]">{unit}</span>
        )}
      </p>

      {delta && (
        <p className="mt-2 text-[12px]" style={{ color: deltaColor }}>
          {/* Arrow + words, so direction never rests on colour alone. */}
          <span aria-hidden="true">
            {direction > 0 ? '↑' : direction < 0 ? '↓' : '→'}
          </span>{' '}
          {direction > 0 ? '+' : ''}
          {delta.value} <span className="text-[#666]">vs {delta.period}</span>
        </p>
      )}

      {!delta && hint && <p className="mt-2 text-[12px] text-[#666]">{hint}</p>}
    </div>
  )
}
