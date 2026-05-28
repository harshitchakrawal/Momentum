'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  githubId: string | null;
}

interface Repo {
  id: number;
  name: string;
  language: string | null;
  updatedAt: string;
  url: string;
}

interface Commit {
  sha: string;
  message: string;
  repo: string;
  date: string;
  url: string;
}

interface WakaStats {
  totalSeconds: number;
  dailyAverage: number;
  languages: { name: string; hours: number; minutes: number; percent: number }[];
  projects: { name: string; hours: number; minutes: number }[];
}

const API = 'http://localhost:3001';

function apiFetch(path: string, token: string) {
  return fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => res.json());
}

function formatSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [wakaStats, setWakaStats] = useState<WakaStats | null>(null);
  const [wakaConnected, setWakaConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/'); return; }

    if (searchParams.get('wakatime') === 'connected') {
      setWakaConnected(true);
    }

    Promise.all([
      apiFetch('/user/me', token),
      apiFetch('/github/repos', token),
      apiFetch('/github/commits', token),
    ]).then(([userData, reposData, commitsData]) => {
      setUser(userData);
      setRepos(reposData);
      setCommits(commitsData);
      setLoading(false);

      // Try fetching WakaTime stats
      apiFetch('/auth/wakatime/stats', token).then((data) => {
        if (!data.error) {
          setWakaStats(data);
          setWakaConnected(true);
        }
      });
    }).catch(() => router.push('/'));
  }, [router, searchParams]);

  function connectWakaTime() {
    const token = localStorage.getItem('token');
    window.location.href = `${API}/auth/wakatime?token=${token}`;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {user?.avatarUrl && (
            <img src={user.avatarUrl} alt="avatar" className="w-12 h-12 rounded-full" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">Hey, {user?.name} 👋</h1>
            <p className="text-gray-400 text-sm">Here's your dev activity</p>
          </div>
        </div>

        {!wakaConnected && (
          <button
            onClick={connectWakaTime}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Connect WakaTime
          </button>
        )}
        {wakaConnected && (
          <span className="text-green-400 text-sm font-medium">✓ WakaTime connected</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Commits (7 days)</p>
          <p className="text-3xl font-bold text-white mt-1">{commits.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Active Repos</p>
          <p className="text-3xl font-bold text-white mt-1">{repos.length}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Coding Time (7 days)</p>
          <p className="text-3xl font-bold text-white mt-1">
            {wakaStats ? formatSeconds(wakaStats.totalSeconds) : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Recent Commits */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Commits</h2>
          <div className="space-y-3">
            {commits.slice(0, 6).map((commit) => (
              <a key={commit.sha} href={commit.url} target="_blank" rel="noreferrer"
                className="block hover:bg-gray-800 rounded-lg p-2 -mx-2 transition">
                <p className="text-white text-sm truncate">{commit.message}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {commit.repo} · {new Date(commit.date).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        </div>

        {/* Repos */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Recent Repos</h2>
          <div className="space-y-3">
            {repos.slice(0, 6).map((repo) => (
              <a key={repo.id} href={repo.url} target="_blank" rel="noreferrer"
                className="block hover:bg-gray-800 rounded-lg p-2 -mx-2 transition">
                <p className="text-white text-sm">{repo.name}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {repo.language ?? 'Unknown'} · {new Date(repo.updatedAt).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* WakaTime Stats */}
      {wakaStats && (
        <div className="grid grid-cols-2 gap-6">
          {/* Languages */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Top Languages</h2>
            <div className="space-y-3">
              {wakaStats.languages.map((lang) => (
                <div key={lang.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{lang.name}</span>
                    <span className="text-gray-400">{lang.hours}h {lang.minutes}m</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full">
                    <div
                      className="h-1.5 bg-blue-500 rounded-full"
                      style={{ width: `${lang.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">Top Projects</h2>
            <div className="space-y-3">
              {wakaStats.projects.map((project) => (
                <div key={project.name} className="flex justify-between">
                  <span className="text-white text-sm">{project.name}</span>
                  <span className="text-gray-400 text-sm">{project.hours}h {project.minutes}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
