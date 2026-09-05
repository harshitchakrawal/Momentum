'use client'

import { Suspense, useMemo } from 'react'
import useSWR from 'swr'
import { useSearchParams } from 'next/navigation'
import { API_BASE_URL, fetcher, startOAuthConnect } from '@/lib/api'
import { useDashboardUser } from './layout'
import {
  countByDay,
  streaks,
  periodComparison,
  activeRepoCount,
} from '@/lib/dashboard-metrics'
import StatTile from '@/components/dashboard/stat-tile'
import ContributionHeatmap from '@/components/dashboard/contribution-heatmap'
import {
  type WakatimeStats,
  type WakatimeToday,
} from '@/components/dashboard/wakatime-panel'
import {
  StatTileSkeleton,
  HeatmapSkeleton,
  RepoGridSkeleton,
} from '@/components/dashboard/skeleton'

interface Repo {
  id: number
  name: string
  full_name: string
  html_url: string
  language: string | null
  updated_at: string
  private: boolean
}

interface Commit {
  sha: string
  html_url: string
  message: string
  author_name: string
  author_date: string
}

/** The list below the fold is a preview, not an archive. */
const REPO_PREVIEW = 6

export default function Dashboard() {
  const user = useDashboardUser()

  // Cached by SWR, so leaving the page and coming back renders from cache
  // instead of re-hitting GitHub.
  const {
    data: reposData,
    error: reposError,
    isLoading: reposLoading,
    mutate: retryRepos,
  } = useSWR<Repo[]>(user?.github_connected ? '/github/repos/' : null, fetcher)
  const { data: commitsData, isLoading: commitsLoading } = useSWR<Commit[]>(
    user?.github_connected ? '/github/commits/' : null,
    fetcher,
  )

  // Passing null as the key tells SWR not to fetch at all — no point asking for
  // stats the user has no token for.
  const { data: wakatime } = useSWR<WakatimeStats>(
    user?.wakatime_connected ? '/wakatime/stats/' : null,
    fetcher,
  )
  const { data: todayData } = useSWR<WakatimeToday>(
    user?.wakatime_connected ? '/wakatime/today/' : null,
    fetcher,
  )

  // Hours as a short decimal — "2.5 hrs" fits a tile, "2 hrs 30 mins" does not.
  // The exact wording still shows as the hint underneath.
  const todayTotal = todayData?.data?.grand_total

  const weekSeconds = wakatime?.data?.total_seconds
  const weekHours =
    weekSeconds != null ? Math.round((weekSeconds / 3600) * 10) / 10 : null
  const dailyAverageHours =
    weekSeconds != null ? Math.round((weekSeconds / 7 / 3600) * 10) / 10 : null

  const githubConnected = user?.github_connected ?? false
  const repos = useMemo(() => (Array.isArray(reposData) ? reposData : []), [reposData])
  const commits = useMemo(() => (Array.isArray(commitsData) ? commitsData : []), [commitsData])

  const metrics = useMemo(() => {
    const byDay = countByDay(commits)
    return {
      byDay,
      ...streaks(byDay),
      week: periodComparison(byDay, 7),
      active: activeRepoCount(repos, 30),
    }
  }, [commits, repos])

  const recentRepos = useMemo(
    () =>
      [...repos]
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        .slice(0, REPO_PREVIEW),
    [repos],
  )

  const loading = reposLoading || commitsLoading

  if (!githubConnected) {
    return (
      <>
        <Greeting username={user?.username} email={user?.email} />
        <Suspense fallback={null}>
          <ConnectAlert />
        </Suspense>
        <div className="rounded-lg border border-line bg-surface p-10 text-center">
          <p className="text-[15px] text-ink">Connect GitHub to get started</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
            Momentum reads your repositories and commit history to build your
            activity timeline. Nothing is written back.
          </p>
          <button
            type="button"
            onClick={() =>
              startOAuthConnect(`${API_BASE_URL}/api/auth/github/connect/`)
            }
            className="mt-6 inline-block rounded-md bg-invert px-4 py-2 text-sm font-semibold text-invert-ink transition-colors hover:bg-invert/90"
          >
            Connect GitHub
          </button>
        </div>
      </>
    )
  }

  if (reposError) {
    return (
      <>
        <Greeting username={user?.username} email={user?.email} />
        <div className="rounded-lg border border-line bg-surface p-10 text-center">
          <p className="text-[15px] text-ink">GitHub isn&apos;t responding</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
            Your account is still connected — GitHub just didn&apos;t answer in
            time. This usually clears up on its own.
          </p>
          <button
            type="button"
            onClick={() => retryRepos()}
            className="mt-6 inline-block rounded-md bg-invert px-4 py-2 text-sm font-semibold text-invert-ink transition-colors hover:bg-invert/90"
          >
            Try again
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Greeting
        username={user?.username}
        email={user?.email}
        streak={loading ? 0 : metrics.current}
      />

      <Suspense fallback={null}>
        <ConnectAlert />
      </Suspense>

      {/* Summary ------------------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatTileSkeleton key={i} />)
        ) : (
          <>
            {!user?.wakatime_connected ? (
              // No WakaTime, no hours to show — keep both slots useful.
              <>
                <StatTile
                  label="Active repos"
                  value={metrics.active}
                  hint={`of ${repos.length} total`}
                />
                <StatTile
                  label="Commits tracked"
                  value={commits.length}
                  hint="All time"
                />
              </>
            ) : (
              <>
                <StatTile
                  label="Coding time"
                  value={weekHours ?? 0}
                  unit="hrs"
                  hint={`Today ${todayTotal?.text ?? 'nothing yet'}`}
                />
                <StatTile
                  label="Daily average"
                  value={dailyAverageHours ?? 0}
                  unit="hrs"
                  hint="Last 7 days"
                />
              </>
            )}
            <StatTile
              label="Commits this week"
              value={metrics.week.current}
              delta={{ value: metrics.week.delta, period: 'last week' }}
            />
            <StatTile
              label="Current Github streak"
              value={metrics.current}
              unit={metrics.current === 1 ? 'day' : 'days'}
              hint={`Longest ${metrics.longest}`}
            />
          </>
        )}
      </div>

      {/* Trend --------------------------------------------------------- */}
      <div className="mt-4">
        {loading ? <HeatmapSkeleton /> : <ContributionHeatmap commits={commits} />}
      </div>

      {/* Time tracked -------------------------------------------------- */}
      <div className="mt-4">
        {!user?.wakatime_connected ? (
          <section className="rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">Coding time</h2>
              <p className="text-[12px] text-ink-3">WakaTime</p>
            </div>
            <p className="mt-3 max-w-md text-[13px] text-ink-3">
              Connect WakaTime to see how long you actually spend coding, broken
              down by language and project.
            </p>
            <button
              type="button"
              onClick={() =>
                startOAuthConnect(`${API_BASE_URL}/api/wakatime/connect/`)
              }
              className="mt-4 inline-block rounded-md border border-line-strong px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-ink/4"
            >
              Connect WakaTime
            </button>
          </section>
        ) : null}
      </div>

      <section className="mt-4 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-[15px] font-semibold text-ink">Active repositories</h2>
        <p className="mt-1 text-[12px] text-ink-3">Most recently updated</p>

        {loading ? (
          <div className="mt-4">
            <RepoGridSkeleton count={REPO_PREVIEW} />
          </div>
        ) : recentRepos.length === 0 ? (
          <p className="mt-5 text-[13px] text-ink-3">No repos found.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recentRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line p-3 transition-colors hover:bg-ink/4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-ink">
                    {repo.name}
                  </span>
                  {repo.private && (
                    <span className="shrink-0 rounded border border-line-strong px-1.5 py-0.5 text-[10px] text-ink-3">
                      Private
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-ink-3">
                  {repo.language ?? 'Unknown'} ·{' '}
                  {new Date(repo.updated_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

const CONNECT_ERRORS: Record<string, string> = {
  invalid_state:
    'That connection attempt expired before it finished. Please try again.',
  github_already_linked:
    'That GitHub account is already linked to another Momentum account. Disconnect it there first.',
  github_failed: 'Could not reach GitHub. Please try again in a moment.',
  wakatime_failed: 'Could not reach WakaTime. Please try again in a moment.',
}

function ConnectAlert() {
  const error = useSearchParams().get('error')
  const message = error ? CONNECT_ERRORS[error] : null

  if (!message) return null

  return (
    <div className="mb-4 rounded-lg border border-danger-line bg-danger-bg px-4 py-3">
      <p className="text-[13px] text-danger">{message}</p>
    </div>
  )
}

function Greeting({
  username,
  email,
  streak = 0,
}: {
  username?: string
  email?: string
  streak?: number
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-ink">
          Hey, {username} 👋
        </h1>
        {streak > 0 && (
          <span className="rounded-full border border-line-strong px-2.5 py-1 text-[12px] text-ink-2">
            🔥 {streak} day{streak === 1 ? '' : 's'} in a row
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-3">{email}</p>
    </div>
  )
}
