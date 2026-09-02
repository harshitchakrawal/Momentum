'use client'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export default function AnalyticsPage() {
  return (
    <>
      <h1 className="text-ink text-2xl font-semibold mb-2">Analytics</h1>

      <p className="text-ink-3 text-sm mb-10">
        Commits, coding hours and streaks over time — the trend, not just
        today.
      </p>

      <div className="border border-line-strong border-dashed rounded-lg">
        <Empty>
          <EmptyHeader>
            <EmptyTitle className="text-ink">Nothing to chart yet</EmptyTitle>
            <EmptyDescription>
              Once there is enough history from GitHub and WakaTime, this page
              will show how your output moves week to week.
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
