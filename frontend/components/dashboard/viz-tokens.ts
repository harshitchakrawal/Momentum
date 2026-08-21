/**
 * Chart colours, validated against this dashboard's own surface (#0a0a0a).
 *
 * The heatmap ramp is a single blue hue, monotone light→dark, and passes the
 * ordinal checks on that surface (steps run 2.44:1 → 7.91:1 contrast).
 * `EMPTY` is deliberately outside the ramp — it means "no data", not "zero on
 * the scale" — and sits at 1.31:1 so the grid reads as structure without
 * competing with real values.
 *
 * Marks wear these. Text never does: labels and values use the ink tokens.
 */

export const HEATMAP_SCALE = [
  '#262626', // no commits
  '#184f95',
  '#256abf',
  '#3987e5',
  '#6da7ec',
] as const

/** Single-series accent for bars. 5.44:1 on #0a0a0a. */
export const ACCENT = '#3987e5'

/** Status colours, paired with an arrow + text so direction is never colour-alone. */
export const DELTA_UP = '#0ca30c'
export const DELTA_DOWN = '#d03b3b'

/** Commits-per-day → ramp index. Fixed thresholds rather than quantiles, so a
 *  quiet week doesn't make one commit look like a busy day. */
export function heatLevel(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}
