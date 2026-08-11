'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, API_BASE_URL } from '@/lib/api'
import DashboardSidebar from '@/components/dashboard-sidebar'

interface User {
  id: number
  username: string
  email: string
  github_connected: boolean
  wakatime_connected: boolean
}

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
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [repos, setRepos] = useState<Repo[]>([])
  const [reposLoading, setReposLoading] = useState(true)
  const [githubConnected, setGithubConnected] = useState(true)

  const [commits, setCommits] = useState<Commit[]>([])
  const [commitsLoading, setCommitsLoading] = useState(true)

  useEffect(() => {
    api
      .get('/auth/me/')
      .then((res) => {
        setUser(res.data)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  useEffect(() => {
    api
      .get('/github/repos/')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRepos(res.data)
        }
        setReposLoading(false)
      })
      .catch(() => {
        setGithubConnected(false)
        setReposLoading(false)
      })
  }, [])

  useEffect(() => {
    api
      .get('/github/commits/')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCommits(res.data)
        }
        setCommitsLoading(false)
      })
      .catch(() => {
        setCommitsLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666]">Loading...</p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar user={user} />
      <main className="flex-1 px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-2xl">
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
      </div>
      </main>
    </div>
  )
}
