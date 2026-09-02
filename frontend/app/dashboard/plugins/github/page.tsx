'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { API_BASE_URL, fetcher } from '@/lib/api'
import { useDashboardUser } from '../../layout'
import {
  countByDay,
  streaks,
  periodComparison,
  activeRepoCount,
} from '@/lib/dashboard-metrics'
import StatTile from '@/components/dashboard/stat-tile'
import ContributionHeatmap from '@/components/dashboard/contribution-heatmap'
import LanguageBreakdown from '@/components/dashboard/language-breakdown'
import PluginHeader from '@/components/dashboard/plugin-header'
import {
  StatTileSkeleton,
  HeatmapSkeleton,
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

const COMMIT_PAGE = 25

export default function GithubPluginPage() {
  const user = useDashboardUser()
  const connected = user?.github_connected ?? false
  const [visible, setVisible] = useState(COMMIT_PAGE)

  const { data: reposData, isLoading: reposLoading } = useSWR<Repo[]>(
    connected ? '/github/repos/' : null,
    fetcher,
  )
  const { data: commitsData, isLoading: commitsLoading } = useSWR<Commit[]>(
    connected ? '/github/commits/' : null,
    fetcher,
  )

  const repos = useMemo(
    () => (Array.isArray(reposData) ? reposData : []),
    [reposData],
  )
  const commits = useMemo(
    () => (Array.isArray(commitsData) ? commitsData : []),
    [commitsData],
  )

  const metrics = useMemo(() => {
    const byDay = countByDay(commits)
    return {
      ...streaks(byDay),
      week: periodComparison(byDay, 7),
      active: activeRepoCount(repos, 30),
    }
  }, [commits, repos])

  const sortedCommits = useMemo(
    () =>
      [...commits].sort(
        (a, b) =>
          new Date(b.author_date).getTime() - new Date(a.author_date).getTime(),
      ),
    [commits],
  )

  const sortedRepos = useMemo(
    () =>
      [...repos].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [repos],
  )

  const loading = reposLoading || commitsLoading

  return (
    <>
      <PluginHeader
        name="GitHub"
        description="Repositories and commit history. Momentum only reads — nothing is written back to your account."
        connected={connected}
        connectHref={`${API_BASE_URL}/api/auth/github/connect/`}
        disconnectPath="/auth/github/disconnect/"
      />

      {!connected ? (
        <div className="rounded-lg border border-line bg-surface p-10 text-center">
          <p className="text-[15px] text-ink">Nothing to report yet</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
            Connect GitHub above and your repositories, commits and streaks will
            appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StatTileSkeleton key={i} />
              ))
            ) : (
              <>
                <StatTile
                  label="Commits this week"
                  value={metrics.week.current}
                  delta={{ value: metrics.week.delta, period: 'last week' }}
                />
                <StatTile
                  label="Current streak"
                  value={metrics.current}
                  unit={metrics.current === 1 ? 'day' : 'days'}
                  hint={`Longest ${metrics.longest}`}
                />
                <StatTile
                  label="Repositories"
                  value={repos.length}
                  hint={`${metrics.active} active in 30 days`}
                />
                <StatTile
                  label="Commits tracked"
                  value={commits.length}
                  hint="All time"
                />
              </>
            )}
          </div>

          <div className="mt-4">
            {loading ? (
              <HeatmapSkeleton />
            ) : (
              <ContributionHeatmap commits={commits} />
            )}
          </div>

          <div className="mt-4">
            {loading ? null : <LanguageBreakdown repos={repos} />}
          </div>

          <section className="mt-4 rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">
                All repositories
              </h2>
              <p className="text-[12px] text-ink-3">
                {repos.length} total · newest first
              </p>
            </div>

            {loading ? (
              <div className="mt-5">
                <ListSkeleton rows={4} />
              </div>
            ) : sortedRepos.length === 0 ? (
              <p className="mt-5 text-[13px] text-ink-3">No repos found.</p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sortedRepos.map((repo) => (
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
                        year: 'numeric',
                      })}
                    </p>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="mt-4 rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">
                Commit history
              </h2>
              <p className="text-[12px] text-ink-3">
                {commits.length} tracked · newest first
              </p>
            </div>

            {loading ? (
              <div className="mt-5">
                <ListSkeleton rows={6} />
              </div>
            ) : sortedCommits.length === 0 ? (
              <p className="mt-5 text-[13px] text-ink-3">No commits found.</p>
            ) : (
              <>
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {sortedCommits.slice(0, visible).map((commit) => (
                    <li key={commit.sha}>
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="-mx-2 block rounded px-2 py-2.5 transition-colors hover:bg-ink/4"
                      >
                        <p className="truncate text-[13px] text-ink-2">
                          {commit.message.split('\n')[0]}
                        </p>
                        <p className="mt-1 text-[11px] text-ink-3">
                          {commit.author_name} ·{' '}
                          {new Date(commit.author_date).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', year: 'numeric' },
                          )}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>

                {visible < sortedCommits.length && (
                  <button
                    type="button"
                    onClick={() => setVisible((n) => n + COMMIT_PAGE)}
                    className="mt-4 w-full rounded-md border border-line py-2 text-[13px] text-ink-3 transition-colors hover:bg-ink/4 hover:text-ink"
                  >
                    Show {Math.min(COMMIT_PAGE, sortedCommits.length - visible)}{' '}
                    more
                  </button>
                )}
              </>
            )}
          </section>
        </>
      )}
    </>
  )
}
