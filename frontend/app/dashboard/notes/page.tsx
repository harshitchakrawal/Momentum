'use client'

import NotesWorkspace from '@/components/dashboard/notes-workspace'
import MarkerUnderline from '@/components/dashboard/marker-underline'

export default function NotesPage() {
  return (
    <>
      <h1 className="relative inline-block text-2xl font-semibold text-ink">
        Notes
        <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-ink" />
      </h1>

      <p className="mt-4 mb-8 text-base text-ink-3">
        Scratch notes, decisions and things worth remembering later.
      </p>

      <NotesWorkspace />
    </>
  )
}
