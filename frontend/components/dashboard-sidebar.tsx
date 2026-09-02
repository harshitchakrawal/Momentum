'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  DashboardIcon,
  CheckboxIcon,
  FileTextIcon,
  LayersIcon,
  BarChartIcon,
  MixIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExitIcon,
} from '@radix-ui/react-icons'
import { api, API_BASE_URL, startOAuthConnect } from '@/lib/api'
import ThemeToggle from '@/components/theme-toggle'

interface SidebarUser {
  username: string
  email: string
  github_connected: boolean
  wakatime_connected: boolean
}

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckboxIcon },
  { label: 'Notes', href: '/dashboard/notes', icon: FileTextIcon },
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
    detailHref: '/dashboard/plugins/github',
  },
  {
    label: 'WakaTime',
    connection: 'wakatime_connected',
    connectHref: `${API_BASE_URL}/api/wakatime/connect/`,
    detailHref: '/dashboard/plugins/wakatime',
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
    disconnected: { color: 'bg-ink-4', label: 'Not connected' },
    soon: { color: 'bg-line-strong', label: 'Coming soon' },
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
  detailHref,
}: {
  label: string
  connected?: boolean
  connectHref?: string
  detailHref?: string
}) {
  const pathname = usePathname()
  const state = !connectHref ? 'soon' : connected ? 'connected' : 'disconnected'
  const active = detailHref !== undefined && pathname === detailHref

  const body = (
    <>
      <span className={`min-w-0 truncate ${active ? 'text-ink' : 'text-ink-3'}`}>
        {label}
      </span>
      <StatusDot state={state} />
    </>
  )

  const className =
    'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors'

  // A connected plugin has a report to open; an unconnected one has an OAuth
  // flow to start. Disconnecting lives on the report page, not one click away.
  if (state === 'connected' && detailHref) {
    return (
      <Link
        href={detailHref}
        title={`${label} — view report`}
        className={`${className} ${active ? 'bg-ink/6' : 'hover:bg-ink/4'}`}
      >
        {body}
      </Link>
    )
  }

  if (state === 'disconnected') {
    return (
      <button
        type="button"
        onClick={() => startOAuthConnect(connectHref!)}
        title={`Connect ${label}`}
        className={`${className} w-full text-left hover:bg-ink/4`}
      >
        {body}
      </button>
    )
  }

  return (
    <div title={`${label} — coming soon`} className={className}>
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
    <aside className="hidden md:flex w-75 shrink-0 flex-col border-r border-line bg-page h-screen sticky top-0">
      <div className="px-5 h-14 flex items-center border-b border-line">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-sans text-md font-semibold tracking-tight text-ink"
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
                  ? 'text-ink bg-ink/6'
                  : 'text-ink-3 hover:text-ink hover:bg-ink/4'
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
          className="mt-1 flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[15px] font-medium text-ink-3 hover:text-ink hover:bg-ink/4 transition-colors"
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
          <div className="mt-0.5 ml-2 flex flex-col gap-0.5 border-l border-line pl-2">
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
                detailHref={
                  'detailHref' in plugin ? plugin.detailHref : undefined
                }
              />
            ))}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-line">
        <div className="flex items-center justify-between px-1">
          <div className="min-w-0">
            <p className="text-[15px] text-ink truncate">{user?.username}</p>
            <p className="text-[13px] text-ink-4 truncate">{user?.email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <ThemeToggle className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink" />
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Log out"
              className="rounded-md p-1.5 text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink disabled:opacity-50"
            >
              <ExitIcon className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
