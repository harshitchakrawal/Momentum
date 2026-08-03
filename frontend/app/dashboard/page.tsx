'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
  email: string
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

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [repos, setRepos] = useState<Repo[]>([])
  const [reposLoading, setReposLoading] = useState(true)
  const [githubConnected, setGithubConnected] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/auth/me/', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        router.push('/login')
      })
  }, [router])

  useEffect(() => {
    fetch('http://localhost:8000/api/github/repos/', {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          setGithubConnected(false)
          setReposLoading(false)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data)
        }
        setReposLoading(false)
      })
      .catch(() => {
        setGithubConnected(false)
        setReposLoading(false)
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
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12 flex flex-col items-center">
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
              href="http://localhost:8000/api/auth/github/"
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
      </div>
    </main>
  )
}
