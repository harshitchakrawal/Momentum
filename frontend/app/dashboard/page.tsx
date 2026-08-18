'use client'

import useSWR from 'swr'
import { API_BASE_URL, fetcher } from '@/lib/api'
import { useDashboardUser } from './layout'

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

export default function Dashboard() {
  const user = useDashboardUser()

  // Cached by SWR, so leaving the page and coming back renders from cache
  // instead of re-hitting GitHub.
  const { data: reposData, error: reposError, isLoading: reposLoading } = useSWR<Repo[]>('/github/repos/', fetcher)
  const { data: commitsData, isLoading: commitsLoading } = useSWR<Commit[]>('/github/commits/', fetcher)

  // The endpoints only fail here when GitHub was never linked.
  const githubConnected = !reposError
  const repos = Array.isArray(reposData) ? reposData : []
  const commits = Array.isArray(commitsData) ? commitsData : []

  return (
    <>
      <h1 className="text-white text-2xl font-semibold mb-2">
        Hey, {user?.username} 👋
      </h1>
      <p className="text-[#666] text-sm mb-10">{user?.email}</p>

      <h2 className="text-white text-lg font-semibold mb-4">Your GitHub Repos</h2>

      {reposLoading && <p className="text-[#666] text-sm">Loading repos...</p>}

      {!reposLoading && !githubConnected && (
        <div className="border border-[#222] rounded-md p-6 text-center">
          <p className="text-[#666] text-sm mb-4">GitHub account not connected.</p>
          <a
            href={`${API_BASE_URL}/api/auth/github/`}
            className="inline-block bg-white text-[#0a0a0a] text-sm font-semibold py-2 px-4 rounded-md hover:bg-[#e5e5e5] transition-colors"
          >
            Connect GitHub
          </a>
        </div>
      )}

      {!reposLoading && githubConnected && repos.length === 0 && (
        <p className="text-[#666] text-sm">No repos found.</p>
      )}

      {!reposLoading && githubConnected && repos.length > 0 && (
        <div className="flex flex-col gap-3">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="border border-[#222] rounded-md p-4 hover:bg-[#111] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">{repo.name}</span>
                {repo.private && (
                  <span className="text-[#555] text-xs border border-[#333] rounded px-2 py-0.5">
                    Private
                  </span>
                )}
              </div>
              <p className="text-[#666] text-xs mt-1">
                {repo.language ?? 'Unknown'} · Updated{' '}
                {new Date(repo.updated_at).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}

      <h2 className="text-white text-lg font-semibold mt-10 mb-4">Recent Commits</h2>

      {commitsLoading && <p className="text-[#666] text-sm">Loading commits...</p>}

      {!commitsLoading && commits.length === 0 && (
        <p className="text-[#666] text-sm">No commits found.</p>
      )}

      {!commitsLoading && commits.length > 0 && (
        <div className="flex flex-col gap-3">
          {commits.map((commit) => (
            <a
              key={commit.sha}
              href={commit.html_url}
              target="_blank"
              rel="noreferrer"
              className="border border-[#222] rounded-md p-4 hover:bg-[#111] transition-colors"
            >
              <p className="text-white text-sm">{commit.message}</p>
              <p className="text-[#666] text-xs mt-1">
                {commit.author_name} ·{' '}
                {new Date(commit.author_date).toLocaleString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </>
  )
}
