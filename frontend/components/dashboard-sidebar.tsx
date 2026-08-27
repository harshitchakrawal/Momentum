'use client'

import { useState } from 'react'
import { useSWRConfig } from 'swr'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  DashboardIcon,
  CheckboxIcon,
  TargetIcon,
  LayersIcon,
  BarChartIcon,
  MixIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExitIcon,
} from '@radix-ui/react-icons'
import { api, API_BASE_URL, startOAuthConnect } from '@/lib/api'

interface SidebarUser {
  username: string
  email: string
  github_connected: boolean
  wakatime_connected: boolean
}

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckboxIcon },
  { label: 'Goals', href: '/dashboard/goals', icon: TargetIcon },
  { label: 'Projects', href: '/dashboard/projects', icon: LayersIcon },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChartIcon },
]

/**
 * `connection` maps the plugin onto the flag the backend already returns.
 * Plugins without one have no backend yet, so they render as "Soon".
 */
const PLUGINS = [
  {
    label: 'GitHub',
    connection: 'github_connected',
    connectHref: `${API_BASE_URL}/api/auth/github/connect/`,
    disconnectPath: '/auth/github/disconnect/',
  },
  {
    label: 'WakaTime',
    connection: 'wakatime_connected',
    connectHref: `${API_BASE_URL}/api/wakatime/connect/`,
    disconnectPath: '/wakatime/disconnect/',
  },
  { label: 'Google Calendar' },
  { label: 'Google Meet' },
  { label: 'Jira' },
  { label: 'Zoom' },
] as const

/**
 * Status is shown as a dot, so each one carries an sr-only label — a bare
 * coloured dot means nothing to a screen reader.
 */
function StatusDot({ state }: { state: 'connected' | 'disconnected' | 'soon' }) {
  const { color, label } = {
    connected: { color: 'bg-green-400', label: 'Connected' },
    disconnected: { color: 'bg-[#555]', label: 'Not connected' },
    soon: { color: 'bg-[#333]', label: 'Coming soon' },
  }[state]

  return (
    <span className="shrink-0">
      <span className={`block h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

function PluginRow({
  label,
  connected,
  connectHref,
  disconnectPath,
}: {
  label: string
  connected?: boolean
  connectHref?: string
  disconnectPath?: string
}) {
  const { mutate } = useSWRConfig()
  const [disconnecting, setDisconnecting] = useState(false)
  const state = !connectHref ? 'soon' : connected ? 'connected' : 'disconnected'

  const body = (
    <>
      <span className="min-w-0 truncate text-[#888]">{label}</span>
      <StatusDot state={state} />
    </>
  )

  const className =
    'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors'

  async function handleDisconnect() {
    const confirmed = window.confirm(
      `Disconnect ${label}? Momentum will stop syncing from it.`,
    )
    if (!confirmed) return

    setDisconnecting(true)
    try {
      await api.post(disconnectPath!)
      await mutate('/auth/me/')
    } finally {
      setDisconnecting(false)
    }
  }

  // Only an unconnected plugin has somewhere to go.
  if (state === 'disconnected') {
    return (
      <button
        type="button"
        onClick={() => startOAuthConnect(connectHref!)}
        title={`Connect ${label}`}
        className={`${className} w-full text-left hover:bg-white/4`}
      >
        {body}
      </button>
    )
  }

  if (state === 'connected' && disconnectPath) {
    return (
      <button
        type="button"
        onClick={handleDisconnect}
        disabled={disconnecting}
        title={`Disconnect ${label}`}
        className={`${className} w-full text-left hover:bg-white/4 disabled:opacity-50`}
      >
        {body}
      </button>
    )
  }

  return (
    <div title={state === 'soon' ? `${label} — coming soon` : `${label} — connected`} className={className}>
      {body}
    </div>
  )
}

export default function DashboardSidebar({ user }: { user: SidebarUser | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const [pluginsOpen, setPluginsOpen] = useState(true)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await api.post('/auth/logout/')
    } finally {
      router.push('/login')
    }
  }

  return (
    <aside className="hidden md:flex w-75 shrink-0 flex-col border-r border-[#1a1a1a] bg-[#0a0a0a] h-screen sticky top-0">
      <div className="px-5 h-14 flex items-center border-b border-[#1a1a1a]">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-sans text-md font-semibold tracking-tight text-white"
        >
          {/* alt is empty on purpose — the wordmark next to it already names the link. */}
          <Image
            src="/momentum_logo.jpg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full object-cover"
          />
          Momentum
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[15px]  transition-colors ${
                active
                  ? 'text-white bg-white/6'
                  : 'text-[#888] hover:text-white hover:bg-white/4'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}

        {/* Plugins — the apps a user can connect to Momentum. */}
        <button
          type="button"
          onClick={() => setPluginsOpen((open) => !open)}
          aria-expanded={pluginsOpen}
          className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[15px] font-medium text-[#888] hover:text-white hover:bg-white/4 transition-colors"
        >
          <MixIcon className="h-4 w-4" />
          Plugins
          {pluginsOpen ? (
            <ChevronDownIcon className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRightIcon className="ml-auto h-4 w-4" />
          )}
        </button>

        {pluginsOpen && (
          <div className="mt-0.5 ml-2 flex flex-col gap-0.5 border-l border-[#1a1a1a] pl-2">
            {PLUGINS.map((plugin) => (
              <PluginRow
                key={plugin.label}
                label={plugin.label}
                connected={
                  'connection' in plugin
                    ? (user?.[plugin.connection] ?? false)
                    : undefined
                }
                connectHref={
                  'connectHref' in plugin ? plugin.connectHref : undefined
                }
                disconnectPath={
                  'disconnectPath' in plugin ? plugin.disconnectPath : undefined
                }
              />
            ))}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-[#1a1a1a]">
        <div className="flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="text-[15px] text-white truncate">{user?.username}</p>
            <p className="text-[13px] text-[#555] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out"
            className="shrink-0 p-1.5 rounded-md text-[#666] hover:text-white hover:bg-white/6 transition-colors disabled:opacity-50"
          >
            <ExitIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
