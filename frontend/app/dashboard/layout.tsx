'use client'

import useSWR from 'swr'

import { createContext, useContext } from 'react'
import Link from 'next/link'
import { fetcher } from '@/lib/api'
import DashboardSidebar from '@/components/dashboard-sidebar'

export interface DashboardUser {
  id: number
  username: string
  email: string
  github_connected: boolean
  wakatime_connected: boolean
}

const UserContext = createContext<DashboardUser | null>(null)

/** The signed-in user, fetched once by the dashboard layout. */
export function useDashboardUser() {
  return useContext(UserContext)
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // SWR keeps this in a module-level cache, so navigating away and back
  // re-renders instantly instead of dropping to a loading screen.
  const { data: user, error, isLoading } = useSWR<DashboardUser>('/auth/me/', fetcher)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#666]">Loading...</p>
      </main>
    )
  }

  // A dead session is already redirected to /login by the axios interceptor.
  // This covers whatever it doesn't, so the user never sees a blank screen.
  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-[#666] text-sm">Your session has expired.</p>
        <Link
          href="/login"
          className="bg-[#e5e5e5] hover:bg-white text-[#0a0a0a] text-sm font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Log in again
        </Link>
      </main>
    )
  }

  return (
    <UserContext.Provider value={user}>
      <div className="min-h-screen bg-[#0a0a0a] flex">
        <DashboardSidebar user={user} />
        <main className="flex-1 px-6 md:px-10 py-12 flex flex-col items-center">
          <div className="w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </UserContext.Provider>
  )
}
