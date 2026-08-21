'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { API_BASE_URL, fetcher } from '@/lib/api'
import { useDashboardUser } from './layout'
import {
  countByDay,
  streaks,
  periodComparison,
  activeRepoCount,
} from '@/lib/dashboard-metrics'
import StatTile from '@/components/dashboard/stat-tile'
import ContributionHeatmap from '@/components/dashboard/contribution-heatmap'
import LanguageBreakdown from '@/components/dashboard/language-breakdown'
import WakatimePanel, { type WakatimeStats } from '@/components/dashboard/wakatime-panel'
import {
  StatTileSkeleton,
  HeatmapSkeleton,
  PanelSkeleton,
  ListSkeleton,
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

/** The lists below the fold are a preview, not an archive. */
const COMMIT_PREVIEW = 8
const REPO_PREVIEW = 6

export default function Dashboard() {
  const user = useDashboardUser()

  // Cached by SWR, so leaving the page and coming back renders from cache
  // instead of re-hitting GitHub.
  const { data: reposData, error: reposError, isLoading: reposLoading } = useSWR<Repo[]>('/github/repos/', fetcher)
  const { data: commitsData, isLoading: commitsLoading } = useSWR<Commit[]>('/github/commits/', fetcher)

  // Passing null as the key tells SWR not to fetch at all — no point asking for
  // stats the user has no token for.
  const { data: wakatime, isLoading: wakatimeLoading } = useSWR<WakatimeStats>(
    user?.wakatime_connected ? '/wakatime/stats/' : null,
    fetcher,
  )

  // The endpoints only fail here when GitHub was never linked.
  const githubConnected = !reposError
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

  const recentCommits = useMemo(
    () =>
      [...commits]
        .sort(
          (a, b) =>
            new Date(b.author_date).getTime() - new Date(a.author_date).getTime(),
        )
        .slice(0, COMMIT_PREVIEW),
    [commits],
  )

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

  if (!reposLoading && !githubConnected) {
    return (
      <>
        <Greeting username={user?.username} email={user?.email} />
        <div className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-10 text-center">
          <p className="text-[15px] text-white">Connect GitHub to get started</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-[#666]">
            Momentum reads your repositories and commit history to build your
            activity timeline. Nothing is written back.
          </p>
          <a
            href={`${API_BASE_URL}/api/auth/github/`}
            className="mt-6 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#e5e5e5]"
          >
            Connect GitHub
          </a>
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

      {/* Summary ------------------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatTileSkeleton key={i} />)
        ) : (
          <>
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
        )}
      </div>

      {/* Trend --------------------------------------------------------- */}
      <div className="mt-4">
        {loading ? <HeatmapSkeleton /> : <ContributionHeatmap commits={commits} />}
      </div>

      {/* Time tracked -------------------------------------------------- */}
      <div className="mt-4">
        {!user?.wakatime_connected ? (
          <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-white">Coding time</h2>
              <p className="text-[12px] text-[#666]">WakaTime</p>
            </div>
            <p className="mt-3 max-w-md text-[13px] text-[#666]">
              Connect WakaTime to see how long you actually spend coding, broken
              down by language and project.
            </p>
            <a
              href={`${API_BASE_URL}/api/wakatime/connect/`}
              className="mt-4 inline-block rounded-md border border-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/4"
            >
              Connect WakaTime
            </a>
          </section>
        ) : wakatimeLoading ? (
          <PanelSkeleton rows={4} />
        ) : wakatime ? (
          <WakatimePanel stats={wakatime} />
        ) : null}
      </div>

      {/* Detail -------------------------------------------------------- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {loading ? <PanelSkeleton /> : <LanguageBreakdown repos={repos} />}
        </div>

        <section className="rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5 lg:col-span-2">
          <h2 className="text-[15px] font-semibold text-white">Recent commits</h2>
          <p className="mt-1 text-[12px] text-[#666]">
            Latest {COMMIT_PREVIEW} across all repositories
          </p>

          {loading ? (
            <div className="mt-5">
              <ListSkeleton rows={4} />
            </div>
          ) : recentCommits.length === 0 ? (
            <p className="mt-5 text-[13px] text-[#666]">No commits found.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-[#161616]">
              {recentCommits.map((commit) => (
                <li key={commit.sha}>
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="-mx-2 block rounded px-2 py-2.5 transition-colors hover:bg-white/4"
                  >
                    <p className="truncate text-[13px] text-[#ddd]">
                      {commit.message.split('\n')[0]}
                    </p>
                    <p className="mt-1 text-[11px] text-[#666]">
                      {commit.author_name} ·{' '}
                      {new Date(commit.author_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] p-5">
        <h2 className="text-[15px] font-semibold text-white">Active repositories</h2>
        <p className="mt-1 text-[12px] text-[#666]">Most recently updated</p>

        {loading ? (
          <div className="mt-5">
            <ListSkeleton rows={3} />
          </div>
        ) : recentRepos.length === 0 ? (
          <p className="mt-5 text-[13px] text-[#666]">No repos found.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recentRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-[#1a1a1a] p-3 transition-colors hover:bg-white/4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-medium text-white">
                    {repo.name}
                  </span>
                  {repo.private && (
                    <span className="shrink-0 rounded border border-[#2a2a2a] px-1.5 py-0.5 text-[10px] text-[#666]">
                      Private
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[11px] text-[#666]">
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
        <h1 className="text-2xl font-semibold text-white">
          Hey, {username} 👋
        </h1>
        {streak > 0 && (
          <span className="rounded-full border border-[#2a2a2a] px-2.5 py-1 text-[12px] text-[#aaa]">
            🔥 {streak} day{streak === 1 ? '' : 's'} in a row
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-[#666]">{email}</p>
    </div>
  )
}
