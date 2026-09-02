'use client'

import { useDashboardUser } from '../layout'
import TaskList from '@/components/dashboard/task-list'
import MarkerUnderline from '@/components/dashboard/marker-underline'

export default function TasksPage() {
  const user = useDashboardUser()

  return (
    <>
      <h1 className="relative inline-block text-2xl font-semibold text-ink">
        Tasks
        <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-ink" />
      </h1>

      <p className="mt-1 mb-8 text-sm text-ink-3">
        Everything you&apos;ve planned to ship, in one list.
      </p>

      {user ? <TaskList storageKey={`momentum:tasks:${user.email}`} /> : null}
    </>
  )
}
