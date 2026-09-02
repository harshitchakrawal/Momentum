export const HEATMAP_SCALE = [
  'var(--heat-0)',
  'var(--heat-1)',
  'var(--heat-2)',
  'var(--heat-3)',
  'var(--heat-4)',
] as const

export const ACCENT = 'var(--viz-accent)'

export const DELTA_UP = 'var(--viz-up)'
export const DELTA_DOWN = 'var(--viz-down)'

export function heatLevel(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}
