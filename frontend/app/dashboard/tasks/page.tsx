'use client'

import { PlusIcon } from '@radix-ui/react-icons'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default function TasksPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Tasks</h1>

        <button
          type="button"
          disabled
          title="Task creation is coming soon"
          className="flex items-center gap-2 bg-[#e5e5e5] text-[#0a0a0a] text-sm font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4" />
          New task
        </button>
      </div>

      <p className="text-[#666] text-sm mb-10">
        Everything you&apos;ve planned to ship, in one list.
      </p>

      <div className="border border-[#222] border-dashed rounded-lg">
        <Empty>
          <EmptyHeader>
            <EmptyTitle className="text-white">No tasks yet</EmptyTitle>
            <EmptyDescription>
              Once the tasks API is wired up, everything you create will show up
              here.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-[#555] text-xs">
              Coming soon — this page is a placeholder.
            </p>
          </EmptyContent>
        </Empty>
      </div>
    </>
  )
}
