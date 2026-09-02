'use client'

import useSWR from 'swr'
import { API_BASE_URL, fetcher } from '@/lib/api'
import { useDashboardUser } from '../../layout'
import StatTile from '@/components/dashboard/stat-tile'
import PluginHeader from '@/components/dashboard/plugin-header'
import {
  Ranked,
  type WakatimeStats,
  type WakatimeToday,
} from '@/components/dashboard/wakatime-panel'
import { StatTileSkeleton, PanelSkeleton } from '@/components/dashboard/skeleton'

const FULL_LIST = 20

export default function WakatimePluginPage() {
  const user = useDashboardUser()
  const connected = user?.wakatime_connected ?? false

  const { data: stats, isLoading } = useSWR<WakatimeStats>(
    connected ? '/wakatime/stats/' : null,
    fetcher,
  )
  const { data: today } = useSWR<WakatimeToday>(
    connected ? '/wakatime/today/' : null,
    fetcher,
  )

  const data = stats?.data ?? {}
  const languages = data.languages ?? []
  const projects = data.projects ?? []
  const editors = data.editors ?? []

  const todayTotal = today?.data?.grand_total
  const todayHours =
    todayTotal?.total_seconds != null
      ? Math.round((todayTotal.total_seconds / 3600) * 10) / 10
      : null

  const weekHours =
    data.total_seconds != null
      ? Math.round((data.total_seconds / 3600) * 10) / 10
      : null

  const dailyAverageHours =
    data.total_seconds != null
      ? Math.round((data.total_seconds / 7 / 3600) * 10) / 10
      : null

  const hasTime = (data.total_seconds ?? 0) > 0

  return (
    <>
      <PluginHeader
        name="WakaTime"
        description="Time actually spent in your editor, broken down by language, project and tool."
        connected={connected}
        connectHref={`${API_BASE_URL}/api/wakatime/connect/`}
        disconnectPath="/wakatime/disconnect/"
      />

      {!connected ? (
        <div className="rounded-lg border border-line bg-surface p-10 text-center">
          <p className="text-[15px] text-ink">Nothing to report yet</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
            Connect WakaTime above to see how long you spend coding and where
            that time goes.
          </p>
        </div>
      ) : isLoading ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatTileSkeleton key={i} />
            ))}
          </div>
          <div className="mt-4">
            <PanelSkeleton rows={5} />
          </div>
        </>
      ) : !hasTime ? (
        <div className="rounded-lg border border-line bg-surface p-10 text-center">
          <p className="text-[15px] text-ink">No time tracked yet</p>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
            Your account is connected, but nothing was recorded in the last 7
            days. Once your editor plugin reports activity it will show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile
              label="Coding today"
              value={todayHours ?? 0}
              unit="hrs"
              hint={todayTotal?.text ?? 'Nothing tracked yet'}
            />
            <StatTile
              label="Last 7 days"
              value={weekHours ?? 0}
              unit="hrs"
              hint={data.human_readable_total ?? '—'}
            />
            <StatTile
              label="Daily average"
              value={dailyAverageHours ?? 0}
              unit="hrs"
              hint={data.human_readable_daily_average ?? 'Last 7 days'}
            />
          </div>

          <section className="mt-4 rounded-lg border border-line bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">
                Where the time went
              </h2>
              <p className="text-[12px] text-ink-3">Last 7 days</p>
            </div>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <Ranked
                title={`Languages (${languages.length})`}
                rows={languages}
                empty="No languages tracked."
                limit={FULL_LIST}
              />
              <Ranked
                title={`Projects (${projects.length})`}
                rows={projects}
                empty="No projects tracked."
                limit={FULL_LIST}
              />
            </div>

            <div className="mt-8">
              <Ranked
                title={`Editors (${editors.length})`}
                rows={editors}
                empty="No editors tracked."
                limit={FULL_LIST}
              />
            </div>
          </section>
        </>
      )}
    </>
  )
}
