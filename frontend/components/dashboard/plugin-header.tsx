'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSWRConfig } from 'swr'
import { ChevronLeftIcon } from '@radix-ui/react-icons'
import { api, startOAuthConnect } from '@/lib/api'

export default function PluginHeader({
  name,
  description,
  connected,
  connectHref,
  disconnectPath,
}: {
  name: string
  description: string
  connected: boolean
  connectHref: string
  disconnectPath: string
}) {
  const { mutate } = useSWRConfig()
  const [disconnecting, setDisconnecting] = useState(false)

  async function handleDisconnect() {
    const confirmed = window.confirm(
      `Disconnect ${name}? Momentum will stop syncing from it.`,
    )
    if (!confirmed) return

    setDisconnecting(true)
    try {
      await api.post(disconnectPath)
      await mutate('/auth/me/')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="mb-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-[13px] text-ink-3 transition-colors hover:text-ink"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Dashboard
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-ink">{name}</h1>
            <span className="flex items-center gap-1.5 rounded-full border border-line-strong px-2.5 py-1 text-[12px] text-ink-2">
              <span
                className={`block h-1.5 w-1.5 rounded-full ${
                  connected ? 'bg-green-400' : 'bg-ink-4'
                }`}
              />
              {connected ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <p className="mt-1.5 max-w-lg text-sm text-ink-3">{description}</p>
        </div>

        {connected ? (
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="shrink-0 rounded-md border border-line-strong px-4 py-2 text-[13px] font-medium text-ink-2 transition-colors hover:border-danger-line hover:text-danger disabled:opacity-50"
          >
            {disconnecting ? 'Disconnecting…' : 'Disconnect'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => startOAuthConnect(connectHref)}
            className="shrink-0 rounded-md bg-invert px-4 py-2 text-[13px] font-semibold text-invert-ink transition-colors hover:bg-invert/90"
          >
            Connect {name}
          </button>
        )}
      </div>
    </div>
  )
}
