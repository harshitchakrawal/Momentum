'use client'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default function ProjectsPage() {
  return (
    <>
      <h1 className="text-ink text-2xl font-semibold mb-2">Projects</h1>

      <p className="text-ink-3 text-sm mb-10">
        The repositories you are actively building in, grouped by what they are
        for.
      </p>

      <div className="border border-line-strong border-dashed rounded-lg">
        <Empty>
          <EmptyHeader>
            <EmptyTitle className="text-ink">No projects yet</EmptyTitle>
            <EmptyDescription>
              Projects will be built from your connected repositories, so you
              can follow a piece of work across more than one repo.
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
