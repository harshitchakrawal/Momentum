'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardIcon, GitHubLogoIcon, ClockIcon, ExitIcon } from '@radix-ui/react-icons'
import { api, API_BASE_URL } from '@/lib/api'

interface SidebarUser {
  username: string
  email: string
  github_connected: boolean
  wakatime_connected: boolean
}

function ConnectionRow({
  label,
  connected,
  connectHref,
  icon,
}: {
  label: string
  connected: boolean
  connectHref: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 text-[13px]">
      <span className="flex items-center gap-2 text-[#888]">
        {icon}
        {label}
      </span>
      {connected ? (
        <span className="text-[11px] text-green-400">Connected</span>
      ) : (
        <a href={connectHref} className="text-[11px] text-[#666] hover:text-white transition-colors">
          Connect
        </a>
      )}
    </div>
  )
}

export default function DashboardSidebar({ user }: { user: SidebarUser | null }) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.post('/auth/logout/')
    } finally {
      router.push('/login')
    }
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] h-screen sticky top-0">
      <div className="px-5 h-14 flex items-center border-b border-[#1a1a1a]">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          Momentum
        </Link>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-white bg-white/[0.06]">
          <DashboardIcon className="h-3.5 w-3.5" />
          Dashboard
        </div>
      </nav>

      <div className="p-3 border-t border-[#1a1a1a]">
        <p className="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#555]">
          Connections
        </p>
        <ConnectionRow
          label="GitHub"
          connected={user?.github_connected ?? false}
          connectHref={`${API_BASE_URL}/api/auth/github/`}
          icon={<GitHubLogoIcon className="h-3.5 w-3.5" />}
        />
        <ConnectionRow
          label="WakaTime"
          connected={user?.wakatime_connected ?? false}
          connectHref={`${API_BASE_URL}/api/wakatime/connect/`}
          icon={<ClockIcon className="h-3.5 w-3.5" />}
        />
      </div>

      <div className="p-3 border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="text-[13px] text-white truncate">{user?.username}</p>
            <p className="text-[11px] text-[#555] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out"
            className="shrink-0 p-1.5 rounded-md text-[#666] hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            <ExitIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
