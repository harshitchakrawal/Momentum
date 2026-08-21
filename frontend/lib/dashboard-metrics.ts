
export interface CommitLike {
  sha: string
  author_date: string
}

export interface RepoLike {
  id: number
  language: string | null
  updated_at: string
}

const DAY_MS = 86_400_000

export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS)
}

export function countByDay(commits: CommitLike[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const commit of commits) {
    const date = new Date(commit.author_date)
    if (Number.isNaN(date.getTime())) continue
    const key = dayKey(date)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

export interface HeatmapCell {
  key: string
  date: Date
  count: number
  /** Days after today — rendered as empty space so the grid keeps its shape. */
  future: boolean
}

export function buildHeatmap(
  commits: CommitLike[],
  weeks = 12,
): { columns: HeatmapCell[][]; byDay: Map<string, number> } {
  const byDay = countByDay(commits)
  const today = startOfDay(new Date())

  // Saturday of the current week, then back up to the Sunday `weeks` ago.
  const lastSaturday = addDays(today, 6 - today.getDay())
  const firstSunday = addDays(lastSaturday, -(weeks * 7 - 1))

  const columns: HeatmapCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const column: HeatmapCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = addDays(firstSunday, w * 7 + d)
      const key = dayKey(date)
      column.push({
        key,
        date,
        count: byDay.get(key) ?? 0,
        future: date.getTime() > today.getTime(),
      })
    }
    columns.push(column)
  }

  return { columns, byDay }
}

/**
 * Current streak counts back from today. A day with no commits yet doesn't
 * break it — the streak only ends once a full day has been missed, which is
 * why an empty today falls through to yesterday.
 */
export function streaks(byDay: Map<string, number>): {
  current: number
  longest: number
} {
  const today = startOfDay(new Date())

  let current = 0
  let cursor = byDay.has(dayKey(today)) ? today : addDays(today, -1)
  while (byDay.has(dayKey(cursor))) {
    current++
    cursor = addDays(cursor, -1)
  }

  const days = [...byDay.keys()].sort()
  let longest = 0
  let run = 0
  let previous: Date | null = null

  for (const key of days) {
    const date = startOfDay(new Date(`${key}T00:00:00`))
    const consecutive =
      previous !== null &&
      Math.round((date.getTime() - previous.getTime()) / DAY_MS) === 1
    run = consecutive ? run + 1 : 1
    longest = Math.max(longest, run)
    previous = date
  }

  return { current, longest }
}

/** Commits in the last `days` days, and in the `days` before that. */
export function periodComparison(
  byDay: Map<string, number>,
  days = 7,
): { current: number; previous: number; delta: number } {
  const today = startOfDay(new Date())

  const sum = (offset: number) => {
    let total = 0
    for (let i = 0; i < days; i++) {
      total += byDay.get(dayKey(addDays(today, -(offset + i)))) ?? 0
    }
    return total
  }

  const current = sum(0)
  const previous = sum(days)
  return { current, previous, delta: current - previous }
}

/** Repos pushed to within `days`. Commits carry no repo reference in the API,
 *  so `updated_at` is what's available to judge activity by. */
export function activeRepoCount(repos: RepoLike[], days = 30): number {
  const cutoff = Date.now() - days * DAY_MS
  return repos.filter((repo) => {
    const t = new Date(repo.updated_at).getTime()
    return !Number.isNaN(t) && t >= cutoff
  }).length
}

export interface LanguageSlice {
  name: string
  count: number
  share: number
}

/**
 * Repos per language, biggest first, with the tail folded into "Other" rather
 * than growing the list — a long tail of one-repo languages reads as noise.
 */
export function languageBreakdown(
  repos: RepoLike[],
  limit = 6,
): LanguageSlice[] {
  const counts = new Map<string, number>()
  for (const repo of repos) {
    if (!repo.language) continue
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const total = sorted.reduce((sum, [, n]) => sum + n, 0)
  if (total === 0) return []

  const head = sorted.slice(0, limit)
  const tail = sorted.slice(limit)
  const rows = head.map(([name, count]) => ({ name, count }))

  const tailTotal = tail.reduce((sum, [, n]) => sum + n, 0)
  if (tailTotal > 0) rows.push({ name: 'Other', count: tailTotal })

  return rows.map((row) => ({ ...row, share: row.count / total }))
}
