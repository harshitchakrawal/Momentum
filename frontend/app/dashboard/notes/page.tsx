'use client'

import { PlusIcon } from '@radix-ui/react-icons'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default function NotesPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-ink text-2xl font-semibold">Notes</h1>

        <button
          type="button"
          disabled
          title="Note creation is coming soon"
          className="flex items-center gap-2 bg-invert text-invert-ink text-sm font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4" />
          New note
        </button>
      </div>

      <p className="text-ink-3 text-sm mb-10">
        Scratch notes, decisions and things worth remembering later.
      </p>

      <div className="border border-line-strong border-dashed rounded-lg">
        <Empty>
          <EmptyHeader>
            <EmptyTitle className="text-ink">No notes yet</EmptyTitle>
            <EmptyDescription>
              Write down what you figured out today, so future you doesn&apos;t
              have to work it out again.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <p className="text-ink-4 text-xs">
              Coming soon — this page is a placeholder.
            </p>
          </EmptyContent>
        </Empty>
      </div>
    </>
  )
}
